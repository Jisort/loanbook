import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {serverBaseUrl} from "./functions/baseUrls";
import {
    setSessionVariable,
    fetchDataIfNeeded
} from './actions/actions';
import {getUrlData, dynamicSort, numberWithCommas} from "./functions/componentActions";
import FormModal from "./components/FormModal";
// import ClientDetailsForm from "./ClientDetailsForm";
// import LoanDetailsForm from "./LoanDetailsForm";
// import ApproveLoanForm from "./ApproveLoanForm";
import moment from "moment";
import DataTable from "./components/DataTable";
import {Card, CardContent, Container, Button, Fab, Box} from "@material-ui/core";
import MaterialTable from 'material-table';
import {Add} from '@material-ui/icons';
import FormAddClient from "./client/FormAddClient";

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected_client: {},
            form_dialogue_open: true
        }
    }

    componentDidMount() {
        let _1_month_ago = moment().subtract(1, 'month').format('YYYY-MM-DD');
        let today = moment().format('YYYY-MM-DD');
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
        this.fetchUrlData(
            'current_month_income_url',
            `/general_ledger/general_ledger/?date_from${_1_month_ago}&date_to${today}&totals=true&account_group=4`
        );
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
                    {/*<FontAwesomeIcon icon={icon} className="mx-auto" size={'4x'} color="#A9C641"/>*/}
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

    handleCloseDialogue = () => {
        this.setState({
            form_dialogue_open: false
        })
    };

    handleOpenDialogue = () => {
        this.setState({
            form_dialogue_open: true
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

    render() {
        const {
            clients_data,
            pending_loans_data,
            banks_data,
            payments_mode_data,
            currencies_data,
            approved_loans_data,
            active_loans_data,
            current_month_income_data
        } = this.props;
        let clients = clients_data['items'];
        let pending_loans = pending_loans_data['items'];
        let banks = banks_data['items'];
        let payments_mode = payments_mode_data['items'];
        let currencies = currencies_data['items'];
        let approved_loans = approved_loans_data['items'];
        let active_loans = active_loans_data['items'];
        let current_month_income = current_month_income_data['items'];
        clients.sort(dynamicSort('-approved_loans'));
        clients.sort(dynamicSort('-pending_disburse_loans'));
        clients.sort(dynamicSort('-pending_loans'));
        let total_outstanding_amount = 0;
        active_loans.forEach(function (loan) {
            total_outstanding_amount += loan['outstanding_balance'];
        });
        let total_current_month_income = 0;
        current_month_income.forEach(function (loan) {
            total_current_month_income += loan['credit'];
        });
        let clients_columns = [{

            field: 'full_name',
            title: 'Name',
        }, {
            field: 'mobile_no',
            title: 'Phone number',
        }];

        let actions = [
            {
                icon: 'edit',
                tooltip: 'Edit Client',
                onClick: (event, rowData) => {
                    // Do save operation
                }
            }, {
                icon: 'add',
                tooltip: 'Issue Loan',
                onClick: (event, rowData) => {
                    // Do save operation
                }
            }, {
                icon: 'done',
                tooltip: 'Approve Loan',
                onClick: (event, rowData) => {
                    // Do save operation
                }
            }, {
                icon: 'payment',
                tooltip: 'Add payment',
                onClick: (event, rowData) => {
                    // Do save operation
                }
            }
        ];

        return (
            <Container maxWidth="xl" className="Main-container">
                <Box pt={2}>
                    <Fab variant="extended" color="default" onClick={this.handleOpenDialogue}>
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
                        options={{actionsColumnIndex: -1}}
                        actions={actions}
                    />
                </Box>
                <FormModal
                    handleClickOpen={this.handleOpenDialogue}
                    handleClose={this.handleCloseDialogue}
                    open={this.state.form_dialogue_open}
                    title="Add client"
                >
                    <FormAddClient/>
                </FormModal>
            </Container>
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
    current_month_income_data: PropTypes.object.isRequired
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
    const current_month_income_data = retrieveUrlData('current_month_income_url', dataByUrl);

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
        current_month_income_data
    }
}

export default connect(mapStateToProps)(withRouter(Home))