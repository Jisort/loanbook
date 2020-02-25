import React, {Component} from "react";
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {extractResponseError, formDataToPayload, getUrlData, UTCToLocalTime} from "../functions/componentActions";
import {serverBaseUrl} from "../functions/baseUrls";
import {fetchDataIfNeeded, setSessionVariable} from "../actions/actions";
import {
    Button, FormControl, Grid,
    Table, TableBody, TableCell,
    TableRow, TableHead,
    TableContainer, Typography, Fab,
    Box, Select, MenuItem, InputLabel
} from "@material-ui/core";
import FormFeedbackMessage from "../components/FormFeedbackMessage";
import AutocompleteSelect from "../components/AutocompleteSelect";
import DatePicker from "../components/DatePicker";
import ComponentLoadingIndicator from "../components/ComponentLoadingIndicator";
import FormActivityIndicator from "../components/FormActivityIndicator";
import {getAPIRequest} from "../functions/APIRequests";
import moment from "moment";
import ReactToPrint from 'react-to-print';
import {Print} from '@material-ui/icons';
import $ from "jquery";

class CustomReports extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activity: false,
            message: false,
            message_variant: 'info',
            message_text: null,
            selected_report: null,
            report_data: [],
            report_inputs: []
        }
    }

    componentDidMount() {
        this.fetchUrlData('custom_reports', '/report_builder/api/report/');
    }

    fetchUrlData = (var_name, url) => {
        const {dispatch} = this.props;
        url = serverBaseUrl() + url;
        this.props.dispatch(setSessionVariable(var_name, url));
        dispatch(fetchDataIfNeeded(url));
    };

    handleReportChange = (report_object) => {
        const {custom_reports_data} = this.props;
        let custom_reports = custom_reports_data['items'];
        let selected_report = custom_reports.find(function (report) {
            return report.id === report_object.value;
        });
        this.setState({
            selected_report: selected_report
        });
    };

    handleDateChange = date => {
        this.setState({
            selected_date: date
        });
    };

    handleGenerateReport(e) {
        e.preventDefault();
        this.setState({
            activity: true
        });
        let data = {};
        let formData = new FormData($('form#custom-reports-form')[0]);
        data = formDataToPayload(formData, data);
        let selected_report = this.state.selected_report;
        let report_filters = selected_report['filterfield_set'];
        report_filters.forEach((filter) => {
            let filter_name = filter['field'] + '_filter_value';
            let filter_name2 = filter['field'] + '_filter_value2';
            if (filter['filter_value'] === "" && this.state[filter_name]) {
                if (filter['field_type'] === 'DateField') {
                    data[filter_name] = moment(this.state[filter_name]).format('YYYY-MM-DD');
                } else {
                    data[filter_name] = this.state[filter_name];
                }
                if (filter['filter_type'] === "range" && this.state[filter_name2]) {
                    if (filter['field_type'] === 'DateField') {
                        data[filter_name2] = moment(this.state[filter_name2]).format('YYYY-MM-DD');
                    } else {
                        data[filter_name2] = this.state[filter_name2];
                    }
                }
            }
        });
        let url_params = new URLSearchParams(data).toString();
        let url = serverBaseUrl() + `/report_builder/api/report/${selected_report['id']}/generate/?${url_params}`;
        getAPIRequest(url, (results) => {
                this.setState({
                    report_data: results,
                    activity: false
                })
            }, (results) => {
                let alert_message = extractResponseError(results);
                this.setState({
                    alert: true,
                    alert_message: alert_message,
                    alert_class: 'alert alert-danger',
                    activity: false
                });
            },
            {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.token
            })
    }

    render() {
        const {custom_reports_data} = this.props;
        let custom_reports = custom_reports_data['items'];
        if (custom_reports_data['isFetching']) {
            return <ComponentLoadingIndicator/>;
        }
        let generate_report_button = <Button variant="contained" color="primary" type="submit">
            Generate report
        </Button>;
        if (this.state.activity) {
            generate_report_button = <FormActivityIndicator/>;
        }
        let date_range_filters = '';
        let select_filters = '';
        let date_lte_gte_filters = '';
        if (this.state.selected_report) {
            let selected_report = this.state.selected_report;
            let report_filters = selected_report['filterfield_set'];
            let date_range_filter = report_filters.filter(function (el) {
                return el['field_type'] === 'DateField' && el['filter_type'] === 'range';
            });
            let date_lte_gte_filter = report_filters.filter(function (el) {
                return el['field_type'] === 'DateField' &&
                    ['lt', 'lte', 'gt', 'gte'].indexOf(el['filter_type']) !== -1;
            });
            let select_filter = report_filters.filter(function (el) {
                return el['filter_type'] === 'exact' &&
                    el['field'] === 'id' &&
                    el['select_list'].length > 0;
            });
            date_lte_gte_filters = date_lte_gte_filter.map((date_lte_gte_filter, key) => {
                let exclude = '';
                if (date_lte_gte_filter.exclude) {
                    exclude = 'exclude ';
                }
                let from_to = 'to';
                if (date_lte_gte_filter['filter_type'] === 'lte') {
                    from_to = 'to(including)';
                } else if (date_lte_gte_filter['filter_type'] === 'gt') {
                    from_to = 'from';
                } else if (date_lte_gte_filter['filter_type'] === 'gte') {
                    from_to = 'from(including)';
                }
                let date_lte_gte_name = date_lte_gte_filter.field + '_filter_value';
                let label_name = `${exclude}${date_lte_gte_filter['field_verbose']} ${from_to}`;
                return <Grid item xs={6} key={key}>
                    <DatePicker
                        label={label_name}
                        value={this.state[date_lte_gte_name] || null}
                        onChange={date => {
                            this.setState({
                                [date_lte_gte_name]: date
                            });
                        }}
                        format="YYYY-MM-DD"
                        fullWidth={true}
                    />
                </Grid>
            });
            date_range_filters = date_range_filter.map((date_range_filter) => {
                let date_from_name = date_range_filter.field + '_filter_value';
                let date_to_name = date_range_filter.field + '_filter_value2';
                let exclude = '';
                if (date_range_filter.exclude) {
                    exclude = 'exclude ';
                }
                let from_label_name = `${exclude}${date_range_filter['field_verbose']} from`;
                let to_label_name = `${exclude}${date_range_filter['field_verbose']} to`;
                return [
                    <Grid item xs={6}>
                        <DatePicker
                            label={from_label_name}
                            value={this.state[date_from_name] || null}
                            onChange={date => {
                                this.setState({
                                    [date_from_name]: date
                                });
                            }}
                            format="YYYY-MM-DD"
                            fullWidth={true}
                        />
                    </Grid>,
                    <Grid item xs={6}>
                        <DatePicker
                            label={to_label_name}
                            value={this.state[date_to_name] || null}
                            onChange={date => {
                                this.setState({
                                    [date_to_name]: date
                                });
                            }}
                            format="YYYY-MM-DD"
                            fullWidth={true}
                        />
                    </Grid>
                ]
            });
            select_filters = select_filter.map((select_filter) => {
                let options = select_filter['select_list'].map(function (option) {
                    return <MenuItem value={option.id}>{option.display}</MenuItem>
                });
                let exclude = '';
                if (select_filter.exclude) {
                    exclude = 'exclude ';
                }
                let field_name = select_filter.path.replace(/__/g, ' ');
                field_name = field_name.replace(/_/g, ' ');
                let field_ref = select_filter.path + select_filter.field + '_filter_value';
                return <Grid item xs={6}>
                    <InputLabel id="filter-select-label">{exclude}{field_name}</InputLabel>
                    <Select fullWidth className="form-control" name={field_ref} ref={field_ref}
                            labelId="filter-select-label">
                        <MenuItem>select option</MenuItem>
                        {options}
                    </Select>
                </Grid>
            });
        }
        let message = '';
        if (this.state.message) {
            message = <FormFeedbackMessage
                message_variant={this.state.message_variant}
                message_text={this.state.message_text}
            />;
        }
        custom_reports = custom_reports.filter(function (report) {
            return report.name.startsWith('loanbook - ');
        });
        let custom_reports_list = custom_reports.map(function (report) {
            let report_name = report.name.replace('loanbook - ', '');
            return {
                value: report.id,
                label: report_name,
                optionDisplay: report_name
            }
        });
        let report = '';
        let thead = '';
        if (this.state.report_data['data'] && this.state.report_data['meta']) {
            let data = this.state.report_data.data;
            let meta = this.state.report_data.meta;
            let titles = meta['titles'];
            let selected_report = this.state.selected_report;
            let displayfield_set = selected_report['displayfield_set'];
            thead = titles.map(function (title, key) {
                return <TableCell key={key}>{title}</TableCell>
            });
            let report_body = data.map(function (row, row_key) {
                let rows = titles.map(function (title, key) {
                    let displayfield = displayfield_set[key];
                    let cell = '';
                    if (row[key]) {
                        cell = row[key];
                    }
                    if (displayfield['field_type'] === "DateField") {
                        cell = UTCToLocalTime(cell, moment, null, 'YYYY-MM-DD');
                    } else if (displayfield['field_type'] === "DateTimeField") {
                        cell = UTCToLocalTime(cell, moment);
                    }
                    return <TableCell key={key}>{cell}</TableCell>
                });
                return <TableRow key={row_key}>
                    {rows}
                </TableRow>
            });
            let report_name = selected_report.name.replace('loanbook - ', '');
            report = <div>
                <ReactToPrint
                    trigger={() => <Fab variant="extended" color="default">
                        <Print/>
                        Print
                    </Fab>}
                    content={() => this.componentRef}
                />
                <Typography variant="h6" id="tableTitle">
                    {report_name}
                </Typography>
                <Table aria-label="simple table" stickyHeader ref={el => (this.componentRef = el)}>
                    <TableHead>
                        <TableRow>
                            {thead}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {report_body}
                    </TableBody>
                </Table>
            </div>
        }
        return (
            <TableContainer className="fixedHeaderTable">
                <Grid container>
                    <Grid item xs={12}>
                        <Box m={2}>
                            {message}
                            <form id="custom-reports-form" onSubmit={(e) => this.handleGenerateReport(e)}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <FormControl fullWidth>
                                            <AutocompleteSelect
                                                label="Report"
                                                optionLabel="label"
                                                data={custom_reports_list}
                                                onChange={(value) => this.handleReportChange(value)}
                                            />
                                        </FormControl>
                                    </Grid>
                                    {date_lte_gte_filters}
                                    {date_range_filters}
                                    {select_filters}
                                    <Grid item xs={12}>
                                        <FormControl fullWidth>
                                            {generate_report_button}
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </form>
                            <Grid container>
                                <Grid item xs={12}>
                                    <Box mt={5}>
                                        {report}
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>
            </TableContainer>
        )
    }
}

CustomReports.propTypes = {
    sessionVariables: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    custom_reports_data: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    function retrieveUrlData(url_var_name) {
        let url = sessionVariables[url_var_name] || '';
        return getUrlData(url, dataByUrl);
    }

    const {sessionVariables, dataByUrl} = state;
    const custom_reports_data = retrieveUrlData('custom_reports', dataByUrl);

    return {
        sessionVariables,
        custom_reports_data
    }
}

export default connect(mapStateToProps)(withRouter(CustomReports))
