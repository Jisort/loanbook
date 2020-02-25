import React, {Component} from "react";
import FormActivityIndicator from "../components/FormActivityIndicator";
import $ from 'jquery';
import {extractResponseError, formDataToPayload, getUrlData} from "../functions/componentActions";
import {postAPIRequest} from "../functions/APIRequests";
import {serverBaseUrl} from "../functions/baseUrls";
import FormFeedbackMessage from "../components/FormFeedbackMessage";
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import moment from "moment";
import DialogContent from "@material-ui/core/DialogContent";
import {Grid, Typography, TextField, Select, MenuItem, InputLabel, InputAdornment} from "@material-ui/core";
import DatePicker from "../components/DatePicker";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import {fetchDataIfNeeded, invalidateData} from "../actions/actions";

class FormIssueLoan extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected_client: null,
            date_of_first_repayment: null,
            date_of_loan_application: null,
            activity: false,
            message: false,
            message_variant: 'info',
            message_text: null,
        }
    }

    handleClientChange = selectedOption => {
        this.setState({
            selected_client: selectedOption
        });
    };

    handleFirstDateChange = date => {
        this.setState({
            date_of_first_repayment: date
        });
    };

    handleApplicationDateChange = date => {
        this.setState({
            date_of_loan_application: date
        });
    };

    matchWithProduct = (payload, callback) => {
        const {loan_products_data} = this.props;
        let loan_products = loan_products_data.items || [];
        let matching_product = loan_products.find(function (product) {
            return product['amortization'] === payload['amortization'] &&
                product['interest_method'] === payload['interest_calculation_method'] &&
                product['interest_charged_per'] === payload['interest_charged_per'] &&
                product['repayment_interval'] === payload['repayment_interval'] &&
                product['repaid_every'] === parseInt(payload['repaid_every']);
        });
        if (matching_product) {
            payload['loan_type'] = matching_product.id;
            callback(payload);
        } else {
            this.createLoanProduct(payload, callback);
        }
    };

    createLoanProduct = (loan_payload, callback) => {
        const {chart_of_accounts_data, banks_data, loan_products_url, loan_products_data} = this.props;
        let chart_of_accounts = chart_of_accounts_data['items'];
        let loans = loan_products_data['items'];
        let today = moment().format('YYYY-MM-DD');
        let close_date = moment().add(100, 'years').format('YYYY-MM-DD');
        let asset_account = chart_of_accounts.find(function (account) {
            return account['account_type'] === 1;
        });
        let income_account = chart_of_accounts.find(function (account) {
            return account['account_type'] === 4;
        });
        let expenses_account = chart_of_accounts.find(function (account) {
            return account['account_type'] === 5;
        });
        let liabilities_account = chart_of_accounts.find(function (account) {
            return account['account_type'] === 2;
        });
        let banks = banks_data['items'];
        let bank = banks[0];
        let product_name = 'Per ' + loan_payload['interest_charged_per'] +
            ' ' + loan_payload['interest_calculation_method'] +
            ' ' + loan_payload['amortization'] +
            ' ' + loan_payload['repaid_every'] +
            ' ' + loan_payload['repayment_interval'];
        let short_name = loans.length + 1;
        let payload = {
            product_name: product_name,
            short_name: short_name,
            description: product_name,
            start_date: today,
            close_date: close_date,
            loan_fund: bank['gl_account'],
            status: 'active',
            minimum_days_disbursement_repayment: 0,
            minimum_principal: 1,
            maximum_principal: 2147483647,
            minimum_repayments: 1,
            maximum_repayments: 100,
            minimum_interest_rate: 0,
            maximum_interest_rate: 2147483647,
            default_interest_rate: loan_payload['interest_rate'],
            interest_charged_per: loan_payload['interest_charged_per'],
            repaid_every: loan_payload['repaid_every'],
            repayment_interval: loan_payload['repayment_interval'],
            interest_method: loan_payload['interest_calculation_method'],
            days_overdue_before_arreas: 30,
            days_overdue_before_npa: 60,
            minimum_guarantors: 0,
            maximum_guarantors: 0,
            place_guarantor_funds_hold: 'yes',
            enable_multiple_disbursals: 'yes',
            amortization: loan_payload['amortization'],
            gl_account: asset_account['id'],
            interest_account: income_account['id'],
            overpayment_account: liabilities_account['id'],
            losses_from_write_off: expenses_account['id'],
            is_group_loan: false,
            recalculate_loan_advance_payment: false,
            realtime_interest: false,
            realtime_penalties: true,
            total_interest_calculation_method: 'as_per_loan_type',
            calculate_repayment_ability_from_salary: false,
            no_of_decimal_places: 0,
            members_only: true,
            maximum_number_of_concurrent_loans: 1,
            recalculate_loan_on_repayment: false,
            interest_posting_method: 'on_application',
        };
        postAPIRequest(loan_products_url,
            (results) => {
                loan_payload['loan_type'] = results.id;
                callback(loan_payload);
            },
            (results) => {
                let alert_message = extractResponseError(results);
                this.setState({
                    alert: true,
                    alert_message: alert_message,
                    alert_class: 'alert alert-danger',
                    activity: false
                });
            },
            payload,
            {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.token
            }
        );
    };

    handleLoanIssueSubmit(e) {
        e.preventDefault();
        this.setState({activity: true});
        let formData = new FormData($('form#issue-loan-form')[0]);
        let milliseconds = new Date().getTime();
        let loan_reference_no = 'LNR-' + milliseconds;
        let payload = {
            date_of_first_repayment: moment(this.state.date_of_first_repayment).format('YYYY-MM-DD'),
            loan_reference_no: loan_reference_no,
            date_of_loan_application: moment(this.state.date_of_loan_application).format('YYYY-MM-DD'),
            member: (this.props['selected_client'] || {})['id']
        };
        payload = formDataToPayload(formData, payload);
        this.matchWithProduct(payload, (payload) => {
            let loan_application_url = serverBaseUrl() + '/products/applied_loans/';
            postAPIRequest(loan_application_url,
                (results) => {
                    this.setState({
                        message: true,
                        message_text: 'Loan issued successfully',
                        message_variant: 'success',
                        activity: false
                    });
                    $("form#issue-loan-form")[0].reset();
                    const {sessionVariables, dispatch} = this.props;
                    let pending_loans_url = sessionVariables['pending_loans_url'] || '';
                    let not_reversed_loans_url = sessionVariables['not_reversed_loans_url'] || '';
                    dispatch(invalidateData(pending_loans_url));
                    dispatch(fetchDataIfNeeded(pending_loans_url));
                    dispatch(invalidateData(not_reversed_loans_url));
                    dispatch(fetchDataIfNeeded(not_reversed_loans_url));
                },
                (results) => {
                    let alert_message = extractResponseError(results);
                    this.setState({
                        message: true,
                        message_text: alert_message,
                        message_variant: 'error',
                        activity: false
                    });
                },
                payload,
                {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.token
                }
            );
        });
    }


    render() {
        let selected_client = this.props['selected_client'];
        let issue_loan_button = <DialogActions>
            <Button color="primary" type="submit">
                Issue Loan
            </Button>
            <Button onClick={this.props['handleClose']} color="primary">
                Close
            </Button>
        </DialogActions>;
        if (this.state.activity) {
            issue_loan_button = <FormActivityIndicator/>;
        }

        let message = '';
        if (this.state.message) {
            message = <FormFeedbackMessage
                message_variant={this.state.message_variant}
                message_text={this.state.message_text}
            />;
        }

        return (
            <Grid container>
                <Grid item xs={12}>
                    {message}
                    <form onSubmit={(e) => this.handleLoanIssueSubmit(e)} id="issue-loan-form">
                        <DialogContent>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Typography fullWidth>Client: {selected_client['full_name']}</Typography>
                                </Grid>
                            </Grid>
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <TextField type="number" fullWidth label="Amount" name="amount" required={true}/>
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField type="number" label="Interest rate"
                                               required={true} name="interest_rate"
                                               InputProps={{
                                                   endAdornment: (
                                                       <InputAdornment position='end'>
                                                           <Select name="interest_charged_per"
                                                                   defaultValue="month"
                                                           >
                                                               <MenuItem value="month">Per month</MenuItem>
                                                               <MenuItem value="year">Per year</MenuItem>
                                                           </Select>
                                                       </InputAdornment>
                                                   ),
                                               }}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <InputLabel id="interest-calculation-method-label">Interest calculation method</InputLabel>
                                    <Select fullWidth labelId="interest-calculation-method-label" name="interest_calculation_method">
                                        <MenuItem value="flat_rate">Flat rate</MenuItem>
                                        <MenuItem value="reducing_balance">Reducing balance</MenuItem>
                                    </Select>
                                </Grid>
                            </Grid>
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <DatePicker
                                        label="Date of application"
                                        value={this.state.date_of_loan_application}
                                        format="YYYY-MM-DD"
                                        fullWidth={true}
                                        onChange={this.handleApplicationDateChange}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <DatePicker
                                        label="First payment date"
                                        value={this.state.date_of_first_repayment}
                                        format="YYYY-MM-DD"
                                        fullWidth={true}
                                        onChange={this.handleFirstDateChange}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField type="number" label="Repayment plan (repaid every)"
                                               required={true} fullWidth name="repaid_every"
                                               InputProps={{
                                                   endAdornment: (
                                                       <InputAdornment position='end'>
                                                           <Select name="repayment_interval"
                                                                   defaultValue="months">
                                                               <MenuItem value="days">Days</MenuItem>
                                                               <MenuItem value="months">Months</MenuItem>
                                                           </Select>
                                                       </InputAdornment>
                                                   ),
                                               }}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <TextField fullWidth type="number" label="No of installments"
                                               name="no_of_repayments" required={true}/>
                                </Grid>
                                <Grid item xs={6}>
                                    <InputLabel id="amortization-label">Amortization</InputLabel>
                                    <Select fullWidth labelId="amortization-label" name="amortization">
                                        <MenuItem value="equal_installments">Equal installments</MenuItem>
                                        <MenuItem value="equal_principal">Equal principal payments</MenuItem>
                                    </Select>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        {issue_loan_button}
                    </form>
                </Grid>
            </Grid>
        )
    }
}

FormIssueLoan.propTypes = {
    sessionVariables: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    loan_products_data: PropTypes.object.isRequired,
    chart_of_accounts_data: PropTypes.object.isRequired,
    banks_data: PropTypes.object.isRequired,
    loan_products_url: PropTypes.string.isRequired
};

function mapStateToProps(state) {
    const {sessionVariables, dataByUrl} = state;
    let loan_products_url = sessionVariables['loan_products_url'] || '';
    let chart_of_accounts_url = sessionVariables['chart_of_accounts_url'] || '';
    let banks_url = sessionVariables['banks_url'] || '';
    const loan_products_data = getUrlData(loan_products_url, dataByUrl);
    const chart_of_accounts_data = getUrlData(chart_of_accounts_url, dataByUrl);
    const banks_data = getUrlData(banks_url, dataByUrl);

    return {
        sessionVariables,
        loan_products_data,
        chart_of_accounts_data,
        banks_data,
        loan_products_url
    }
}

export default connect(mapStateToProps)(withRouter(FormIssueLoan))
