import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {serverBaseUrl} from "./functions/baseUrls";
import {
    setSessionVariable,
    fetchDataIfNeeded
} from './actions/actions';
import {getUrlData, dynamicSort, pushHistory} from "./functions/componentActions";
import FormModal from "./components/FormModal";
import {Button, Fab, Box, Tooltip, IconButton} from "@material-ui/core";
import MaterialTable from 'material-table';
import FormAddClient from "./client/FormAddClient";
import FormIssueLoan from "./loan/FormIssueLoan";
import FormApproveDisburseLoan from "./loan/FormApproveDisburseLoan";
import {Edit, Add, Check, Payment, AccountBalance} from '@material-ui/icons';
import FormAddPayment from "./payment/FormAddPayment";

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected_client: {},
            add_client_dialogue_open: false,
            issue_loan_dialogue_open: false,
            approve_loan_dialogue_open: false,
            disburse_loan_dialogue_open: false,
            add_payment_dialogue_open: false
        }
    }

    componentDidMount() {
        this.fetchUrlData('clients_url', '/registration/members/');
        this.fetchUrlData('loan_products_url', '/products/loans/');
        this.fetchUrlData('chart_of_accounts_url', '/registration/chart_accounts/');
        this.fetchUrlData('banks_url', '/registration/banks/');
        this.fetchUrlData('pending_loans_url', '/products/applied_loans/?status=6');
        this.fetchUrlData('pending_disbursement_url', '/products/applied_loans/?status=11');
        this.fetchUrlData('payments_mode_url', '/registration/payment_modes/');
        this.fetchUrlData('currencies_url', '/registration/currency/');
        this.fetchUrlData('approved_loans_url', '/products/applied_loans/?status=9');
        this.fetchUrlData('active_loans_url', '/products/applied_loans/?status=1');
    }

    fetchUrlData = (var_name, url) => {
        const {dispatch} = this.props;
        url = serverBaseUrl() + url;
        this.props.dispatch(setSessionVariable(var_name, url));
        dispatch(fetchDataIfNeeded(url));
    };

    createSummaryCard(icon, label, count) {
        return <div className="card bg-grey border-width-0 clickable">
            <div className="card-body d-flex flex-row">
                <div className="col-md-4 mx-auto">
                </div>
                <div className="col-md-8 d-flex flex-column justify-content-center align-items-end">
                    <div className="row">
                        <h1 className="h4 mb-3 font-weight-normal">{count}</h1>
                    </div>
                    <div className="row">
                        {label}
                    </div>
                </div>
            </div>
        </div>
    }

    handleCloseDialogue = (form) => {
        this.setState({
            [form]: false
        })
    };

    handleOpenDialogue = (form) => {
        this.setState({
            [form]: true
        })
    };

    issueLoanButton() {
        return <button className="btn btn-outline-primary">
            {/*<FontAwesomeIcon icon={faPlus}/> Issue loan*/}
        </button>
    }

    editClientButton() {
        return <Button color="primary">Edit client</Button>
    }

    selectClient = (e, selected_client) => {
        e.preventDefault();
        this.setState({
            selected_client: selected_client
        });
    };

    approveLoanButton(cell, row) {
        if (row['pending_loans'] > 0) {
            return <button className="btn btn-outline-primary" data-toggle="modal" data-target="#approve-loan"
                           onClick={(e) => this.selectClient(e, row)}>
                {/*<FontAwesomeIcon icon={faCheck}/> Approve loan*/}
            </button>
        } else if (row['pending_disburse_loans'] > 0) {
            return <button className="btn btn-outline-primary">
                {/*<FontAwesomeIcon icon={faCheck}/> Disburse loan*/}
            </button>
        } else if (row['approved_loans'] > 0) {
            return <button className="btn btn-outline-primary">
                {/*<FontAwesomeIcon icon={faCheck}/> Process loan*/}
            </button>
        } else {
            return <div/>;
        }
    }

    renderActionButtons = (rowData) => {
        const {pending_loans_data, pending_disbursement_data, active_loans_data} = this.props;
        let pending_loans = pending_loans_data['items'];
        let pending_disbursement = pending_disbursement_data['items'];
        let active_loans = active_loans_data['items'];
        let member_pending_loan = pending_loans.find(function (loan) {
            return loan.member === rowData['id'];
        });
        let member_pending_disbursement = pending_disbursement.find(function (loan) {
            return loan.member === rowData['id'];
        });
        let member_active_loans = active_loans.find(function (loan) {
            return loan.member === rowData['id'];
        });
        let approve_loan_button = <IconButton aria-label="edit" disabled>
            <Check/>
        </IconButton>;
        let disburse_loan_button = <IconButton aria-label="edit" disabled>
            <AccountBalance/>
        </IconButton>;
        let add_payment_button = <IconButton aria-label="edit" disabled>
            <Payment/>
        </IconButton>;
        if (member_pending_loan) {
            approve_loan_button = <Tooltip title="Approve loan">
                <IconButton aria-label="edit"
                            onClick={() => this.setState({
                                selected_client: rowData
                            }, () => this.handleOpenDialogue('approve_loan_dialogue_open'))}
                >
                    <Check/>
                </IconButton>
            </Tooltip>;
        }
        if (member_active_loans) {
            add_payment_button = <Tooltip title="Add payment">
                <IconButton aria-label="edit"
                            onClick={() => this.setState({
                                selected_client: rowData
                            }, () => this.handleOpenDialogue('add_payment_dialogue_open'))}
                >
                    <Payment/>
                </IconButton>
            </Tooltip>;
        }
        if (member_pending_disbursement) {
            disburse_loan_button = <Tooltip title="Disburse loan">
                <IconButton aria-label="edit"
                            onClick={() => this.setState({
                                selected_client: rowData
                            }, () => this.handleOpenDialogue('disburse_loan_dialogue_open'))}
                >
                    <AccountBalance/>
                </IconButton>
            </Tooltip>;
        }

        return <Box display="flex" justifyContent="flex-end">
            <Tooltip title="Edit client">
                <IconButton aria-label="edit">
                    <Edit/>
                </IconButton>
            </Tooltip>
            <Tooltip title="Issue loan">
                <IconButton aria-label="edit"
                            onClick={() => this.setState({
                                selected_client: rowData
                            }, () => this.handleOpenDialogue('issue_loan_dialogue_open'))}
                >
                    <Add/>
                </IconButton>
            </Tooltip>
            {approve_loan_button}
            {disburse_loan_button}
            {add_payment_button}
        </Box>
    };

    render() {
        const {
            clients_data,
            pending_loans_data,
            banks_data,
            payments_mode_data,
            currencies_data,
            approved_loans_data,
            active_loans_data,
            pending_disbursement_data,
            chart_of_accounts_data
        } = this.props;
        let clients = clients_data['items'];
        let pending_loans = pending_loans_data['items'];
        let banks = banks_data['items'];
        let payments_mode = payments_mode_data['items'];
        let currencies = currencies_data['items'];
        let approved_loans = approved_loans_data['items'];
        let active_loans = active_loans_data['items'];
        let pending_disbursement = pending_disbursement_data['items'];
        let chart_of_accounts = chart_of_accounts_data['items'];
        if (
            (banks.length === 0 && !banks_data['isFetching']) ||
            (payments_mode.length === 0 && !payments_mode_data['isFetching']) ||
            (currencies.length === 0 && !currencies_data['isFetching']) ||
            (chart_of_accounts.length === 0 && !chart_of_accounts_data['isFetching'])
        ) {
            pushHistory(this.props, '/settings');
        }
        clients.sort(dynamicSort('-approved_loans'));
        clients.sort(dynamicSort('-pending_disburse_loans'));
        clients.sort(dynamicSort('-pending_loans'));
        let clients_columns = [{

            field: 'full_name',
            title: 'Name',
        }, {
            field: 'mobile_no',
            title: 'Phone number',
        }, {
            field: 'Actions',
            title: '',
            render: rowData => this.renderActionButtons(rowData)
        }];

        return (
            <div>
                <Box pt={2}>
                    <Fab variant="extended" color="default"
                         onClick={() => this.handleOpenDialogue('add_client_dialogue_open')}>
                        <Add/>
                        Add client
                    </Fab>
                </Box>
                <Box mt={2}>
                    <MaterialTable
                        isLoading={clients_data['isFetching']}
                        title="Clients"
                        columns={clients_columns}
                        data={clients}
                    />
                </Box>
                <FormModal
                    handleClickOpen={() => this.handleOpenDialogue('add_client_dialogue_open')}
                    handleClose={() => this.handleCloseDialogue('add_client_dialogue_open')}
                    open={this.state.add_client_dialogue_open}
                    title="Add client"
                >
                    <FormAddClient
                        handleClose={() => this.handleCloseDialogue('add_client_dialogue_open')}
                    />
                </FormModal>
                <FormModal
                    handleClickOpen={() => this.handleOpenDialogue('issue_loan_dialogue_open')}
                    handleClose={() => this.handleCloseDialogue('issue_loan_dialogue_open')}
                    open={this.state.issue_loan_dialogue_open}
                    title="Issue loan"
                >
                    <FormIssueLoan
                        selected_client={this.state.selected_client}
                        handleClose={() => this.handleCloseDialogue('issue_loan_dialogue_open')}
                    />
                </FormModal>
                <FormModal
                    handleClickOpen={() => this.handleOpenDialogue('approve_loan_dialogue_open')}
                    handleClose={() => this.handleCloseDialogue('approve_loan_dialogue_open')}
                    open={this.state.approve_loan_dialogue_open}
                    title="Approve loan"
                >
                    <FormApproveDisburseLoan
                        pending_loans={pending_loans}
                        banks={banks}
                        payments_mode={payments_mode}
                        currencies={currencies}
                        approved_loans={approved_loans}
                        selected_client={this.state.selected_client}
                        handleClose={() => this.handleCloseDialogue('approve_loan_dialogue_open')}
                    />
                </FormModal>
                <FormModal
                    handleClickOpen={() => this.handleOpenDialogue('disburse_loan_dialogue_open')}
                    handleClose={() => this.handleCloseDialogue('disburse_loan_dialogue_open')}
                    open={this.state.disburse_loan_dialogue_open}
                    title="Disburse loan"
                >
                    <FormApproveDisburseLoan
                        pending_disbursement={pending_disbursement}
                        pending_loans={[]}
                        banks={banks}
                        payments_mode={payments_mode}
                        currencies={currencies}
                        approved_loans={approved_loans}
                        selected_client={this.state.selected_client}
                        disburse_loan={true}
                        handleClose={() => this.handleCloseDialogue('disburse_loan_dialogue_open')}
                    />
                </FormModal>
                <FormModal
                    handleClickOpen={() => this.handleOpenDialogue('add_payment_dialogue_open')}
                    handleClose={() => this.handleCloseDialogue('add_payment_dialogue_open')}
                    open={this.state.add_payment_dialogue_open}
                    title="Add payment"
                >
                    <FormAddPayment
                        banks={banks}
                        payments_mode={payments_mode}
                        currencies={currencies}
                        active_loans={active_loans}
                        selected_client={this.state.selected_client}
                        handleClose={() => this.handleCloseDialogue('add_payment_dialogue_open')}
                    />
                </FormModal>
            </div>
        )
    }
}

