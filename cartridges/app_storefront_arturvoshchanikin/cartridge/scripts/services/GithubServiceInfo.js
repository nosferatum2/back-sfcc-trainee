'use strict';

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');

var serviceConfig = {
    /**
     * @param {dw.svc.HTTPService} svc - service
     * @param {Object} requstDataCantainer - data
     */
    createRequest: function (svc, requestDataCantainer) {
        svc.addHeader('Content-Type', 'application/json');
        svc.setRequestMethod('GET');
        svc.setURL(svc.getURL() + requestDataCantainer.endPoint);
    },

    /**
     * Parse JSON response from API call into object
     * @param {dw.svc.HTTPService} svc - Service that is used for API call
     * @param {dw.net.HTTPClient} response - Demandware http client
     * @return {Object} - Response data
     */
    parseResponse: function (svc, response) {
        if (response.text) {
            return JSON.parse(response.text);
        }
        return {};
    }
};

module.exports = {
    call: function (requestData) {
        var service = LocalServiceRegistry.createService(requestData.serviceName, serviceConfig);

        return service.call(requestData);
    }
};
// exports.githubService = LocalServiceRegistry.createService('github-info-avoshchanikin-g1', {
//     createRequest: function (svc, params) {
//         svc.setEncoding('UTF-8');
//         svc.setRequestMethod('GET');
//         svc.addHeader('Content-Type', 'application/json');
//         svc.addHeader('Accept', 'application/json');

//         var url = encodeURI(svc.getURL() + params.email + ' in:email type:user');
//         svc.setURL(url);

//         return svc;
//     },
//     parseResponse: function (svc, client) {
//         var jsonResponse = JSON.parse(client.text);

//         if (jsonResponse.total_count > 0) {
//             return {
//                 success: true,
//                 data: {
//                     user: {
//                         id: jsonResponse.items[0].id,
//                         login: jsonResponse.items[0].login
//                     }
//                 }
//             };
//         }

//         return {
//             success: false
//         };
//     }
// });

