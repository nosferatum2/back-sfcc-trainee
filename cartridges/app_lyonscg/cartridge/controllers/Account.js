'use strict';

/**
 * Account base controller overridden to prepend new middleware to all the existing routes
 * Middleware checks if ecommerce functionality is enabled for site then call next function in middleware chain otherwise redirect user to homepage
 *
 */

var page = module.superModule;
var server = require('server');

server.extend(page);

var ecommerce = require('*/cartridge/scripts/middleware/ecommerce');

server.prepend('Show', ecommerce.checkEcommerceEnabled, function (req, res, next) {
    next();
});

server.prepend('Login', ecommerce.checkEcommerceEnabled, function (req, res, next) {
    next();
});

server.prepend('SubmitRegistration', ecommerce.checkEcommerceEnabled, function (req, res, next) {
    next();
});

server.append('SubmitRegistration', ecommerce.checkEcommerceEnabled, function (req, res, next) {
    var CustomerMgr = require('dw/customer/CustomerMgr');
    var Resource = require('dw/web/Resource');
    var formErrors = require('*/cartridge/scripts/formErrors');
    var registrationForm = server.forms.getForm('profile');
    if (!CustomerMgr.isAcceptablePassword(registrationForm.login.password.value)) {
        registrationForm.login.password.valid = false;
        registrationForm.login.password.error =
            Resource.msg('error.message.password.constraints.not.matched', 'forms', null);
        registrationForm.valid = false;
    }
    if (!CustomerMgr.isAcceptablePassword(registrationForm.login.passwordconfirm.value)) {
        registrationForm.login.passwordconfirm.valid = false;
        registrationForm.login.passwordconfirm.error =
            Resource.msg('error.message.password.constraints.not.matched', 'forms', null);
        registrationForm.valid = false;
    }
    if (!registrationForm.valid) {
        res.json({
            fields: formErrors.getFormErrors(registrationForm)
        });
    }
    return next();
});

server.prepend('EditProfile', ecommerce.checkEcommerceEnabled, function (req, res, next) {
    var ContentMgr = require('dw/content/ContentMgr');
    var content = ContentMgr.getContent('tracking_hint');
    var viewData = res.getViewData();
    viewData.caOnline = content.online;
    res.setViewData(viewData);
    next();
});

server.prepend('SaveProfile', ecommerce.checkEcommerceEnabled, function (req, res, next) {
    next();
});

server.prepend('EditPassword', ecommerce.checkEcommerceEnabled, function (req, res, next) {
    next();
});

server.prepend('SavePassword', ecommerce.checkEcommerceEnabled, function (req, res, next) {
    next();
});

server.prepend('PasswordResetDialogForm', ecommerce.checkEcommerceEnabled, function (req, res, next) {
    next();
});

server.prepend('PasswordReset', ecommerce.checkEcommerceEnabled, function (req, res, next) {
    next();
});

server.prepend('SetNewPassword', ecommerce.checkEcommerceEnabled, function (req, res, next) {
    next();
});

server.prepend('SaveNewPassword', ecommerce.checkEcommerceEnabled, function (req, res, next) {
    next();
});

server.prepend('Header', ecommerce.checkEcommerceEnabled, function (req, res, next) {
    next();
});

module.exports = server.exports();