import React, {Component} from "react";
import {Container, Card, CardContent, Button, Grid, Paper, Box, FormControl, TextField, Link} from "@material-ui/core";
import FormActivityIndicator from "../components/FormActivityIndicator";
import {withRouter} from "react-router-dom";
import {postAPIRequest, getAPIRequest} from "../functions/APIRequests";
import {serverBaseUrl} from "../functions/baseUrls";
import {pushHistory, extractResponseError, formDataToPayload} from "../functions/componentActions";
import $ from "jquery";
import FormFeedbackMessage from "../components/FormFeedbackMessage";
import SocialLoginButton from "../components/SocialLoginButton";
import {mdiGoogle, mdiFacebook} from '@mdi/js';

class FormLogin extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activity: false,
            message: false,
            message_text: null,
            message_variant: 'info',
            password_field: false,
            old_login: false,
            otp_form: false
        }
    }

    componentDidMount() {
        const search = this.props.location.search;
        const params = new URLSearchParams(search);
        if (!params.get('old_login')) {
            this.setState({
                old_login: true
            });
        }
    }

    handleSubmitOTP(e) {
        e.preventDefault();
        this.setState({
            activity: true
        });
        let formData = new FormData($('form#otp-form')[0]);
        let payload = {
            username: this.state.username,
            password: this.state.password
        };
        payload = formDataToPayload(formData, payload);
        this.handleLogin(payload);
    }

    handleLogin = (payload) => {
        let login_url = serverBaseUrl() + '/registration/login/';
        postAPIRequest(
            login_url,
            (results) => {
                if (results['access_token']) {
                    localStorage.token = results['access_token'];
                }
                if (results['otp']) {
                    this.setState({
                        username: payload['username'],
                        password: payload['password'],
                        activity: false,
                        otp_form: true,
                        password_field: false,
                        old_login: false,
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

    handleLoginSubmit = (e) => {
        e.preventDefault();
        this.setState({
            activity: true
        });
        let formData = new FormData($("form#login-form")[0]);
        let payload = {
            grant_type: 'password',
            client_id: 'i7YlkIu4qdkLZJsnJubhIbeYWP0Qq2NH3D0vatNO',
            client_secret: 'cx84im8OqngRMM3EftMAfKh1vwEFuSuAD9GH2gE7JxzjE7lJCTI55ZJND8MFPOGkHcFesA9Piy9CgKSzaz3L0bKyspdhq1w8wRouYwhrv3ba8rNwvZ4ppnsebR0rccdB'
        };
        if (!this.state.old_login) {
            payload['username'] = localStorage.email;
        }
        localStorage.username = payload.username;
        payload = formDataToPayload(formData, payload);
        this.handleLogin(payload);
    };

    handleSocialLogin = (user) => {
        this.setState({
            activity: true
        });
        let email = '';
        let profile = user['_profile'];
        email = profile['email'];
        localStorage.email = email;
        let check_login_url = serverBaseUrl() + `/registration/social_login/?email=${email}&check=${true}`;
        getAPIRequest(
            check_login_url,
            () => {
                this.setState({
                    password_field: true,
                    activity: false
                });
            },
            () => {
                this.setState({
                    activity: false
                }, pushHistory(this.props, '/signUp'));
            },
            {
                'Content-Type': 'application/json'
            }
        );
    };

    handleSocialLoginFailure = (err) => {
        console.error(err)
    };

    render() {
        let login_button = <Button variant="contained" color="primary" type="submit">
            Login
        </Button>;
        let otp_button = <Button variant="contained" color="primary" type="submit">
            Login
        </Button>;
        let social_login_button = '';
        if (this.state.activity) {
            login_button = <FormActivityIndicator/>;
            otp_button = <FormActivityIndicator/>;
            social_login_button = <FormActivityIndicator/>;
        }
        let message = '';
        if (this.state.message) {
            message = <FormFeedbackMessage
                message_variant={this.state.message_variant}
                message_text={this.state.message_text}
            />;
        }
        const facebook_login_button_styles = {
            backgroundColor: '#4267B2',
            color: '#ffffff'
        };
        const google_login_button_styles = {
            backgroundColor: '#4285F4',
            color: '#ffffff'
        };
        let social_form = <Grid container spacing={3}>
            <Grid item xs={12}>
                <Box display="flex" justifyContent="center">
                    <SocialLoginButton
                        provider='google'
                        appId='728448569900-o8kq5fpk4b92vtt4vp98bun9nb862klm.apps.googleusercontent.com'
                        onLoginSuccess={this.handleSocialLogin}
                        onLoginFailure={this.handleSocialLoginFailure}
                        styles={google_login_button_styles}
                        icon={mdiGoogle}
                        iconcolor="#ffffff"
                        key={'google'}
                    >
                        Login with Google
                    </SocialLoginButton>
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Box display="flex" justifyContent="center">
                    <SocialLoginButton
                        provider='facebook'
                        appId='817524248668013'
                        onLoginSuccess={this.handleSocialLogin}
                        onLoginFailure={this.handleSocialLoginFailure}
                        styles={facebook_login_button_styles}
                        icon={mdiFacebook}
                        iconcolor="#ffffff"
                        key={'facebook'}
                    >
                        Login with Facebook
                    </SocialLoginButton>
                </Box>
            </Grid>
            <Grid item xs={12}>
                <FormControl fullWidth>
                    {social_login_button}
                </FormControl>
            </Grid>
        </Grid>;
        if (this.state.password_field) {
            social_form = <form
                noValidate
                autoComplete="off"
                onSubmit={(e) => this.handleLoginSubmit(e)}
                id="login-form"
            >
                <div>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <TextField type="password" label="Password" name="password"/>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                {login_button}
                            </FormControl>
                        </Grid>
                    </Grid>
                </div>
            </form>;
        } else if (this.state.old_login) {
            social_form = <form
                noValidate
                autoComplete="off"
                onSubmit={(e) => this.handleLoginSubmit(e)}
                id="login-form"
            >
                <div>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <TextField label="Email/Username" name="username"/>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <TextField type="password" label="Password" name="password"/>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                {login_button}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <Box display="flex" justifyContent="center">
                                    <Link href="#" onClick={() => pushHistory(this.props, '/signUp')}>
                                        create account
                                    </Link>
                                </Box>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <Box display="flex" justifyContent="center">
                                    <Link href="https://my.jisort.com/reset_password/" target="_blank">
                                        reset password
                                    </Link>
                                </Box>
                            </FormControl>
                        </Grid>
                    </Grid>
                </div>
            </form>;
        } else if (this.state.otp_form) {
            social_form = <form
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
                                {social_form}
                            </CardContent>
                        </Card>
                    </Grid>
                </Container>
            </Paper>
        )
    }
}

export default withRouter(FormLogin);
