'use strict';

var base = require('base/product/base');
var slickConfigs = require('../config/slickConfigs');
var zoomConfigs = require('../config/zoomConfigs');
var imagesloaded = require('imagesloaded');
var utils = require('../util/utils');

/**
 * Disable PDP Zoom
 */
function disableZoom() {
    $('.slide-link').trigger('zoom.destroy');
}

/**
 * Init PDP Zoom
 */
function initZoom() {
    disableZoom();

    var isDesktop = utils.mediaBreakpointUp('lg');
    var $activeSlide = $('.product-carousel .slick-active');
    var $image = $activeSlide.find('.slide-link.zoom-hires');
    var url = $image.attr('href');

    if ($image.length > 0 && url && url !== 'null' && isDesktop) {
        // Start spinner while zoom image loads
        $activeSlide.spinner().start();

        var config = {
            url: url,
            callback: function () {
                // Stop spinner when zoom image loaded
                $activeSlide.spinner().stop();
            }
        };
        config = $.extend({}, zoomConfigs, config);

        $image.zoom(config);
    }
}

/**
 * Init the product carousel using a predefined slick configuration
 */
function carouselInit() {
    var $carousel = $('.product-carousel');

    if ($carousel.length) {
        imagesloaded($carousel).on('done', function () {
            if ($carousel.hasClass('slick-initialized')) {
                $carousel.off('init', initZoom);
                $carousel.off('afterChange', initZoom);
                $carousel.slick('unslick');
            }
            $carousel.on('init', initZoom);
            $carousel.on('afterChange', initZoom);
            $carousel.not('.slick-initialized').slick(slickConfigs.pdp);
        });
    }
}

/**
 * Deconstruct (unslick) the carousel, removing classes and handlers added on slick initialize.
 */
function carouselUnslick() {
    var $carousel = $('.product-carousel');

    if ($carousel.length && $carousel.hasClass('slick-initialized')) {
        $carousel.off('init', initZoom);
        $carousel.off('afterChange', initZoom);
        $carousel.slick('unslick');
    }
}

/**
 * Init the product carousel using a predefined slick configuration for bonus item
 */
function carouselInitBonus() {
    var $carouselBonus = $('.bonus-product-item');
    if ($carouselBonus.length) {
        $carouselBonus.each(function () {
            var $carouselBonusDiv = $(this).find('.product-carousel');
            if ($carouselBonusDiv.length) {
                imagesloaded($carouselBonusDiv).on('done', function () {
                    $carouselBonusDiv.on('init', initZoom);
                    $carouselBonusDiv.on('afterChange', initZoom);
                    $carouselBonusDiv.not('.slick-initialized').slick(slickConfigs.pdp);
                });
            }
        });
    }
}

/**
 * Deconstruct (unslick) the carousel, removing classes and handlers added on slick initialize.
 */
function carouselUnslickBonus() {
    var $carouselBonus = $('.bonus-product-item');
    if ($carouselBonus.length) {
        $carouselBonus.each(function () {
            var $carouselBonusDiv = $(this).find('.product-carousel');
            if ($carouselBonusDiv.length && $carouselBonusDiv.hasClass('slick-initialized')) {
                $carouselBonusDiv.off('init', initZoom);
                $carouselBonusDiv.off('afterChange', initZoom);
                $carouselBonusDiv.slick('unslick');
            }
        });
    }
}
/**
 * @param  {json} product - Product json
 */
function updateMainImages(product) {
    var images = product.images;
    var productID = product.id;
    var imagesZoom = product.imagesZoom['hi-res'];
    var htmlString = '<!-- Product Image slides -->';

    images.large.forEach(function (image, idx) {
        var zoomImage = imagesZoom[idx] ? imagesZoom[idx] : image;
        var zoomClass = imagesZoom[idx] ? 'zoom-hires' : 'zoom-disabled';
        var htmlSlide = '<div class="slide">'
            + '<div class="slide-link ' + zoomClass + '" title="' + zoomImage.title + '">'
                + '<img src="' + image.url + '" class="slide-img" alt="' + image.alt + '" />'
            + '</div>'
        + '</div>';

        htmlString += htmlSlide;
    });
    var $varName = $('.product-detail .set-items');
    var $carouselImage;
    var $tempDiv;

    if ($varName.length) {
        $tempDiv = $('div.set-items').find('div[data-pid="' + productID + '"]');
        $carouselImage = $tempDiv.find('.product-carousel');
    } else {
        $carouselImage = $('.product-carousel');
    }
    $carouselImage.html(htmlString);
}

var exportBase = $.extend({}, base, {
    carouselInit: carouselInit,
    carouselInitBonus: carouselInitBonus,
    carouselUnslick: carouselUnslick,
    carouselUnslickBonus: carouselUnslickBonus,
    updateMainImages: updateMainImages
});

module.exports = exportBase;
