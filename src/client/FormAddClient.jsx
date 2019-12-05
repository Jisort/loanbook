import React, {Component} from "react";
// import DatePicker from "react-datepicker";
import moment from "moment";
import {countries} from 'countries-list';
// import Select from 'react-select';
// import IntlTelInput from 'react-intl-tel-input';
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
import {TextField, Grid, FormControl, Select, MenuItem, InputLabel} from "@material-ui/core";
import DatePicker from "../components/DatePicker";
import AutocompleteSelect from "../components/AutocompleteSelect";

class ClientDetailsForm extends Component {

    constructor(props) {
        super(props);
        let _18_years_ago = moment().subtract(18, 'years').toDate();
        this.state = {
            _18_years_ago: _18_years_ago,
            selected_date: _18_years_ago,
            selected_country: '',
            activity: false,
            alert: false,
            alert_class: 'alert alert-primary',
            alert_message: null,
            phone_country_code: '+254'
        };
    }

    componentDidMount() {
        lookup((country) => {
            console.log(country);
            this.setState({
                phone_country_code: country
            });
        })
    }

    handleChange = date => {
        this.setState({
            selected_date: date
        });
    };

    handleCountryChange = selectedOption => {
        this.setState({
            selected_country: selectedOption
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
                    alert: true,
                    alert_message: 'Client added successfully',
                    alert_class: 'alert alert-success',
                    activity: false
                });
                const {sessionVariables, dispatch} = this.props;
                let clients_url = sessionVariables['clients_url'] || '';
                dispatch(fetchDataIfNeeded(clients_url));
                dispatch(invalidateData(clients_url));
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
    }


    render() {
        let countries_list = Object.keys(countries).map(function (key) {
            let country = countries[key];
            return {
                value: key,
                label: country.name,
                optionDisplay: country.name + '(' + country.native + ')'
            }
        });

        let add_client_button = <button className="btn btn-primary">Add Client</button>;
        if (this.state.activity) {
            add_client_button = <FormActivityIndicator/>;
        }

        let message = '';
        if (this.state.alert) {
            message = <FormFeedbackMessage alert_class={this.state.alert_class} alert_message={this.state.alert_message}/>;
        }

        return (
            <Grid className="container">
                {message}
                <form onSubmit={(e) => this.handleSubmitClient(e)} id="client-details-form">
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
                            <Select fullWidth name="gender" labelId="gender-select-label" required={true}>
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
                                />
                                {/*<Select*/}
                                {/*    value={this.state.selected_country}*/}
                                {/*    onChange={this.handleCountryChange}*/}
                                {/*    options={countries_list}*/}
                                {/*    name="country"*/}
                                {/*/>*/}
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
                                           name="mobile_no" required={true} defaultValue={this.state.phone_country_code}
                                />
                                {/*<IntlTelInput*/}
                                {/*    containerClassName="intl-tel-input"*/}
                                {/*    inputClassName="form-control"*/}
                                {/*    defaultCountry={'auto'}*/}
                                {/*    geoIpLookup={lookup}*/}
                                {/*    nationalMode={false}*/}
                                {/*    required={true}*/}
                                {/*    fieldName="mobile_no"*/}
                                {/*    telInputProps={{required: false}}*/}
                                {/*/>*/}
                            </FormControl>
                        </Grid>
                    </Grid>
                    {/*<Grid container spacing={3}>*/}
                    {/*    <div className="col d-flex justify-content-center">*/}
                    {/*        {add_client_button}*/}
                    {/*    </div>*/}
                    {/*</Grid>*/}
                </form>
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