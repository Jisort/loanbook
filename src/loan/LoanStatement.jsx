import React, {Component} from "react";
import {
    Table, Paper, TableHead,
    TableRow, TableCell, TableBody,
    Grid, Box
} from '@material-ui/core';
import moment from "moment";
import {getUrlData, numberWithCommas, dynamicSort} from "../functions/componentActions";
import {serverBaseUrl} from "../functions/baseUrls";
import {fetchDataIfNeeded, setSessionVariable} from "../actions/actions";
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import ComponentLoadingIndicator from "../components/ComponentLoadingIndicator";

class LoanStatement extends Component {

    componentDidMount() {
        let loan_id = this.props['selected_loan']['id'];
        this.fetchUrlData('loan_ledgers_url', `/general_ledger/general_ledger/?loan=${loan_id}`);
        this.fetchUrlData('loan_schedule_url', `/products/repayment_schedule/?loan=${loan_id}`);
    }

    fetchUrlData = (var_name, url) => {
        const {dispatch} = this.props;
        url = serverBaseUrl() + url;
        this.props.dispatch(setSessionVariable(var_name, url));
        dispatch(fetchDataIfNeeded(url));
    };

    render() {
        const {loan_ledgers_data, loan_schedule_data} = this.props;
        let loan = this.props['selected_loan'];
        let today_date = moment().format('DD-MMM-YYYY');
        let loan_ledgers = loan_ledgers_data['items'];
        let loan_schedule = loan_schedule_data['items'];
        let statement_ledgers = [];
        for (let schedule of loan_schedule) {
            if (schedule['interest'] > 0) {
                let statement_ledger = Object();
                statement_ledger['date'] = schedule['date'];
                statement_ledger['charge'] = schedule['interest'];
                statement_ledger['debit'] = statement_ledger['charge'];
                statement_ledger['transaction_name'] = 'Profit charged';
                statement_ledger['amount'] = null;
                statement_ledgers.push(statement_ledger);
            }
            if (schedule['fees'] > 0) {
                let statement_ledger = Object();
                statement_ledger['date'] = schedule['date'];
                statement_ledger['charge'] = schedule['fees'];
                statement_ledger['debit'] = statement_ledger['charge'];
                statement_ledger['transaction_name'] = 'Fees charged';
                statement_ledger['amount'] = null;
                statement_ledgers.push(statement_ledger);
            }
            if (schedule['penalties'] > 0) {
                let statement_ledger = Object();
                statement_ledger['date'] = schedule['date'];
                statement_ledger['charge'] = schedule['penalties'];
                statement_ledger['debit'] = statement_ledger['charge'];
                statement_ledger['transaction_name'] = 'Penalties charged';
                statement_ledger['amount'] = null;
                statement_ledgers.push(statement_ledger);
            }
        }
        for (let ledger of loan_ledgers) {
            let statement_ledger = Object();
            statement_ledger['date'] = ledger['date'];
            statement_ledger['charge'] = null;
            statement_ledger['transaction_name'] = ledger['transaction_type_name'];
            if (ledger['debit'] > 0 && ledger['transaction_effect'] === 'increase') {
                statement_ledger['debit'] = ledger['debit'];
                if (ledger['transaction_type'] === 1) {
                    statement_ledger['amount'] = null;
                } else {
                    statement_ledger['amount'] = statement_ledger['debit'];
                }
            } else if (ledger['debit'] > 0 && ledger['transaction_effect'] === 'decrease') {
                statement_ledger['credit'] = ledger['debit'];
                statement_ledger['amount'] = statement_ledger['credit'];
            }
            if (statement_ledger['debit'] || statement_ledger['credit']) {
                statement_ledgers.push(statement_ledger);
            }
        }
        statement_ledgers.sort(dynamicSort('date'));
        let balance = 0;

        let statement_body = <TableRow>
                <TableCell colSpan={5}><ComponentLoadingIndicator/></TableCell>
            </TableRow>;
        if (!loan_ledgers_data['isFetching'] && !loan_schedule_data['isFetching']) {
            statement_body = statement_ledgers.map((ledger, key) => {
                if (ledger['debit']) {
                    balance += ledger['debit'];
                }
                if (ledger['credit']) {
                    balance -= ledger['credit'];
                }
                return <TableRow key={key}>
                    <TableCell component="th" scope="row">
                        {moment(ledger['date']).format('DD-MMM-YYYY')}
                    </TableCell>
                    <TableCell align="right">{ledger['transaction_name']}</TableCell>
                    <TableCell align="right">{numberWithCommas(ledger['amount'])}</TableCell>
                    <TableCell align="right">{numberWithCommas(ledger['charge'])}</TableCell>
                    <TableCell align="right">{numberWithCommas(balance)}</TableCell>
                </TableRow>;
            });
        }

        return (
            <Paper>
                <Grid container>
                    <Grid item xs={12}>
                        <Box display="flex" justifyContent="center" className="bold">
                            {loan['member_name']}
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <Box display="flex" justifyContent="center" className="bold">
                            Loan statement
                        </Box>
                    </Grid>
                </Grid>
                <Grid container>
                    <Grid item xs={6}>
                        <Box display="flex" justifyContent="flex-start" m={1}>
                            <Box className="bold">Statement date:</Box><Box>{today_date}</Box>
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Box display="flex" justifyContent="flex-end" m={1}>
                            <Box className="bold">Account no:</Box><Box>{loan['loan_reference_no']}</Box>
                        </Box>
                    </Grid>
                </Grid>
                <Grid container>
                    <Grid item xs={6}>
                        <Box display="flex" justifyContent="flex-start" m={1}>
                            <Box className="bold">Days in arrears:</Box><Box>12</Box>
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Box display="flex" justifyContent="flex-end" m={1}>
                            <Box className="bold">Outstanding balance:</Box>
                            <Box>{numberWithCommas(loan['outstanding_balance'])}</Box>
                        </Box>
                    </Grid>
                </Grid>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell align="right">Details</TableCell>
                            <TableCell align="right">Payment</TableCell>
                            <TableCell align="right">Charges</TableCell>
                            <TableCell align="right">Balance</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {statement_body}
                    </TableBody>
                </Table>
            </Paper>
        )
    }
}

LoanStatement.propTypes = {
    sessionVariables: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    loan_ledgers_data: PropTypes.object.isRequired,
    loan_schedule_data: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    function retrieveUrlData(url_var_name) {
        let url = sessionVariables[url_var_name] || '';
        return getUrlData(url, dataByUrl);
    }

    const {sessionVariables, dataByUrl} = state;
    const loan_ledgers_data = retrieveUrlData('loan_ledgers_url', dataByUrl);
    const loan_schedule_data = retrieveUrlData('loan_schedule_url', dataByUrl);

    return {
        sessionVariables,
        loan_ledgers_data,
        loan_schedule_data
    }
}

export default connect(mapStateToProps)(withRouter(LoanStatement))