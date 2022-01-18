// Create new controller named Newsletter. +
// Add 2 routes +
// Show (get method) +
// and Subscribe(post method) +
// Show renders form with 3 fields email, first name, last name. +
// Create xml form to define metadata for this fields and use it in isml template. +

// In Bussiness Manager go to Administration -> Custom Objects and create custom Object NewsletterSubscriptionArturVoshchanikin, 
// with key email, and 2 fields first name and last name + {email, firstName, lastName}

// On form submit execute logic in Newsletter-Subscribe that will create new instance of CustomObjec "NewsletterSubscriptionArturVoshchanikin". +
// If object creation was successful, redirect user to Home-Page, otherwise, redirect them to Error-Show Page.

var server = require('server');
var URLUtils = require('dw/web/URLUtils');
// var page = module.superModule;
// server.extend(page);

server.get(
    'Show',
    function (req, res, next) {
        var template = '/newsletter/newsletter';
        var actionUrl = URLUtils.url('Newsletter-Subscribe').toString(); // sets the route to call for the form submit action
        var actionUrlAjax = URLUtils.url('Newsletter-SubscribeAjax').toString(); // sets the route to call for the form submit action
        var newsletterForm = server.forms.getForm('newsletterForm'); // creates empty JSON object using the form definition
        newsletterForm.clear();

        res.render(template, {
            actionUrl: actionUrl,
            actionUrlAjax: actionUrlAjax,
            newsletterForm: newsletterForm
        });
        next();
    });


// After a form is submitted, data from the form is available as part of the req.form property.
server.post(
    'Subscribe',
    function (req, res, next) {
        var CustomObjectMgr = require('dw/object/CustomObjectMgr');
        var Transaction = require('dw/system/Transaction');
        var CUSTOM_OBJECT_NAME = 'NewsletterSubscriptionArturVoshchanikin';

        var formObj = {
            email: req.form.email,
            firstName: req.form.firstName,
            lastName: req.form.lastName
        };

        try {
            var transactionStatus = Transaction.wrap(function () {
                var customObject = CustomObjectMgr.createCustomObject(CUSTOM_OBJECT_NAME, formObj.email);
                customObject.custom.firstName = formObj.firstName;
                customObject.custom.lastName = formObj.lastName;
                return customObject;
            });
            res.redirect(URLUtils.home()); // Inherits from app_storefront_base (Home-Show)
        } catch (error) {
            res.setStatusCode(500);
            res.redirect(URLUtils.url('Error-Start').toString()); // Inherits from app_storefront_base instead of Error-Show
        }
        next();
    });

server.post(
    'SubscribeAjax',
    function (req, res, next) {
        var CustomObjectMgr = require('dw/object/CustomObjectMgr');
        var Transaction = require('dw/system/Transaction');
        var CUSTOM_OBJECT_NAME = 'NewsletterSubscriptionArturVoshchanikin';
        var Resource = require('dw/web/Resource');

        var formObj = {
            email: req.form.email,
            firstName: req.form.firstName,
            lastName: req.form.lastName
        };

        try {
            Transaction.wrap(function () {
                var customObject = CustomObjectMgr.createCustomObject(CUSTOM_OBJECT_NAME, formObj.email);
                customObject.custom.firstName = formObj.firstName;
                customObject.custom.lastName = formObj.lastName;
                return customObject;
            });
            res.json({
                success: true,
                msg: Resource.msg('subscribe.email.success', 'forms', null)
            });
        } catch (error) {
            res.setStatusCode(500);
            res.json({
                error: true,
                msg: Resource.msg('subscribe.email.invalid', 'forms', null)
            });
        }
        next();
    });

module.exports = server.exports();
