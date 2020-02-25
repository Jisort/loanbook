import React, {Component} from "react";
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {extractResponseError, formDataToPayload, getUrlData, numberWithCommas} from "../functions/componentActions";
import {DialogContent, Grid, TextField, Typography} from "@material-ui/core";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import FormActivityIndicator from "../components/FormActivityIndicator";
import $ from "jquery";
import {serverBaseUrl} from "../functions/baseUrls";
import {postAPIRequest} from "../functions/APIRequests";
import {fetchDataIfNeeded, invalidateData} from "../actions/actions";
import FormFeedbackMessage from "../components/FormFeedbackMessage";

class FormReverseLoan extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activity: false
        }
    }

    handleSubmitReverseLoan(e) {
        e.preventDefault();
        this.setState({activity: true});
        const {selected_loan} = this.props;
        let formData = new FormData($("form#reverse-loan")[0]);
        let payload = {
            loan: selected_loan['id'],
            status: 12,
        };
        payload = formDataToPayload(formData, payload);
        let reverse_loan_url = serverBaseUrl() + `/products/applied_loans/${selected_loan['id']}/`;
        postAPIRequest(reverse_loan_url,
            () => {
                this.setState({
                    message: true,
                    message_text: 'Loan reversed successfully',
                    message_variant: 'success',
                    activity: false
                });
                const {sessionVariables, dispatch} = this.props;
                let active_loans_url = sessionVariables['active_loans_url'] || '';
                let not_reversed_loans_url = sessionVariables['not_reversed_loans_url'] || '';
                dispatch(invalidateData(active_loans_url));
                dispatch(fetchDataIfNeeded(active_loans_url));
                dispatch(invalidateData(not_reversed_loans_url));
                dispatch(fetchDataIfNeeded(not_reversed_loans_url));
                $("form#reverse-loan")[0].reset();
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
            "PATCH"
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
        let reverse_loan_button = <DialogActions>
            <Button color="primary" type="submit">
                Reverse Loan
            </Button>
            <Button onClick={this.props['handleClose']} color="primary">
                Close
            </Button>
        </DialogActions>;
        if (this.state.activity) {
            reverse_loan_button = <FormActivityIndicator/>;
        }
        const {selected_loan} = this.props;
        return (
            <Grid container>
                <Grid item xs={12}>
                    {message}
                    <form onSubmit={(e) => this.handleSubmitReverseLoan(e)} id="reverse-loan">
                        <DialogContent>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Typography fullWidth>
                                        Loan: {selected_loan['member_name']} - {numberWithCommas(selected_loan['approved_amount'])}
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField type="text" label="Reversal reason" fullWidth
                                               name="reversal_reason" required={true}/>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        {reverse_loan_button}
                    </form>
                </Grid>
            </Grid>
        )
    }
}

FormReverseLoan.propTypes = {
    sessionVariables: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired
};

function mapStateToProps(state) {
    function retrieveUrlData(url_var_name) {
        let url = sessionVariables[url_var_name] || '';
        return getUrlData(url, dataByUrl);
    }

    const {sessionVariables, dataByUrl} = state;

    return {
        sessionVariables
    }
}

export default connect(mapStateToProps)(withRouter(FormReverseLoan))
