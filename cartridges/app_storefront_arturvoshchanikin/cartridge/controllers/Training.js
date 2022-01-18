// Inside template(training.isml) put next logic:
// If booleanFlag
// then iterate through array and display it's values
// else iterate through object and display it's keys + values

'use strict';

var server = require('server');
var URLUtils = require('dw/web/URLUtils');

var testData = {
    booleanFlag: Boolean(),
    arrayToIterate: [
        'My',
        'broken',
        'fingers',
        'Array',
        '!!!'],
    objectToIterate: {
        first: 'finger',
        second: 'finger',
        third: 'finger',
        fourth: 'finger',
        fifth: 'finger'
    }
};

// Only true/false value
function checkFlag(data, req, res) {
    var data = {
        booleanFlag: testData.booleanFlag,
        arrayToIterate: testData.arrayToIterate,
        objectToIterate: testData.objectToIterate
    };

    if (req.querystring.flag === 'true') {
        data.booleanFlag = true;
    } else if ((req.querystring.flag === 'false')) {
        data.booleanFlag = false;
    } else {
        res.setStatusCode(404);
        res.redirect(URLUtils.home());
    }
    return data;
}

// Task #1
server.get('Isml', function (req, res, next) {
    var template = '/training/training';

    res.setViewData(checkFlag(testData, req, res));
    res.render(template);
    next();
});

// Task #2
// In this ticket create new Route, which will render template that contains isdecoratetag. +
// Include locally template from previous task inside this template. +
// Refactor route from previous task to use resources files. +
// Create one more new route. this route should render template with next context object +
// {myParam: req.querystring.myParam} +
// just output it in new template. +

// Classes to use: Resources, URLUtils +
// read about request object, check request.js, understand how to work and what is querystring +

server.get('isdecoratetag', function (req, res, next) {
    var template = '/training/isdecorate';

    res.render(template, checkFlag(testData, req, res));
    next();
});

server.get('querysrting', function (req, res, next) {
    var template = '/training/querysrting';

    res.render(template, { myParam: req.querystring.myParam });
    next();
});


module.exports = server.exports();
