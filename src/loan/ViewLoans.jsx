import React, {Component} from "react";
import {Box, IconButton, Tooltip} from "@material-ui/core";
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import MaterialTable from "material-table";
import {getUrlData, numberWithCommas} from "../functions/componentActions";
import {serverBaseUrl} from "../functions/baseUrls";
import {fetchDataIfNeeded, setSessionVariable} from "../actions/actions";
import moment from "moment";
import {Receipt, Payment, Delete} from "@material-ui/icons";
import Modal from "../components/Modal";
import LoanStatement from "./LoanStatement";

class ViewLoans extends Component {
    constructor(props) {
        super(props);
        this.state = {
            statement_dialogue_open: false,
            selected_loan: {}
        }
    }

    componentDidMount() {
        this.fetchUrlData('active_loans_url', '/products/applied_loans/?status=1');
    }

    handleOpenDialogue = (dialogue) => {
        this.setState({
            [dialogue]: true
        })
    };

    handleCloseDialogue = (dialogue) => {
        this.setState({
            [dialogue]: false
        })
    };

    fetchUrlData = (var_name, url) => {
        const {dispatch} = this.props;
        url = serverBaseUrl() + url;
        this.props.dispatch(setSessionVariable(var_name, url));
        dispatch(fetchDataIfNeeded(url));
    };

    renderActionButtons = (rowData) => {
        return <Box display="flex" justifyContent="flex-end">
            <Tooltip title="Loan statement">
                <IconButton aria-label="statement"
                            onClick={() => this.setState({
                                selected_loan: rowData
                            }, () => this.handleOpenDialogue('statement_dialogue_open'))
                            }
                >
                    <Receipt/>
                </IconButton>
            </Tooltip>
            <Tooltip title="Add payment">
                <IconButton aria-label="payment">
                    <Payment/>
                </IconButton>
            </Tooltip>
            <Tooltip title="Reverse loan">
                <IconButton aria-label="reverse">
                    <Delete/>
                </IconButton>
            </Tooltip>
        </Box>
    };

    render() {
        const {active_loans_data} = this.props;
        let active_loans = active_loans_data['items'];
        let loans_columns = [{

            field: 'member_name',
            title: 'Client',
        }, {
            field: 'approved_amount',
            title: 'Amount',
            render: rowData => numberWithCommas(rowData['approved_amount'])
        }, {
            field: 'outstanding_balance',
            title: 'Balance',
            render: rowData => numberWithCommas(rowData['outstanding_balance'])
        }, {
            field: 'date_of_loan_application',
            title: 'Applied on',
            render: rowData => moment(rowData['date_of_loan_application']).format('DD-MMM-YYYY')
        }, {
            field: 'disbursement_date',
            title: 'Disbursed on',
            render: rowData => moment(rowData['disbursement_date']).format('DD-MMM-YYYY')
        }, {
            field: '',
            title: '',
            render: rowData => this.renderActionButtons(rowData)
        }];

        return (
            <div>
                <Box mt={2}>
                    <MaterialTable
                        isLoading={active_loans_data['isFetching']}
                        title="Loans"
                        columns={loans_columns}
                        data={active_loans}
                    />
                </Box>
                <Modal
                    open={this.state.statement_dialogue_open}
                    handleOpen={() => this.handleOpenDialogue('statement_dialogue_open')}
                    handleClose={() => this.handleCloseDialogue('statement_dialogue_open')}
                    dialogue_title="Loan statement"
                >
                    <LoanStatement
                        selected_loan={this.state.selected_loan}
                    />
                </Modal>
            </div>
        )
    }
}

ViewLoans.propTypes = {
    sessionVariables: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    active_loans_data: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    function retrieveUrlData(url_var_name) {
        let url = sessionVariables[url_var_name] || '';
        return getUrlData(url, dataByUrl);
    }

    const {sessionVariables, dataByUrl} = state;
    const active_loans_data = retrieveUrlData('active_loans_url', dataByUrl);

    return {
        sessionVariables,
        active_loans_data
    }
}

export default connect(mapStateToProps)(withRouter(ViewLoans))