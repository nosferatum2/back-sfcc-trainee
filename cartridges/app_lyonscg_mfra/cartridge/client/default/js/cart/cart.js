'use strict';

var cart = require('base/cart/cart');
var base = require('../product/base');

$('body').on('product:beforeAttributeSelect', function () {
    // Unslick the existing images to prepare them for direct js manipulation
    base.carouselUnslick();
});

$('body').on('product:afterAttributeSelect', function () {
    base.carouselInit();
});

$('body').on('shown.bs.modal', '#editProductModal', function () {
    base.carouselInit();
});

module.exports = cart;