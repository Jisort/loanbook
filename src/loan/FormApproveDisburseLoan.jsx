import React, {Component} from "react";
// import DatePicker from "react-datepicker";
import FormActivityIndicator from "../components/FormActivityIndicator";
import $ from "jquery";
import {extractResponseError, formDataToPayload} from "../functions/componentActions";
import {serverBaseUrl} from "../functions/baseUrls";
import {postAPIRequest} from "../functions/APIRequests";
import FormFeedbackMessage from "../components/FormFeedbackMessage";
import moment from "moment";
import {fetchDataIfNeeded, invalidateData} from "../actions/actions";
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import {Grid, TextField, Checkbox, DialogContent, FormControlLabel} from "@material-ui/core";
import DatePicker from "../components/DatePicker";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";

class ApproveLoanForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected_date: null,
            activity: false,
            message: false,
            message_variant: 'info',
            message_text: null,
            disburse_loan_checkbox: false
        }
    }

    handleDateChange = date => {
        this.setState({
            selected_date: date
        });
    };

    submitDisburseLoan(e, pending_loan) {
        e.preventDefault();
        this.setState({activity: true});
        let disbursement_date = pending_loan['disbursement_date'];
        let approved_amount = pending_loan['approved_amount'];
        this.handleDisburseLoan(pending_loan, disbursement_date, approved_amount);
    }

    handleDisburseLoan = (pending_loan, disbursement_date, approved_amount) => {
        const {banks, payments_mode, currencies} = this.props;
        let milliseconds = new Date().getTime();
        let receipt_no = 'DIS-' + milliseconds;

        let payload = {
            bank: banks[0].id,
            payment_type: payments_mode[0].id,
            currency: currencies[0].id,
            deduct_charges_from_disbursement_amount: 'yes',
            member: pending_loan['member'],
            loan: pending_loan['id'],
            disbursement_date: disbursement_date,
            disbursement_amount: approved_amount,
            receipt_no: receipt_no,
        };
        let loan_disbursement_url = serverBaseUrl() + '/products/loan_disbursement/';
        postAPIRequest(loan_disbursement_url,
            () => {
                this.setState({
                    message: true,
                    message_text: 'Loan disbursed successfully',
                    message_variant: 'success',
                    activity: false
                });
                const {sessionVariables, dispatch} = this.props;
                let pending_disbursement_url = sessionVariables['pending_disbursement_url'] || '';
                dispatch(invalidateData(pending_disbursement_url));
                dispatch(fetchDataIfNeeded(pending_disbursement_url));
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
            },
            'POST'
        )
    };

    handleProcessLoan = (pending_loan, callback) => {
        let process_loan_url = serverBaseUrl() + '/products/repayment_schedule/';
        let payload = {
            loan: pending_loan['id']
        };
        postAPIRequest(
            process_loan_url,
            () => {
                const {sessionVariables, dispatch} = this.props;
                let pending_disbursement_url = sessionVariables['pending_disbursement_url'] || '';
                dispatch(invalidateData(pending_disbursement_url));
                dispatch(fetchDataIfNeeded(pending_disbursement_url));
                callback();
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
            },
            'POST'
        )
    };

    handleApproveLoan(e, pending_loan) {
        e.preventDefault();
        this.setState({activity: true});
        let formData = new FormData($("form#approve-loan")[0]);
        let disbursement_date = moment(this.state.selected_date).format('YYYY-MM-DD');
        let payload = {
            disbursement_date: disbursement_date,
            status: 9,
        };
        payload = formDataToPayload(formData, payload);
        let approve_loan_url = serverBaseUrl() + `/products/applied_loans/${pending_loan['id']}/`;
        postAPIRequest(
            approve_loan_url,
            () => {
                this.handleProcessLoan(pending_loan, () => {
                    if (this.state.disburse_loan_checkbox) {
                        this.handleDisburseLoan(pending_loan, disbursement_date, payload['approved_amount'])
                    } else {
                        this.setState({
                            message: true,
                            message_text: 'Loan approved successfully',
                            message_variant: 'success',
                            activity: false
                        });
                    }
                });
                const {sessionVariables, dispatch} = this.props;
                let pending_loans_url = sessionVariables['pending_loans_url'] || '';
                dispatch(invalidateData(pending_loans_url));
                dispatch(fetchDataIfNeeded(pending_loans_url));
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
            },
            'PATCH'
        )
    }

    handleDisburseLoanCheckbox(e) {
        e.preventDefault();
        this.setState({
            disburse_loan_checkbox: !this.state.disburse_loan_checkbox
        });
    }

    render() {
        let message = '';
        if (this.state.message) {
            message = <FormFeedbackMessage
                message_variant={this.state.message_variant}
                message_text={this.state.message_text}
            />;
        }

        const {pending_loans, selected_client, pending_disbursement} = this.props;
        let pending_loan = pending_loans.find(function (loan) {
            return loan['member'] === selected_client['id'];
        }) || {};
        if (this.props['disburse_loan']) {
            pending_loan = pending_disbursement.find(function (loan) {
                return loan['member'] === selected_client['id'];
            }) || {};
        }

        let approve_loan_button = <DialogActions>
            <Button color="primary" type="submit">
                Approve Loan
            </Button>
            <Button onClick={this.props['handleClose']} color="primary">
                Close
            </Button>
        </DialogActions>;
        let disburse_loan_button = <DialogActions>
            <Button color="primary" type="submit">
                Disburse Loan
            </Button>
            <Button onClick={this.props['handleClose']} color="primary">
                Close
            </Button>
        </DialogActions>;
        if (this.state.activity) {
            approve_loan_button = <FormActivityIndicator/>;
            disburse_loan_button = <FormActivityIndicator/>;
        }

        let disburse_approve_form = <form onSubmit={(e) => this.handleApproveLoan(e, pending_loan)}
                                          id="approve-loan">
            <DialogContent>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField type="number" label="Approved amount" fullWidth
                                   name="approved_amount" required={true} defaultValue={pending_loan['amount']}/>
                    </Grid>
                </Grid>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <DatePicker
                            label="Date of disbursement"
                            value={this.state.selected_date}
                            onChange={this.handleDateChange}
                            format="YYYY-MM-DD"
                            fullWidth={true}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <FormControlLabel
                            control={
                                <Checkbox checked={this.state.disburse_loan_checkbox}
                                          onChange={(e) => this.handleDisburseLoanCheckbox(e)}
                                          color="primary"
                                />
                            }
                            label="Disburse loan"
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            {approve_loan_button}
        </form>;
        if (this.props['disburse_loan']) {
            disburse_approve_form = <form onSubmit={(e) => this.submitDisburseLoan(e, pending_loan)} id="disburse-loan">
                <DialogContent>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField type="number" label="Amount" fullWidth
                                       name="approved_amount" defaultValue={pending_loan['amount']}
                                       InputProps={{
                                           readOnly: true,
                                       }}
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField type="text" label="Date" fullWidth
                                       name="date" defaultValue={pending_loan['disbursement_date']}
                                       InputProps={{
                                           readOnly: true,
                                       }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                {disburse_loan_button}
            </form>;
        }
        return (
            <Grid container>
                <Grid item xs={12}>
                    {message}
                    {disburse_approve_form}
                </Grid>
            </Grid>
        )
    }
}

ApproveLoanForm.propTypes = {
    sessionVariables: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
    const {sessionVariables} = state;

    return {
        sessionVariables,
    }
}

export default connect(mapStateToProps)(withRouter(ApproveLoanForm))