import React, {Component} from "react";
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import {Grid, DialogContent, TextField, DialogActions, Button} from "@material-ui/core";
import FormFeedbackMessage from "../components/FormFeedbackMessage";
import DatePicker from "../components/DatePicker";
import FormActivityIndicator from "../components/FormActivityIndicator";
import $ from 'jquery';
import {serverBaseUrl} from "../functions/baseUrls";
import {postAPIRequest} from "../functions/APIRequests";
import {extractResponseError, formDataToPayload} from "../functions/componentActions";
import moment from "moment";


class FormAddPayment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activity: false,
            message: false,
            message_variant: 'info',
            message_text: null,
            selected_date: new Date()
        }
    }

    handleDateChange = date => {
        this.setState({
            selected_date: date
        });
    };

    handleAddPaymentSubmit(e) {
        e.preventDefault();
        this.setState({
           activity: true
        });
        const {active_loans, selected_client, banks, payments_mode, currencies} = this.props;
        let client_active_loan = active_loans.find(function (loan) {
            return loan['member'] === selected_client['id'];
        });
        let formData = new FormData($('form#add-payment')[0]);
        let milliseconds = new Date().getTime();
        let transaction_code = 'CON-' + milliseconds;
        let payload = {
            date: moment(this.state.selected_date).format('YYYY-MM-DD'),
            loan: client_active_loan['id'],
            member: selected_client['id'],
            transaction_code: transaction_code,
            bank: banks[0].id,
            payment_type: payments_mode[0].id,
            currency: currencies[0].id
        };
        payload = formDataToPayload(formData, payload);
        let payment_url = serverBaseUrl() + '/mpa/client_payments/';
        postAPIRequest(payment_url,
            (results) => {
                this.setState({
                    message: true,
                    message_text: 'Payment added successfully',
                    message_variant: 'success',
                    activity: false
                });
                $("form#add-payment")[0].reset();
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
    }

    render() {
        let message = '';
        if (this.state.message) {
            message = <FormFeedbackMessage
                message_variant={this.state.message_variant}
                message_text={this.state.message_text}
            />;
        }
        let add_payment_button = <DialogActions>
            <Button color="primary" type="submit">
                Add payment
            </Button>
            <Button onClick={this.props['handleClose']} color="primary">
                Close
            </Button>
        </DialogActions>;
        if (this.state.activity) {
            add_payment_button = <FormActivityIndicator/>;
        }
        return (
            <Grid container>
                <Grid item xs={12}>
                    {message}
                    <form onSubmit={(e) => this.handleAddPaymentSubmit(e)} id="add-payment">
                        <DialogContent>
                            <Grid container>
                                <Grid item xs={12}>
                                    <TextField fullWidth type="number" label="Amount" name="amount" required={true}/>
                                </Grid>
                            </Grid>
                            <Grid container>
                                <Grid item xs={12}>
                                    <DatePicker
                                        label="Date"
                                        value={this.state.selected_date}
                                        onChange={this.handleDateChange}
                                        format="YYYY-MM-DD"
                                        fullWidth={true}
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        {add_payment_button}
                    </form>
                </Grid>
            </Grid>
        )
    }
}

FormAddPayment.propTypes = {
    sessionVariables: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
    const {sessionVariables} = state;

    return {
        sessionVariables,
    }
}

export default connect(mapStateToProps)(withRouter(FormAddPayment))