import React, {Component} from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';

export default class FormModal extends Component {

    render() {
        return (
            <div>
                <Dialog
                    fullWidth
                    maxWidth="sm"
                    open={this.props.open}
                    onClose={this.props['handleClose']}
                    disableBackdropClick
                    aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">{this.props['title']}</DialogTitle>
                    {this.props.children}
                </Dialog>
            </div>
        );
    }
}