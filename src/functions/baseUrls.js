module.exports = {
    serverBaseUrl: function () {
        if(process.env.NODE_ENV === 'development') {
            return 'https://c6d4a604.ngrok.io';
            // return 'http://localhost:8000';
        } else {
            return 'https://c6d4a604.ngrok.io';
        }
    }
};
