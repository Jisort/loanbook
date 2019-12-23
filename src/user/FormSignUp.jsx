import React, {Component} from "react";
import {withRouter} from "react-router-dom";
import {Button, Card, CardContent, Container, FormControl, Grid, Paper, TextField} from "@material-ui/core";
import FormActivityIndicator from "../components/FormActivityIndicator";
import FormFeedbackMessage from "../components/FormFeedbackMessage";

class FormSignUp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activity: false,
            message: false,
            message_text: null,
            message_variant: 'info'
        }
    }

    render() {
        let sign_up_button = <Button variant="contained" color="primary" type="submit">
            Sign up
        </Button>;
        if (this.state.activity) {
            sign_up_button = <FormActivityIndicator/>;
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
                                    id="sign-up-form"
                                >
                                    <div>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12}>
                                                <FormControl fullWidth>
                                                    <TextField label="Email" name="email"/>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <FormControl fullWidth>
                                                    <TextField label="Phone number" name="phone_number"/>
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

export default withRouter(FormSignUp);