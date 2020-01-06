import React, {Component} from "react";
import {withRouter} from 'react-router-dom';
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {Box, Button, FormControl, Grid, InputLabel, MenuItem, Paper, Select, TextField} from "@material-ui/core";
import AutocompleteSelect from "../components/AutocompleteSelect";
import Data from "currency-codes/data";
import {countries} from "countries-list";
import FormActivityIndicator from "../components/FormActivityIndicator";
import {serverBaseUrl} from "../functions/baseUrls";
import {fetchDataIfNeeded, invalidateData, setSessionVariable} from "../actions/actions";
import {extractResponseError, formDataToPayload, getUrlData} from "../functions/componentActions";
import ComponentLoadingIndicator from "../components/ComponentLoadingIndicator";
import $ from "jquery";
import {postAPIRequest} from "../functions/APIRequests";
import FormFeedbackMessage from "../components/FormFeedbackMessage";

class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected_currency: '',
            selected_country: ''
        }
    }

    componentDidMount() {
        this.fetchUrlData('banks_url', '/registration/banks/');
        this.fetchUrlData('currencies_url', '/registration/currency/');
        this.fetchUrlData('payments_mode_url', '/registration/payment_modes/');
        this.fetchUrlData('organization_url', '/registration/organizations/');
    }

    fetchUrlData = (var_name, url) => {
        const {dispatch} = this.props;
        url = serverBaseUrl() + url;
        this.props.dispatch(setSessionVariable(var_name, url));
        dispatch(fetchDataIfNeeded(url));
    };

    handleChangeCurrency = (currency_object) => {
        this.setState({
            selected_currency: currency_object['value'],
        });
    };

    handleCountryChange = (country_object) => {
        this.setState({
            selected_country: country_object['value'],
        });
    };

    handleUpdateOrganization = (name, mobile_no, country, callback) => {
        const {
            organization_data
        } = this.props;
        let organization = organization_data['items'][0] || {};
        if (country === '') {
            country = organization['location'];
        }
        let payload = {
            name: name,
            mobile_no: mobile_no,
            location: country
        };
        let organization_url = serverBaseUrl() + `/registration/organizations/${organization['id']}/`;
        postAPIRequest(
            organization_url,
            () => {
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
            'PUT'
        );
    };

    handleCreateUpdateCurrency = () => {
        let selected_currency = Data.find((currency) => {
           return currency['code'] === this.state.selected_currency
        });
        const {
            currencies_data
        } = this.props;
        let currencies = currencies_data['items'];
        let request_method = 'POST';
        let currencies_url = serverBaseUrl() + '/registration/currency/';
        if (currencies.length > 0) {
            request_method = 'PUT';
            currencies_url = serverBaseUrl() + `/registration/currency/${currencies[0]['id']}/`;
        }
        let payload = {
            name: selected_currency['currency'],
            code: selected_currency['code'],
        };
        postAPIRequest(
            currencies_url,
            () => {
                this.setState({
                    message: true,
                    message_text: 'Successfully updated settings',
                    message_variant: 'success',
                    activity: false
                });
                const {sessionVariables, dispatch} = this.props;
                let organization_url = sessionVariables['organization_url'] || '';
                let payments_mode_url = sessionVariables['payments_mode_url'] || '';
                let currencies_url = sessionVariables['currencies_url'] || '';
                dispatch(invalidateData(organization_url));
                dispatch(invalidateData(payments_mode_url));
                dispatch(invalidateData(currencies_url));
                dispatch(fetchDataIfNeeded(organization_url));
                dispatch(fetchDataIfNeeded(payments_mode_url));
                dispatch(fetchDataIfNeeded(currencies_url));
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
            request_method
        )
    };

    handleCreateUpdatePaymentMode = (name, callback) => {
        const {
            payments_mode_data
        } = this.props;
        let payments_mode = payments_mode_data['items'];
        let request_method = 'POST';
        let payment_mode_url = serverBaseUrl() + '/registration/payment_modes/';
        if (payments_mode.length > 0) {
            request_method = 'PUT';
            payment_mode_url = serverBaseUrl() + `/registration/payment_modes/${payments_mode[0]['id']}/`;
        }
        let payload = {
            name: name,
            description: name,
            is_cash_payment: '2'
        };
        postAPIRequest(
            payment_mode_url,
            () => {
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
            request_method
        )
    };

    handleUpdateSettings(e) {
        e.preventDefault();
        this.setState({
            activity: true
        });
        let payload = {
            currency: this.state.selected_currency,
            country: this.state.selected_country
        };
        let formData = new FormData($('form#settings-form')[0]);
        payload = formDataToPayload(formData, payload);
        this.handleUpdateOrganization(
            payload['organization_name'],
            payload['mobile_no'],
            payload['country'],
            () => this.handleCreateUpdatePaymentMode(payload['payment_mode'],
                () => this.handleCreateUpdateCurrency()
            )
        );
    }

    render() {
        const {
            banks_data,
            payments_mode_data,
            currencies_data,
            organization_data
        } = this.props;
        let bank = banks_data['items'][0] || {};
        let payment_mode = payments_mode_data['items'][0] || {name: 'cash'};
        let currency_object = Data.find(function (currency) {
            return currency['code'] === (currencies_data['items'][0] || {})['code'];
        });
        let currency = undefined;
        if (currency_object) {
            currency = {
                value: currency_object['code'],
                label: currency_object.currency,
                optionDisplay: currency_object.currency + '(' + currency_object.code + ')',
            }
        }
        let organization = organization_data['items'][0] || {};
        let country_object = countries[organization['location']] || {};
        let location = {

            value: organization['location'],
            label: country_object['name'],
            optionDisplay: country_object.name + '(' + country_object.native + ')',
        };
        if (!countries[organization['location']]) {
            location = undefined;
        }
        let settings_button = <Button variant="contained" color="primary" type="submit">
            Update
        </Button>;
        if (this.state.activity) {
            settings_button = <FormActivityIndicator/>;
        }

        let currencies_list = Data.map(function (currency) {
            return {
                value: currency.code,
                label: currency.currency,
                optionDisplay: currency.currency + '(' + currency.code + ')',
            }
        });

        let countries_list = Object.keys(countries).map(function (key) {
            let country = countries[key];
            return {
                value: key,
                label: country.name,
                optionDisplay: country.name + '(' + country.native + ')',
                phone: '+' + country.phone
            }
        });

        let message = '';
        if (this.state.message) {
            message = <FormFeedbackMessage
                message_variant={this.state.message_variant}
                message_text={this.state.message_text}
            />;
        }

        if (organization_data['isFetching'] || payments_mode_data['isFetching'] || currencies_data['isFetching']) {
            return <ComponentLoadingIndicator/>;
        }
        return (
            <Paper>
                <Box p={4}>
                    {message}
                    <form onSubmit={(e) => this.handleUpdateSettings(e)} id="settings-form">
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <AutocompleteSelect
                                        label="Currency"
                                        optionLabel="label"
                                        data={currencies_list}
                                        onChange={(value) => this.handleChangeCurrency(value)}
                                        defaultValue={currency}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <AutocompleteSelect
                                        label="Country"
                                        optionLabel="label"
                                        data={countries_list}
                                        onChange={(value) => this.handleCountryChange(value)}
                                        defaultValue={location}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <TextField fullWidth name="bank" label="Bank" defaultValue={bank['bank_name']}/>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel id="payment-method-select-label">Payment method</InputLabel>
                                    <Select fullWidth name="payment_mode" labelId="payment-method-select-label"
                                            defaultValue={payment_mode['name']} required={true}>
                                        <MenuItem value="cash">Cash</MenuItem>
                                        <MenuItem value="cheque">Cheque</MenuItem>
                                        <MenuItem value="credit card">Credit card</MenuItem>
                                        <MenuItem value="mobile payment">Mobile payment</MenuItem>
                                        <MenuItem value="bank transfer">Bank transfer</MenuItem>
                                        <MenuItem value="ewallet">Ewallet</MenuItem>
                                        <MenuItem value="prepaid card">Prepaid card</MenuItem>
                                        <MenuItem value="direct deposit">Direct deposit</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <TextField fullWidth name="organization_name" label="Organization"
                                               defaultValue={organization['name']}/>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <TextField fullWidth name="mobile_no" label="Phone number"
                                               defaultValue={organization['mobile_no']}/>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    {settings_button}
                                </FormControl>
                            </Grid>
                        </Grid>
                    </form>
                </Box>
            </Paper>
        )
    }
}

Settings.propTypes = {
    sessionVariables: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    banks_data: PropTypes.object.isRequired,
    payments_mode_data: PropTypes.object.isRequired,
    currencies_data: PropTypes.object.isRequired,
    organization_data: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    function retrieveUrlData(url_var_name) {
        let url = sessionVariables[url_var_name] || '';
        return getUrlData(url, dataByUrl);
    }

    const {sessionVariables, dataByUrl} = state;
    const banks_data = retrieveUrlData('banks_url', dataByUrl);
    const payments_mode_data = retrieveUrlData('payments_mode_url', dataByUrl);
    const currencies_data = retrieveUrlData('currencies_url', dataByUrl);
    const organization_data = retrieveUrlData('organization_url', dataByUrl);

    return {
        sessionVariables,
        banks_data,
        payments_mode_data,
        currencies_data,
        organization_data
    }
}

export default connect(mapStateToProps)(withRouter(Settings))