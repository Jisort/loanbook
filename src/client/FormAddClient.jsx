import React, {Component} from "react";
import moment from "moment";
import {countries} from 'countries-list';
import {extractResponseError, lookup, formDataToPayload} from "../functions/componentActions";
import FormActivityIndicator from "../components/FormActivityIndicator";
import $ from 'jquery';
import {serverBaseUrl} from "../functions/baseUrls";
import {postAPIRequest} from "../functions/APIRequests";
import {
    fetchDataIfNeeded,
    invalidateData
} from '../actions/actions';
import FormFeedbackMessage from "../components/FormFeedbackMessage";
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import {
    TextField, Grid, FormControl, Select,
    MenuItem, InputLabel, DialogActions,
    DialogContent, Button
} from "@material-ui/core";
import DatePicker from "../components/DatePicker";
import AutocompleteSelect from "../components/AutocompleteSelect";
import AppLoadingIndicator from "../components/AppLoadingIndicator";

class ClientDetailsForm extends Component {

    constructor(props) {
        super(props);
        let _18_years_ago = moment().subtract(18, 'years').toDate();
        this.state = {
            _18_years_ago: _18_years_ago,
            selected_date: _18_years_ago,
            selected_country: '',
            activity: false,
            message: false,
            message_variant: 'info',
            message_text: null,
            mobile_no: '',
            loading: true
        };
    }

    componentDidMount() {
        lookup((country) => {
            let country_object = countries[country] || {};
            this.setState({
                loading: false,
                mobile_no: '+' + country_object['phone']
            });
        })
    }

    handleDateChange = date => {
        this.setState({
            selected_date: date
        });
    };

    handleSubmitClient(e) {
        e.preventDefault();
        this.setState({activity: true});
        let formData = new FormData($('form#client-details-form')[0]);
        let date_of_birth = this.state.selected_date;
        if (typeof date_of_birth === "object") {
            date_of_birth = moment(date_of_birth).format('YYYY-MM-DD');
        }
        let payload = {
            date_of_birth: date_of_birth
        };
        payload = formDataToPayload(formData, payload);
        let clients_url = serverBaseUrl() + '/registration/members/';
        postAPIRequest(clients_url,
            (results) => {
                this.setState({
                    message: true,
                    message_text: 'Client added successfully',
                    message_variant: 'success',
                    activity: false
                });
                $("form#client-details-form")[0].reset();
                const {sessionVariables, dispatch} = this.props;
                let clients_url = sessionVariables['clients_url'] || '';
                dispatch(invalidateData(clients_url));
                dispatch(fetchDataIfNeeded(clients_url));
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

    handleCountryChange = (country_object) => {
        this.setState({
            selected_country: country_object['label'],
        });
        document.querySelector('input[name=mobile_no]').value = country_object['phone'];
    };


    render() {
        if (this.state.loading) {
            return <AppLoadingIndicator/>;
        }
        let countries_list = Object.keys(countries).map(function (key) {
            let country = countries[key];
            return {
                value: key,
                label: country.name,
                optionDisplay: country.name + '(' + country.native + ')',
                phone: '+' + country.phone
            }
        });

        let add_client_button = <DialogActions>
            <Button color="primary" type="submit">
                Add client
            </Button>
            <Button onClick={this.props['handleClose']} color="primary">
                Close
            </Button>
        </DialogActions>;
        if (this.state.activity) {
            add_client_button = <FormActivityIndicator/>;
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
                    <form onSubmit={(e) => this.handleSubmitClient(e)} id="client-details-form">
                        <DialogContent>
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <TextField fullWidth type="text" label="First name" name="first_name" required={true}/>
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField fullWidth type="text" label="Last name" name="last_name" required={true}/>
                                </Grid>
                            </Grid>
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <TextField fullWidth type="text" label="ID no" name="id_no" required={true}/>
                                </Grid>
                                <Grid item xs={6}>
                                    <InputLabel id="gender-select-label">Gender</InputLabel>
                                    <Select fullWidth name="gender" labelId="gender-select-label"
                                            defaultValue="male" required={true}>
                                        <MenuItem value="male">Male</MenuItem>
                                        <MenuItem value="female">Female</MenuItem>
                                        <MenuItem value="other">Other</MenuItem>
                                    </Select>
                                </Grid>
                            </Grid>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <DatePicker
                                        label="Date of birth"
                                        maxDate={this.state._18_years_ago}
                                        value={this.state.selected_date}
                                        onChange={this.handleDateChange}
                                        format="YYYY-MM-DD"
                                        fullWidth={true}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <AutocompleteSelect
                                            label="Country"
                                            optionLabel="label"
                                            data={countries_list}
                                            onChange={(value) => this.handleCountryChange(value)}
                                        />
                                    </FormControl>
                                </Grid>
                            </Grid>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField fullWidth type="email" label="Email" name="email" required={true}/>
                                </Grid>
                            </Grid>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <TextField fullWidth type="text" label="Phone number"
                                                   name="mobile_no" ref="mobile_no" required={true}
                                                   defaultValue={this.state.mobile_no}
                                        />
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        {add_client_button}
                    </form>
                </Grid>
            </Grid>
        )
    }
}

ClientDetailsForm.propTypes = {
    sessionVariables: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
    const {sessionVariables} = state;

    return {
        sessionVariables,
    }
}

export default connect(mapStateToProps)(withRouter(ClientDetailsForm))
