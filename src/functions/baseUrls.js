module.exports = {
    serverBaseUrl: function () {
        if(process.env.NODE_ENV === 'development') {
            return 'http://localhost:8000';
        } else {
            return 'https://my.jisort.com';
        }
    }
};
