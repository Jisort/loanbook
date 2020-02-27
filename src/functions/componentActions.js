module.exports = {
    pushHistory: function (props, route) {
        props.history.push(route);
    },

    getUrlData: function (data_url, dataByUrl) {
        return dataByUrl[
            data_url
            ] || {
            didInvalidate: false,
            isFetching: true,
            items: [],
            lastUpdated: ''
        }
    },

    lookup: function (callback) {
        try {
            const loadJSONP = (url, callback) => {
                const ref = window.document.getElementsByTagName('script')[0];
                const script = window.document.createElement('script');
                script.src = `${url + (url.indexOf('?') + 1 ? '&' : '?')}callback=${callback}`;
                ref.parentNode.insertBefore(script, ref);
                script.onload = () => {
                    script.remove();
                };
            };
            let protocol = 'http';
            if (typeof window !== 'undefined') {
                protocol = (window.location || {}).protocol;
            }
            loadJSONP(protocol + '//ipinfo.io?token=e6909d77aca84d', 'sendBack');
            window.sendBack = (resp) => {
                const countryCode = (resp && resp.country) ? resp.country : '';
                callback(countryCode);
            }
        } catch (e) {
            callback('');
        }
    },

    extractResponseError(results) {
        let alert_message = '';
        if (results.constructor === Array && results.length > 0) {
            alert_message = results[0];
        } else if (typeof results === "object") {
            if (results['detail']) {
                alert_message = results.detail;
            } else if (results['non_field_errors']) {
                alert_message = results['non_field_errors'];
            } else if (Object.keys(results).length > 0) {
                for (let key in results) {
                    alert_message += key + ': ' + results[key] + ' ';
                }
            } else {
                alert_message = results.toString();
            }
        } else if (typeof results === "string") {
            alert_message = results;
        }
        return alert_message;
    },

    formDataToPayload(formData, payload) {
        formData.forEach(function (value, key) {
            payload[key] = value;
        });
        return payload;
    },

    dynamicSort(property) {
        let sortOrder = 1;
        if (property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function (a, b) {
            let result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
        }
    },

    roundNumber: function (num, scale) {
        return +(Math.round(num + "e+" + scale) + "e-" + scale);
    },

    numberWithCommas: function (x, decimal_places) {
        if (!decimal_places) {
            decimal_places = 2;
        }
        if (!x && x !== 0) {
            x = null;
        }
        if (x != null) {
            try {
                x = x.toFixed(decimal_places);
            } catch (err) {
                x = this.roundNumber(x, 2);
            }
            let parts = x.toString().split(".");
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return parts.join(".");
        } else {
            return x
        }
    },

    /**
     * @return {string}
     */
    UTCToLocalTime: function (utc_time, moment, object = null, format = 'YYYY-MM-DD h:mm a') {
        if (utc_time === '' || utc_time === null) {
            return '';
        }
        return moment.utc(utc_time).local().format(format);
    },
    countries_overwrite: function (key) {
        let countries_overwrite =  {
            'TW': {name: 'Taiwan, China'}
        };
        return countries_overwrite[key];
    }
};
