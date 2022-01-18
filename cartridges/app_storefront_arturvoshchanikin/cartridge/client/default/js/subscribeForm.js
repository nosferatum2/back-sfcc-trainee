// $('form.newsletter-form-ajax').submit(function (e) {
//     e.preventDefault();
//     var form = $(this);
//     var url = form.attr('action');

//     $.ajax({
//         url: url,
//         type: 'post',
//         dataType: 'json',
//         data: form.serialize(),
//         success: function (data) {
//             // data.redirect contains the string URL to redirect to
//             // window.location.href = data.redirectUrl;
//             console.log('All fine', data);
//             // console.log('All fine', data.redirectUrl);
//         },
//         error: function (err) {
//             // window.location.href = err.responseJSON.redirectUrl;
//             // displayMessage(err, button);
//             console.log('ERRORORORORR', err.responseJSON.redirectUrl);
//         }
//     });
// });

// =====================================================================================================
'use strict';

/**
 * appends params to a url
 * @param {string} data - data returned from the server's ajax call
 * @param {Object} button - button that was clicked for newsletter sign-up
 */

// eslint-disable-next-line require-jsdoc
function displayMessage(data, button) {
    $.spinner().stop();
    var status;
    if (data.success) {
        status = 'alert-success';
    } else {
        status = 'alert-danger';
    }
    // Add new field to the form
    if ($('.newsletter-signup-message').length === 0) {
        $('newsletter-form-ajax').append(
            '<div class="newsletter-signup-message"></div>'
        );
    }
    $('.newsletter-signup-message')
        .append('<div class="newsletter-signup-alert text-center ' + status + '">' + data.msg + '</div>');

    setTimeout(function () {
        $('.newsletter-signup-message').remove();
        button.removeAttr('disabled');
    }, 3000);
}

$(document).ready(function () {
    $('form.newsletter-form-ajax').on('submit', function (e) {
        e.preventDefault();
        var form = $(this);
        var url = form.attr('action');
        var button = $('newsletter-form-ajax-submit');

        $.spinner().start();
        $(this).attr('disabled', true);
        $.ajax({
            url: url,
            type: 'post',
            dataType: 'json',
            data: form.serialize(),
            success: function (data) {
                displayMessage(data, button);
                if (data.success) {
                    $('.newsletter-form-ajax').trigger('reset');
                }
                // console.log('SUCCESS', data.msg);
            },
            error: function (err) {
                displayMessage(err, button);
                // console.log('ERRRROOORRRR', err.responseJSON.msg);
            }
        });
    });
});

// {
    // "valid":true,
    // "htmlName":"dwfrm_newsletterForm",
    // "dynamicHtmlName":"dwfrm_newsletterForm_d0aawpwsmejs",
    // "error":null,
    // "attributes":"name = \"dwfrm_newsletterForm\" id = \"dwfrm_newsletterForm\"",
    // "formType":"formGroup",
    // "firstName":{
        //     "htmlValue":"",
        //     "mandatory":true,
//     "dynamicHtmlName":"dwfrm_newsletterForm_firstName_d0cpjcxjyotb",
//     "htmlName":"dwfrm_newsletterForm_firstName",
//     "valid":true,
//     "label":"First Name",
//     "maxLength":50,
//     "minLength":0,
//     "regEx":null,
//     "formType":"formField"},
// "lastName":{
//     "htmlValue":"",
//     "mandatory":true,
//     "dynamicHtmlName":"dwfrm_newsletterForm_lastName_d0msrkzdisth",
//     "htmlName":"dwfrm_newsletterForm_lastName",
//     "valid":true,
//     "label":"Last Name",
//     "maxLength":50,
//     "minLength":0,
//     "regEx":null,
//     "formType":"formField"},
// "email":{
//     "htmlValue":"",
//     "mandatory":true,
//     "dynamicHtmlName":"dwfrm_newsletterForm_email_d0wswswneujd",
//     "htmlName":"dwfrm_newsletterForm_email",
//     "valid":true,
//     "label":"Email",
//     "maxLength":50,
//     "minLength":0,
//     "regEx":null,
//     "formType":"formField"},
// "submit":{
//     "description":null,
//     "label":null,
//     "submitted":false,
//     "triggered":false,
//     "formType":"formAction"},
//     "base":{
//     }
// }
