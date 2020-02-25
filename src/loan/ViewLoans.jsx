import React, {Component} from "react";
import {Box, IconButton, Tooltip} from "@material-ui/core";
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import MaterialTable from "material-table";
import {getUrlData, numberWithCommas, UTCToLocalTime} from "../functions/componentActions";
import {serverBaseUrl} from "../functions/baseUrls";
import {fetchDataIfNeeded, setSessionVariable} from "../actions/actions";
import moment from "moment";
import {Receipt, Payment, Delete, Check} from "@material-ui/icons";
import Modal from "../components/Modal";
import LoanStatement from "./LoanStatement";
import FormAddPayment from "../payment/FormAddPayment";
import FormModal from "../components/FormModal";
import FormReverseLoan from "./FormReverseLoan";

class ViewLoans extends Component {
    constructor(props) {
        super(props);
        this.state = {
            statement_dialogue_open: false,
            selected_loan: {},
            add_payment_dialogue_open: false,
            selected_client: {},
            reverse_loan_dialogue_open: false
        }
    }

    componentDidMount() {
        this.fetchUrlData('not_reversed_loans_url', '/products/applied_loans/?status__in=1,7,9,6,11');
        this.fetchUrlData('banks_url', '/registration/banks/');
        this.fetchUrlData('payments_mode_url', '/registration/payment_modes/');
        this.fetchUrlData('currencies_url', '/registration/currency/');
    }

    handleOpenDialogue = (dialogue) => {
        this.setState({
            [dialogue]: true
        })
    };

    handleCloseDialogue = (dialogue) => {
        this.setState({
            [dialogue]: false
        })
    };

    fetchUrlData = (var_name, url) => {
        const {dispatch} = this.props;
        url = serverBaseUrl() + url;
        this.props.dispatch(setSessionVariable(var_name, url));
        dispatch(fetchDataIfNeeded(url));
    };

    renderActionButtons = (rowData) => {
        let selected_client = {id: rowData['member']};
        let loan_statement_button = <IconButton aria-label="statement" disabled>
            <Receipt/>
        </IconButton>;
        let loan_payment_button = <IconButton aria-label="payment" disabled>
            <Payment/>
        </IconButton>;
        if ([1, 7, '1', '7', 11, '11'].indexOf(rowData['status']) !== -1) {
            loan_statement_button = <Tooltip title="Loan statement">
                <IconButton aria-label="statement"
                            onClick={() => this.setState({
                                selected_loan: rowData
                            }, () => this.handleOpenDialogue('statement_dialogue_open'))
                            }
                >
                    <Receipt/>
                </IconButton>
            </Tooltip>;
        }
        if ([1, '1'].indexOf(rowData['status']) !== -1) {
            loan_payment_button = <Tooltip title="Add payment">
                <IconButton aria-label="payment"
                            onClick={() => this.setState({
                                selected_loan: rowData,
                                selected_client: selected_client
                            }, () => this.handleOpenDialogue('add_payment_dialogue_open'))
                            }
                >
                    <Payment/>
                </IconButton>
            </Tooltip>;
        }
        return <Box display="flex" justifyContent="flex-end">
            {loan_statement_button}
            {loan_payment_button}
            <Tooltip title="Reverse loan">
                <IconButton aria-label="reverse"
                            onClick={() => this.setState({
                                selected_loan: rowData,
                            }, () => this.handleOpenDialogue('reverse_loan_dialogue_open'))
                            }
                >
                    <Delete/>
                </IconButton>
            </Tooltip>
        </Box>
    };

    render() {
        const {
            not_reversed_loans_data,
            banks_data,
            payments_mode_data,
            currencies_data,
        } = this.props;
        let not_reversed_loans = not_reversed_loans_data['items'];
        let banks = banks_data['items'];
        let payments_mode = payments_mode_data['items'];
        let currencies = currencies_data['items'];
        let loans_columns = [{
            field: 'member_name',
            title: 'Client',
        }, {
            field: 'approved_amount',
            title: 'Amount',
            render: rowData => numberWithCommas(rowData['approved_amount'])
        }, {
            field: 'outstanding_balance',
            title: 'Balance',
            render: rowData => numberWithCommas(rowData['outstanding_balance'])
        }, {
            field: 'date_of_loan_application',
            title: 'Applied on',
            render: rowData => UTCToLocalTime(rowData['date_of_loan_application'], moment, null, 'YYYY-MM-DD')
        }, {
            field: 'disbursement_date',
            title: 'Disbursed on',
            render: rowData => UTCToLocalTime(rowData['disbursement_date'], moment, null, 'YYYY-MM-DD')
        }, {
            field: '',
            title: '',
            render: rowData => this.renderActionButtons(rowData)
        }];

        return (
            <div>
                <Box mt={2}>
                    <MaterialTable
                        isLoading={not_reversed_loans_data['isFetching']}
                        title="Loans"
                        columns={loans_columns}
                        data={not_reversed_loans}
                    />
                </Box>
                <Modal
                    open={this.state.statement_dialogue_open}
                    handleOpen={() => this.handleOpenDialogue('statement_dialogue_open')}
                    handleClose={() => this.handleCloseDialogue('statement_dialogue_open')}
                    dialogue_title="Loan statement"
                >
                    <LoanStatement
                        selected_loan={this.state.selected_loan}
                    />
                </Modal>
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
                        active_loans={[this.state.selected_loan]}
                        selected_client={this.state.selected_client}
                        handleClose={() => this.handleCloseDialogue('add_payment_dialogue_open')}
                    />
                </FormModal>
                <FormModal
                    handleClickOpen={() => this.handleOpenDialogue('add_payment_dialogue_open')}
                    handleClose={() => this.handleCloseDialogue('add_payment_dialogue_open')}
                    open={this.state.reverse_loan_dialogue_open}
                    title="Reverse loan"
                >
                    <FormReverseLoan
                        selected_loan={this.state.selected_loan}
                        handleClose={() => this.handleCloseDialogue('reverse_loan_dialogue_open')}
                    />
                </FormModal>
            </div>
        )
    }
}

ViewLoans.propTypes = {
    sessionVariables: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    not_reversed_loans_data: PropTypes.object.isRequired,
    banks_data: PropTypes.object.isRequired,
    payments_mode_data: PropTypes.object.isRequired,
    currencies_data: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    function retrieveUrlData(url_var_name) {
        let url = sessionVariables[url_var_name] || '';
        return getUrlData(url, dataByUrl);
    }

    const {sessionVariables, dataByUrl} = state;
    const not_reversed_loans_data = retrieveUrlData('not_reversed_loans_url', dataByUrl);
    const banks_data = retrieveUrlData('banks_url', dataByUrl);
    const payments_mode_data = retrieveUrlData('payments_mode_url', dataByUrl);
    const currencies_data = retrieveUrlData('currencies_url', dataByUrl);

    return {
        sessionVariables,
        not_reversed_loans_data,
        banks_data,
        payments_mode_data,
        currencies_data
    }
}

export default connect(mapStateToProps)(withRouter(ViewLoans))
