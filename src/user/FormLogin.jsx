import React, {Component} from "react";
import {Container, TextField, Card, CardContent, FormControl, Button, Grid, Paper} from "@material-ui/core";
import FormActivityIndicator from "../components/FormActivityIndicator";
import {withRouter} from "react-router-dom";
import {postAPIRequest} from "../functions/APIRequests";
import {serverBaseUrl} from "../functions/baseUrls";
import {pushHistory, extractResponseError, formDataToPayload} from "../functions/componentActions";
import $ from "jquery";
import FormFeedbackMessage from "../components/FormFeedbackMessage";

class FormLogin extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activity: false,
            message: false,
            message_text: null,
            message_variant: 'info'
        }
    }

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
        payload = formDataToPayload(formData, payload);
        localStorage.username = payload.username;
        let login_url = serverBaseUrl() + '/registration/login/';
        postAPIRequest(
            login_url,
            (results) => {
                if (results['access_token']) {
                    localStorage.token = results['access_token'];
                }
                this.setState({
                    activity: false
                }, pushHistory(this.props, '/'));
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

    render() {
        let login_button = <Button variant="contained" color="primary" type="submit">
            Login
        </Button>;
        if (this.state.activity) {
            login_button = <FormActivityIndicator/>;
        }
        let message = '';
        if (this.state.message) {
            message = <FormFeedbackMessage
                message_variant={this.state.message_variant}
                message_text={this.state.message_text}
            />;
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
                                <form
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
                                        </Grid>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </Grid>
                </Container>
            </Paper>
        )
    }
}

export default withRouter(FormLogin);