Home.propTypes = {
    sessionVariables: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    clients_data: PropTypes.object.isRequired,
    pending_loans_data: PropTypes.object.isRequired,
    pending_disbursement_data: PropTypes.object.isRequired,
    banks_data: PropTypes.object.isRequired,
    payments_mode_data: PropTypes.object.isRequired,
    currencies_data: PropTypes.object.isRequired,
    approved_loans_data: PropTypes.object.isRequired,
    active_loans_data: PropTypes.object.isRequired,
    chart_of_accounts_data: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    function retrieveUrlData(url_var_name) {
        let url = sessionVariables[url_var_name] || '';
        return getUrlData(url, dataByUrl);
    }

    const {sessionVariables, dataByUrl} = state;
    const clients_data = retrieveUrlData('clients_url', dataByUrl);
    const pending_loans_data = retrieveUrlData('pending_loans_url', dataByUrl);
    const pending_disbursement_data = retrieveUrlData('pending_disbursement_url', dataByUrl);
    const banks_data = retrieveUrlData('banks_url', dataByUrl);
    const payments_mode_data = retrieveUrlData('payments_mode_url', dataByUrl);
    const currencies_data = retrieveUrlData('currencies_url', dataByUrl);
    const approved_loans_data = retrieveUrlData('approved_loans_url', dataByUrl);
    const active_loans_data = retrieveUrlData('active_loans_url', dataByUrl);
    const chart_of_accounts_data = retrieveUrlData('chart_of_accounts_url', dataByUrl);

    return {
        sessionVariables,
        clients_data,
        pending_loans_data,
        pending_disbursement_data,
        banks_data,
        payments_mode_data,
        currencies_data,
        approved_loans_data,
        active_loans_data,
        chart_of_accounts_data
    }
}

export default connect(mapStateToProps)(withRouter(Home))
