module.exports = {
    postAPIRequest: function (url, successCallback, errorCallback, payload, headers, method = 'POST') {
        fetch(url, {
                credentials: 'include',
                method: method,
                body: JSON.stringify(payload),
                headers: headers,
            }
        ).then(function (response) {
            if (response.ok) {
                return response;
            }
            throw response;
        }).then(function (response) {
            return response.json();
        }).then(function (json) {
            successCallback(json);
        }).catch(error => {
            if (process.env.NODE_ENV === 'development' && error.status >= 500) {
                errorCallback(error.statusText);
            } else {
                error.json().then((body) => {
                    errorCallback(body);
                });
            }
        });
    },

    getAPIRequest: function (url, successCallback, errorCallback, headers) {
        fetch(url, {
                headers: headers,
                credentials: 'include'
            }
        ).then(function (response) {
            if (response.ok) {
                return response;
            }
            throw response;
        }).then(function (response) {
            return response.json();
        }).then(function (json) {
            successCallback(json);
        }).catch(error => {
            if (process.env.NODE_ENV === 'development' && error.status >= 500) {
                errorCallback(error.statusText);
            } else {
                error.json().then((body) => {
                    errorCallback(body);
                });
            }
        });
    }
};