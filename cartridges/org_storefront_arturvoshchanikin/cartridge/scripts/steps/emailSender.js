'use strict';

/**
 * Helper that sends an email to a customer. This will only get called if hook handler is not registered
 * @param {obj} emailObj - An object that contains information about email that will be sent
 * @param {string} emailObj.to - Email address to send the message to (required)
 * @param {string} emailObj.subject - Subject of the message to be sent (required)
 * @param {string} emailObj.from - Email address to be used as a "from" address in the email (required)
 * @param {int} emailObj.type - Integer that specifies the type of the email being sent out. See export from emailHelpers for values.
 * @param {string} template - Location of the ISML template to be rendered in the email.
 * @param {obj} context - Object with context to be passed as pdict into ISML template.
 */

function send(params) {
    var CustomObjectMgr = require('dw/object/CustomObjectMgr');
    var Transaction = require('dw/system/Transaction');
    var Mail = require('dw/net/Mail');
    // var Resource = require('dw/system/Resource');
    var CUSTOM_OBJECT_NAME = 'NewsletterSubscriptionArturVoshchanikin';
    var currentTime = new Date(); // type Date
    var timeRange = new Date(currentTime.setHours(currentTime.getHours() - params.hours)); // type Date

    var queryObjects = CustomObjectMgr.queryCustomObjects(CUSTOM_OBJECT_NAME, 'creationDate >= {0} and custom.isSent = {1}', 'creationDate', timeRange, false);
    var arrayObjects = queryObjects.asList().toArray();

    arrayObjects.forEach(function (user) {
        var emailObj = {
            to: user.custom.email,
            subject: "Message from Artur's emailSender.js I've done this task.",
            from: 'avoshchanikin@speroteck.com'
        };

        var email = new Mail();
        email.addTo(emailObj.to);
        email.setSubject(emailObj.subject);
        email.setFrom(emailObj.from);
        email.setContent("Hello, it's SFCC sandbox. My name is Artur! Sorry for a spam! ");
        email.send();

        Transaction.wrap(function () {
            user.custom.isSent = true;
        });
    });
}

/**
 * Checks if the email value entered is correct format
 * @param {string} email - email string to check if valid
 * @returns {boolean} Whether email is valid
 */
// function validateEmail(email) {
//     var regex = /^[\w.%+-]+@[\w.-]+\.[\w]{2,6}$/;
//     return regex.test(email);
// }

module.exports = {
    send: send
    // validateEmail: validateEmail
};
