'use strict';

/**
 * Account base controller overridden to prepend new middleware to all the existing routes
 * Middleware checks if ecommerce functionality is enabled for site then call next function in middleware chain otherwise redirect user to homepage
 *
 */

var page = module.superModule;
var server = require('server');

server.extend(page);

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var githubService = require('*/cartridge/scripts/services/GithubServiceInfo');

function getGitUserLogin(registrationForm) {
    var email = registrationForm.customer.email.value;
    return email.slice(0, email.indexOf('@'));
}

server.append('Show', function (req, res, next) {
    var CustomerMgr = require('dw/customer/CustomerMgr');
    var profile = CustomerMgr.getCustomerByLogin(req.currentCustomer.profile.email).getProfile();
    var gitInfo = {
        avoshchanikinGitLogin: profile.custom.avoshchanikinGitLogin,
        avoshchanikinGitID: profile.custom.avoshchanikinGitID
    };
    var viewData = res.getViewData();

    viewData.account.profile.custom = gitInfo;
    res.setViewData(viewData);

    next();
});

server.prepend('SubmitRegistration', server.middleware.https, csrfProtection.validateAjaxRequest, function (req, res, next) {
    var Resource = require('dw/web/Resource');
    var registrationForm = server.forms.getForm('profile');
    var formErrors = require('*/cartridge/scripts/formErrors');

    if (registrationForm.customer.attachgithubinfo.checked) {
        var requestDataContainer = {
            serviceName: 'github-info-avoshchanikin-g1',
            endPoint: getGitUserLogin(registrationForm)
            // endPoint: 'nosferatum2@i.ua' to 'nosferatum2'
            // str.slice(0, str.indexOf('@'))
        };

        var serviceRespond = githubService.call(requestDataContainer);

        if (serviceRespond.object.total_count) {
            var viewData = res.getViewData();
            viewData.avoshchanikinGitLogin = serviceRespond.object.items[0].login;
            viewData.avoshchanikinGitID = serviceRespond.object.items[0].id;
            res.setViewData(viewData);
        } else {
            registrationForm.customer.avoshchanikinGitLogin.valid = false;
            registrationForm.customer.avoshchanikinGitID.error = Resource.msg('error.message.gitHub.users.not.exist', 'forms', null);
            registrationForm.valid = false;
            res.json({
                fields: formErrors.getFormErrors(registrationForm)
            });
            return {
                error: true,
                errorMessage: registrationForm.customer.avoshchanikinGitID.error
            };
        }
    }
    next();
});

server.append('SubmitRegistration', function (req, res, next) {
    this.on('route:BeforeComplete', function () {
        var Transaction = require('dw/system/Transaction');
        var registrationForm = server.forms.getForm('profile');
        var viewData = res.getViewData();
        if (viewData.authenticatedCustomer && viewData.authenticatedCustomer.profile) {
            var profile = viewData.authenticatedCustomer.profile;
            if (registrationForm.customer.attachgithubinfo.checked) {
                Transaction.wrap(function () {
                    profile.custom.avoshchanikinGitLogin = viewData.avoshchanikinGitLogin;
                    profile.custom.avoshchanikinGitID = viewData.avoshchanikinGitID;
                });
            }
        }
    });
    next();
});

// server.prepend('SubmitRegistration', function (req, res, next) {
//     var viewData = res.getViewData();
//     var registrationForm = server.forms.getForm('profile');

//     if (!registrationForm.customer.attachgithubinfo.checked) {
//         return next();
//     }

//     var Resource = require('dw/web/Resource');
//     var GithubServiceRegistry = require('*/cartridge/scripts/serviceregistry/GithubServiceRegistry');

//     var serviceResponse = GithubServiceRegistry.githubService.call({
//         email: registrationForm.customer.email.value
//     });

//     if (serviceResponse.object.success !== true) {
//         res.setStatusCode(500);
//         res.json({
//             success: false,
//             errorMessage: Resource.msg('error.github.account.not.found', 'account', null)
//         });

//         this.emit('route:Complete', req, res);
//         // eslint-disable-next-line consistent-return
//         return;
//     }

//     viewData.githubUser = {
//         id: serviceResponse.object.data.user.id,
//         login: serviceResponse.object.data.user.login
//     };

//     res.setViewData(viewData);

//     next();
// });
module.exports = server.exports();
