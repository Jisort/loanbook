import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {pushHistory} from "./functions/componentActions";
import {postAPIRequest, getAPIRequest} from "./functions/APIRequests";
import {serverBaseUrl} from "./functions/baseUrls";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import LoadingIndicator from "./components/LoadingIndicator";
import {AppBar, Toolbar, IconButton, Typography, Button, Badge} from '@material-ui/core';
import {Menu as MenuIcon, AccountCircle} from '@material-ui/icons';
import TopMenu from "./components/TopMenu";

class Menu extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true
        }
    }

    componentDidMount() {
        let current_user_url = serverBaseUrl() + '/registration/users/i/';
        getAPIRequest(
            current_user_url,
            () => {
                this.setState({
                    loading: false
                });
            },
            () => {
                pushHistory(this.props, '/login');
                localStorage.removeItem('token');
            },
            {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.token
            }
        );
    }

    handleLogout = (e) => {
        e.preventDefault();
        let logout_url = serverBaseUrl() + '/registration/logout/';
        postAPIRequest(
            logout_url,
            () => {
                pushHistory(this.props, '/login');
                localStorage.removeItem('token');
            },
            () => {
                pushHistory(this.props, '/login');
                localStorage.removeItem('token');
            },
            {},
            {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.token
            }
        )
    };

    render() {
        if (this.state.loading) {
            return <LoadingIndicator/>;
        }
        return (
            <div>
                <TopMenu brand_name="Loanbook" notifications_count={0} handleLogout={this.handleLogout}/>
                {this.props.children}
            </div>
        )
    }
}

Menu.propTypes = {
    sessionVariables: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
    const {sessionVariables} = state;

    return {
        sessionVariables,
    }
}

export default connect(mapStateToProps)(withRouter(Menu))