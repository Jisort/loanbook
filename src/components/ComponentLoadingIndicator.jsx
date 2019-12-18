import React, {Component} from 'react';
import {CircularProgress, Box} from "@material-ui/core";

export default class AppLoadingIndicator extends Component {
    render() {
        return (
            <Box display="flex" justifyContent="center">
                <CircularProgress/>
            </Box>
        )
    }
}