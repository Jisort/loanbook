import React, {Component} from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

export default class Modal extends Component {
    render() {
        return (
            <div>
                <Dialog open={this.props.open}
                        onClose={this.props.handleClose}
                        fullWidth
                        maxWidth="md"
                        disableBackdropClick
                        aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">{this.props['dialogue_title']}</DialogTitle>
                    <DialogContent>
                        {this.props.children}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.props.handleClose} color="primary">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}