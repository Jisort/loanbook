import React, {Component} from 'react';

export default class LoadingIndicator extends Component {
    render() {
        return (
            <div className="row justify-content-center align-content-center loading-page">
                <div className="spinner-grow text-primary" style={{width: '5rem', height: '5rem'}} role="status">
                    <span className="sr-only">Processing...</span>
                </div>
            </div>
        )
    }
}