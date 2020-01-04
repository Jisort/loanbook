import React, {Component} from "react";
import {withRouter} from 'react-router-dom';
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {Box, Button, Card, CardContent, Container, FormControl, Grid, InputLabel, MenuItem, Paper, Select, TextField} from "@material-ui/core";
import AutocompleteSelect from "../components/AutocompleteSelect";
import Data from "currency-codes/data";
import {countries} from "countries-list";
import FormActivityIndicator from "../components/FormActivityIndicator";

class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected_currency: '',
            selected_country: ''
        }
    }

    handleChangeCurrency = (currency_object) => {
        this.setState({
            selected_currency: currency_object['label'],
        });
    };

    handleCountryChange = (country_object) => {
        this.setState({
            selected_country: country_object['label'],
        });
    };

    render() {
        let settings_button = <Button variant="contained" color="primary" type="submit">
            Update
        </Button>;
        if (this.state.activity) {
            settings_button = <FormActivityIndicator/>;
        }

        let currencies_list = Data.map(function (currency) {
            return {
                value: currency.number,
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
        return (
            <Paper>
                <Box p={4}>
                    <form>
                        <Grid container spacing={3}>
                            <Grid item xs={8}>
                                <FormControl fullWidth>
                                    <AutocompleteSelect
                                        label="Currency"
                                        optionLabel="label"
                                        data={currencies_list}
                                        onChange={(value) => this.handleChangeCurrency(value)}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={8}>
                                <FormControl fullWidth>
                                    <AutocompleteSelect
                                        label="Country"
                                        optionLabel="label"
                                        data={countries_list}
                                        onChange={(value) => this.handleCountryChange(value)}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={8}>
                                <FormControl fullWidth>
                                    <TextField fullWidth name="bank" label="Bank"/>
                                </FormControl>
                            </Grid>
                            <Grid item xs={8}>
                                <FormControl fullWidth>
                                    <InputLabel id="payment-method-select-label">Payment method</InputLabel>
                                    <Select fullWidth name="payment_mode" labelId="payment-method-select-label"
                                            defaultValue="cash" required={true}>
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
                            <Grid item xs={8}>
                                <FormControl fullWidth>
                                    <TextField fullWidth name="organization_name" label="Organization"/>
                                </FormControl>
                            </Grid>
                            <Grid item xs={8}>
                                <FormControl fullWidth>
                                    <TextField fullWidth name="phone_number" label="Phone number"/>
                                </FormControl>
                            </Grid>
                            <Grid item xs={8}>
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
};

function mapStateToProps(state) {
    const {sessionVariables} = state;

    return {
        sessionVariables,
    }
}

export default connect(mapStateToProps)(withRouter(Settings))