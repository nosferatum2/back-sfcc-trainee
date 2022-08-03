'use strict';

var URLUtils = require('dw/web/URLUtils');
var Site = require('dw/system/Site');

/**
 * Middleware checking if Ecommerce function is enabled or disabled for site
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next call in the middleware chain
 * @returns {void}
 */
function checkEcommerceEnabled(req, res, next) {
    var siteDisableCommerceFunctionality = Site.getCurrent().getCustomPreferenceValue('siteDisableCommerceFunctionality');
    if (siteDisableCommerceFunctionality !== null && siteDisableCommerceFunctionality) {
        res.redirect(URLUtils.url('Home-Show'));
    }
    next();
}

module.exports = {
    checkEcommerceEnabled: checkEcommerceEnabled
};
