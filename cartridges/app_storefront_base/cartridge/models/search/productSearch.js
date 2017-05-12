'use strict';

var dwHelper = require('~/cartridge/scripts/dwHelpers');
var searchRefinementsFactory = require('~/cartridge/scripts/factories/searchRefinements');
var URLUtils = require('dw/web/URLUtils');

var ACTION_ENDPOINT = 'Search-Show';
var DEFAULT_PAGE_SIZE = 12;


/**
 * Generates URL that removes refinements, essentially resetting search criteria
 *
 * @param {dw.catalog.ProductSearchModel} search - Product search object
 * @param {Object} httpParams - Query params
 * @param {string} [httpParams.q] - Search keywords
 * @param {string} [httpParams.cgid] - Category ID
 * @return {string} - URL to reset query to original search
 */
function getResetLink(search, httpParams) {
    return search.categorySearch
        ? URLUtils.url(ACTION_ENDPOINT, 'cgid', httpParams.cgid)
        : URLUtils.url(ACTION_ENDPOINT, 'q', httpParams.q);
}

/**
 * Retrieves search refinements
 *
 * @param {dw.catalog.ProductSearchModel} productSearch - Product search object
 * @param {dw.catalog.ProductSearchRefinements} refinements - Search refinements
 * @param {ArrayList.<dw.catalog.ProductSearchRefinementDefinition>} refinementDefinitions - List of
 *     product serach refinement definitions
 * @return {Refinement[]} - List of parsed refinements
 */
function getRefinements(productSearch, refinements, refinementDefinitions) {
    return dwHelper.map(refinementDefinitions, function (definition) {
        var refinementValues = refinements.getAllRefinementValues(definition);
        var values = searchRefinementsFactory.get(productSearch, definition, refinementValues);

        return {
            displayName: definition.displayName,
            isCategoryRefinement: definition.categoryRefinement,
            isAttributeRefinement: definition.attributeRefinement,
            isPriceRefinement: definition.priceRefinement,
            values: values
        };
    });
}

/**
 * Returns the refinement values that have been selected
 *
 * @param {Array.<CategoryRefinementValue|AttributeRefinementValue|PriceRefinementValue>}
 *     refinements - List of all relevant refinements for this search
 * @return {Object[]} - List of selected filters
 */
function getSelectedFilters(refinements) {
    var selectedFilters = [];
    var selectedValues = [];

    refinements.forEach(function (refinement) {
        selectedValues = refinement.values.filter(function (value) { return value.selected; });
        if (selectedValues.length) {
            selectedFilters.push.apply(selectedFilters, selectedValues);
        }
    });

    return selectedFilters;
}

/**
 * Retrieves banner image URL
 *
 * @param {dw.catalog.Category} category - Subject category
 * @return {string} - Banner's image URL
 */
function getBannerImageUrl(category) {
    var url = null;

    if (category.custom && category.custom.slotBannerImage) {
        url = category.custom.slotBannerImage.getURL();
    } else if (category.image) {
        url = category.image.getURL();
    }

    return url;
}

/**
 * Configures and returns a PagingModel instance
 *
 * @param {dw.util.Iterator} productHits - Iterator for product search results
 * @param {number} count - Number of products in search results
 * @param {number} pageSize - Number of products to display
 * @param {number} startIndex - Beginning index value
 * @return {dw.web.PagingModel} - PagingModel instance
 */
function getPagingModel(productHits, count, pageSize, startIndex) {
    var PagingModel = require('dw/web/PagingModel');
    var paging = new PagingModel(productHits, count);

    paging.setStart(startIndex || 0);
    paging.setPageSize(pageSize);

    return paging;
}

/**
 * Generates URL for [Show] More button
 *
 * @param {dw.web.PagingModel} paging - PagingModel instance
 * @param {dw.catalog.ProductSearchModel} productSearch - Product search object
 * @return {string} - More button URL
 */
function getShowMoreUrl(paging, productSearch) {
    var showMoreEndpoint = 'Search-UpdateGrid';
    var currentPageSize = paging.getPageSize();
    var morePageSize = currentPageSize < productSearch.count
        ? currentPageSize + DEFAULT_PAGE_SIZE
        : currentPageSize;
    var baseUrl = productSearch.url(showMoreEndpoint);

    return paging.appendPageSize(baseUrl, morePageSize);
}

/**
 * @constructor
 * @classdesc ProductSearch class
 *
 * @param {dw.catalog.ProductSearchModel} productSearch - Product search object
 * @param {Object} httpParams - HTTP query parameters
 */
function ProductSearch(productSearch, httpParams) {
    var paging = getPagingModel(
        productSearch.productSearchHits,
        productSearch.count,
        httpParams.sz || DEFAULT_PAGE_SIZE
    );

    this.count = productSearch.count;
    this.isCategorySearch = productSearch.categorySearch;
    this.isRefinedCategorySearch = productSearch.refinedCategorySearch;
    this.searchKeywords = productSearch.searchPhrase;
    this.refinements = getRefinements(
        productSearch,
        productSearch.refinements,
        productSearch.refinements.refinementDefinitions
    );
    this.selectedFilters = getSelectedFilters(this.refinements);
    this.resetLink = getResetLink(productSearch, httpParams);
    this.bannerImageUrl = productSearch.category ? getBannerImageUrl(productSearch.category) : null;
    this.productIds = dwHelper.pluck(paging.pageElements, 'productID');
    this.showMoreUrl = getShowMoreUrl(paging, productSearch);

    if (productSearch.category) {
        this.category = {
            name: productSearch.category.displayName,
            id: productSearch.category.ID
        };
    }
}

module.exports = ProductSearch;
