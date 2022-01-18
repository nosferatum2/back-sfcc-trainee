require('@babel/polyfill');
window.jQuery = window.$ = require('jquery');
var processInclude = require('base/util');

$(document).ready(function () {
    processInclude(require('./components/menu'));
    processInclude(require('base/components/cookie'));
    processInclude(require('base/components/consentTracking'));
    processInclude(require('lyonscg/components/footer'));
    processInclude(require('lyonscg/components/backtotop'));
    processInclude(require('lyonscg/components/miniCart'));
    processInclude(require('base/components/collapsibleItem'));
    processInclude(require('base/components/search'));
    processInclude(require('lyonscg/components/clientSideValidation'));
    processInclude(require('base/components/countrySelector'));
    processInclude(require('lyonscg/components/carousels'));
    processInclude(require('lyonscg/components/tooltips'));
});

require('lyonscg/thirdParty/bootstrap');
require('base/components/spinner');
require('svg4everybody');
require('slick-carousel');
require('picturefill');
