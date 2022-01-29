'use strict';

var base = module.superModule;

/**
 * Retrieves attribute of a position tile
 *
 * @param {dw.catalog.Category} category - Subject category
 * @return {Number} - Tile's position number. Starts from 0.
 */
function getTilePosition(category) {
    return category.custom && 'avoshchanikinTilePos' in category.custom && category.custom.avoshchanikinTilePos
        ? category.custom.avoshchanikinTilePos
        : null;
}


function ProductSearch(productSearch, httpParams, sortingRule, sortingOptions, rootCategory) {
    base.call(this, productSearch, httpParams, sortingRule, sortingOptions, rootCategory);


    if (productSearch.category) {
        this.category = {
            name: productSearch.category.displayName,
            id: productSearch.category.ID,
            pageTitle: productSearch.category.pageTitle,
            pageDescription: productSearch.category.pageDescription,
            pageKeywords: productSearch.category.pageKeywords,
            custom: {
                avoshchanikinTilePos: getTilePosition(productSearch.category)
            }
        };
    }
}


module.exports = ProductSearch;

// if (productSearch.category.custom.avoshchanikinTilePos) {
//     // this.category.custom.avoshchanikinTilePos = productSearch.category.custom.avoshchanikinTilePos;
//     Object.defineProperty(this.category, 'avoshchanikinTilePos', {
//         enumerable: true,
//         value: productSearch.category.custom.avoshchanikinTilePos
//     });
// }