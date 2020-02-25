import React, {Component} from "react";
import {withRouter} from "react-router-dom";
import {Box, Button, Card, CardContent, Container, FormControl, Grid, Link, Paper, TextField} from "@material-ui/core";
import FormActivityIndicator from "../components/FormActivityIndicator";
import FormFeedbackMessage from "../components/FormFeedbackMessage";
import {extractResponseError, formDataToPayload, lookup, pushHistory} from "../functions/componentActions";
import $ from "jquery";
import {serverBaseUrl} from "../functions/baseUrls";
import {postAPIRequest} from "../functions/APIRequests";
import {countries} from "countries-list";
import AppLoadingIndicator from "../components/AppLoadingIndicator";

class FormSignUp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activity: false,
            message: false,
            message_text: null,
            message_variant: 'info',
            email: localStorage.email || null,
            otp_form: false,
            phone_number: '',
            loading: true
        }
    }

    componentDidMount() {
        lookup((country) => {
            let country_object = countries[country] || {};
            this.setState({
                loading: false,
                phone_number: '+' + country_object['phone']
            });
        })
    }

    handleSubmitOTP(e) {
        e.preventDefault();
        this.setState({
            activity: true
        });
        let formData = new FormData($('form#otp-form')[0]);
        let payload = {};
        payload = formDataToPayload(formData, payload);
        this.handleLogin(this.state.username, this.state.password, payload['otp']);
    }

    handleLogin = (username, password, otp = null) => {
        let login_url = serverBaseUrl() + '/registration/login/';
        let payload = {
            username: username,
            password: password,
        };
        if (otp) {
            payload['otp'] = otp;
        } else {
            let oauth_obj = {
                grant_type: 'password',
                client_id: 'i7YlkIu4qdkLZJsnJubhIbeYWP0Qq2NH3D0vatNO',
                client_secret: 'cx84im8OqngRMM3EftMAfKh1vwEFuSuAD9GH2gE7JxzjE7lJCTI55ZJND8MFPOGkHcFesA9Piy9CgKSzaz3L0bKyspdhq1w8wRouYwhrv3ba8rNwvZ4ppnsebR0rccdB'
            };
            payload = Object.assign(payload, oauth_obj);
        }
        postAPIRequest(
            login_url,
            (results) => {
                if (results['access_token']) {
                    localStorage.token = results['access_token'];
                }
                if (results['otp']) {
                    this.setState({
                        username: username,
                        password: password,
                        activity: false,
                        otp_form: true,
                        message: true,
                        message_text: results['otp'],
                        message_variant: 'success'
                    });
                } else {
                    this.setState({
                        activity: false
                    }, pushHistory(this.props, '/'));
                }
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
                'Content-Type': 'application/json'
            }
        );
    };

    handleSubmitSignUp(e) {
        e.preventDefault();
        this.setState({
            activity: true
        });
        let formData = new FormData($('form#sign-up-form')[0]);
        let payload = {};
        payload = formDataToPayload(formData, payload);
        let sign_up_url = serverBaseUrl() + '/registration/initial_setup/';
        payload['username'] = payload['email'];
        payload['confirm_password'] = payload['password'];
        payload['organization_name'] = payload['email'].split('@')[0];
        payload['organization_slogan'] = '';
        payload['organization_type'] = 'other';
        payload['how_you_knew_about_us'] = 'google';
        payload['system_use'] = 'loanbook';
        payload['location'] = '';
        payload['jisort_apps'] = true;
        postAPIRequest(
            sign_up_url,
            () => {
                this.handleLogin(payload['username'], payload['password']);
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
                'Content-Type': 'application/json'
            }
        );
    }

    render() {
        let sign_up_button = <Button variant="contained" color="primary" type="submit">
            Sign up
        </Button>;
        let otp_button = <Button variant="contained" color="primary" type="submit">
            Login
        </Button>;
        if (this.state.loading) {
            return <AppLoadingIndicator/>;
        }
        if (this.state.activity) {
            sign_up_button = <FormActivityIndicator/>;
            otp_button = <FormActivityIndicator/>;
        }
        let message = '';
        if (this.state.message) {
            message = <FormFeedbackMessage
                message_variant={this.state.message_variant}
                message_text={this.state.message_text}
            />;
        }

        let form = <form
            noValidate
            autoComplete="off"
            id="sign-up-form"
            onSubmit={(e) => this.handleSubmitSignUp(e)}
        >
            <div>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <TextField type="email" label="Email" name="email"/>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <TextField label="Phone number" name="phone_number" defaultValue={this.state.phone_number}/>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <TextField type="password" label="Password" name="password"/>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            {sign_up_button}
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <Box display="flex" justifyContent="center">
                                <Link href="#" onClick={() => pushHistory(this.props, '/login')}>
                                    login
                                </Link>
                            </Box>
                        </FormControl>
                    </Grid>
                </Grid>
            </div>
        </form>;

        if (this.state.otp_form) {
            form = <form
                noValidate
                autoComplete="off"
                id="otp-form"
                onSubmit={(e) => this.handleSubmitOTP(e)}
            >
                <div>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <TextField type="number" label="OTP" name="otp"/>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                {otp_button}
                            </FormControl>
                        </Grid>
                    </Grid>
                </div>
            </form>;
        }

        return (
            <Paper className="Login-container">
                <Container maxWidth="sm">
                    <Grid
                        container
                        spacing={0}
                        alignItems="center"
                        justify="center"
                        className="login-grid"
                    >
                        <Card>
                            <CardContent>
                                {message}
                                {form}
                            </CardContent>
                        </Card>
                    </Grid>
                </Container>
            </Paper>
        )
    }
}

export default withRouter(FormSignUp);
