import React, {Component} from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

export default class FormModal extends Component {

    render() {
        return (
            <div>
                <Dialog
                    fullWidth="sm"
                    maxWidth="sm"
                    open={this.props.open}
                    onClose={this.props['handleClose']}
                    disableBackdropClick
                    aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">{this.props['title']}</DialogTitle>
                    <DialogContent>
                        {this.props.children}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.props['handleClose']} color="primary">
                            Add client
                        </Button>
                        <Button onClick={this.props['handleClose']} color="primary">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}