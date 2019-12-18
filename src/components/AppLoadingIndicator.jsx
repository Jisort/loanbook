import React, {Component} from 'react';
import {CircularProgress, Box, Paper} from "@material-ui/core";

export default class AppLoadingIndicator extends Component {
    render() {
        return (
            <Paper className="Loading-indicator">
                <Box display="flex" justifyContent="center" alignItems="center"
                     className="Box-loading-indicator">
                    <CircularProgress size={60} thickness={4.5}/>
                </Box>
            </Paper>
        )
    }
}