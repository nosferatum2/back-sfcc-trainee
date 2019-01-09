'use strict';

const path = require('path');
const fs = require('fs');
const glob = require("glob");
const webpack = require('webpack');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const MiniCssExtractPluginCleanup = require("./plugins/MiniCssExtractPluginCleanup");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const WebpackNotifierPlugin = require('webpack-notifier');
const LogCompilerEventsPlugin = require('./plugins/LogCompilerEventsPlugin');

/**
 * Class to generate Webpack configurations
 * https://webpack.js.org/configuration/
 */
module.exports = class WebpackConfigurator {
    /**
     * Initialize configurator instance with variables to aid in building the configuration object 
     * @param {Object} Site - A site definition (see the root package.json "sites" array)
     * @param {Object} options - Additional options to determine configuration object (see the root package.json "buildEnvironment" object)
     */
    constructor(site, options) {
        this.site = site;
        this.options = options;
        this.cartridges = site.cartridges;
        this.cartridgesPath = path.resolve(process.cwd(), "cartridges");
        this.siteCartridge = this.cartridges[this.cartridges.findIndex(cartridge => cartridge.alias === 'site')];
    };

    /**
     * Create configuration objects for the given site
     * @return {Array} - JavaScript and Scss configuration objects
     */
    create() {
        return [
            this.createJsConfiguration(),
            this.createScssConfiguration()
        ];
    };

    /**
     * Create a JS configuration object
     * @return {Object}
     */
    createJsConfiguration() {
        return Object.assign(this.getCommonConfigurationOptions(), {
            name    : 'js',
            entry   : this.getJsFiles(),
            module  : this.handleJsModules(),
            resolve : this.getResolver('js'),
            plugins : this.getJsPlugins(),
            devtool : this.isOption('jsSourceMaps') ? 'cheap-module-source-map' : 'none'
        });
    };    

    /**
     * Create a Scss configuration object
     * @return {Object}
     */
    createScssConfiguration() {
        return Object.assign(this.getCommonConfigurationOptions(), {
            name    : 'scss',
            entry   : this.getScssFiles(),
            module  : this.handleScssModules(),
            resolve : this.getResolver('scss'),
            plugins : this.getScssPlugins(),
            devtool : this.isOption('cssSourceMaps') ? 'cheap-module-source-map' : 'none'
        });
    };

    /**
     * Get configuration options that are independent of asset type
     * @return {Object}
     */
    getCommonConfigurationOptions() {
        return {
            mode   : this.getOption('mode'),
            output : this.getOutput(),
            stats  : this.getStats()
        };
    };

    /**
     * Tell webpack where to emit the bundles and how to name these files
     * https://webpack.js.org/concepts/#output
     * @return {Object}
     */
    getOutput() {
        return {
            // Set the path to the static folder of the current "site" cartridge
            path: path.resolve(this.cartridgesPath, this.siteCartridge.name, "cartridge/static"),
            filename: "[name].js"
        };
    };

    /**
     * Get JS files (as name : 'path/to/file') that webpack should use to build out its internal dependency graph
     * https://webpack.js.org/concepts/#entry
     * @return {Object}
     */
    getJsFiles() {
        const files = new Object();

        for (let cartridge of this.cartridges) {
            const clientPath = path.resolve(this.cartridgesPath, cartridge.name, "cartridge/client");
            glob.sync(path.resolve(clientPath, "*", "js", "*.js")).forEach(file => {
                const key = path.join(path.dirname(path.relative(clientPath, file)), path.basename(file, ".js"));
                if (!files.hasOwnProperty(key)) {
                    files[key] = file;
                }
            });
        }

        return files;
    };

    /**
     * Get Scss files (as name : 'path/to/file') that webpack should use to build out its internal dependency graph
     * https://webpack.js.org/concepts/#entry
     * @return {Object}
     */
    getScssFiles() {
        const files = new Object();

        for (let cartridge of this.cartridges) {
            const clientPath = path.resolve(this.cartridgesPath, cartridge.name, "cartridge/client");
            glob.sync(path.resolve(clientPath, "*", "scss", "**", "*.scss"))
            .filter(file => !path.basename(file).startsWith("_"))
            .forEach(file => {
                let key = path.join(path.dirname(path.relative(clientPath, file)), path.basename(file, ".scss"));
                key = key.replace('scss', 'css');
                if (!files.hasOwnProperty(key)) {
                    files[key] = file;
                }
            });
        }

        return files;
    };

    /**
     * Build the module option to determine how Webpack should handle JS dependencies
     * https://webpack.js.org/configuration/module/
     * @return {Object}
     */
    handleJsModules() {
        return {
            rules: [
                {
                    test: /bootstrap(.)*\.js$/,
                    use: this.getJsLoaders()
                }
            ]
        }
    };

    /**
     * Build the module option to determine how Webpack should handle Scss dependencies
     * https://webpack.js.org/configuration/module/
     * @return {Object}
     */
    handleScssModules() {
        return {
            rules: [
                {
                    test: /\.scss$/,
                    use: this.getScssLoaders()
                }
            ]
        }
    };

    /**
     * Build the JS loaders array
     * https://webpack.js.org/concepts/loaders/
     * @return {Array}
     */
    getJsLoaders() {
        const loaders = new Array();

        // Transpile ES6 into a backwards compatible version of JavaScript in current and older browsers or environments
        loaders.unshift({
            loader: 'babel-loader',
            options: {
                presets: ['@babel/env'],
                plugins: ['@babel/plugin-proposal-object-rest-spread'],
                cacheDirectory: true,
                compact: false,
                babelrc: false
            }
        });

        if (this.isOption('mode', 'development')) {
            // Caches the result of following loaders on disk (default) or in the database
            loaders.unshift({ loader: 'cache-loader' });
        }

        return loaders;
    };

    /**
     * Build the Scss loaders array
     * https://webpack.js.org/concepts/loaders/
     * @return {Array}
     */
    getScssLoaders() {
        const sourceMap = this.isOption('cssSourceMaps');
        const loaders = new Array();

        // Compile Sass to CSS
        loaders.unshift({
            loader: 'sass-loader',
            options: {
                sourceMap: sourceMap,
                includePaths: [
                    path.resolve('node_modules'),
                    path.resolve('node_modules/flag-icon-css/sass')
                ]
            }
        });

        // Automatically add vendor prefixes to CSS rules
        // This increases build time; thus, we can optionally include this loader with the 'cssAutoPrefixer' flag
        if (this.isOption('cssAutoPrefixer')) {
            loaders.unshift({
                loader: 'postcss-loader',
                options: {
                    sourceMap: sourceMap,
                    plugins: [
                        require('autoprefixer')()
                    ]
                }, 
            });
        }
    
        // Intrepret @import and url() like import/require() and will resolve them
        // This loader converts the CSS to a CommonJS JavaScript module
        loaders.unshift({
            loader: 'css-loader',
            options: {
                url: false,
                sourceMap: sourceMap,
                importLoader: loaders.length
            }
        });
    
        // Extracts CSS from the generated CommonJS JavaScript modules into separate files. 
        loaders.unshift({ loader: MiniCssExtractPlugin.loader });
    
        if (this.isOption('mode', 'development')) {
            // Caches the result of following loaders on disk (default) or in the database
            loaders.unshift({ loader: 'cache-loader' });
        }
    
        return loaders;
    };

    /**
     * Create aliases for the client Js/Scss directories for each cartridge
     * https://webpack.js.org/configuration/resolve/#resolve-alias
     * @param {string} type - the asset type; 'js or 'scss'
     * @return {Object}
     */
    getResolver(type) {
        const aliases = new Object();

        for (let cartridge of this.cartridges) { 
            const clientPath = path.resolve(this.cartridgesPath, cartridge.name, "cartridge/client");
            aliases[cartridge.alias] = path.join(clientPath, 'default', type);
            
            if (fs.existsSync(clientPath)) {
                const locales = fs.readdirSync(clientPath)
                    .map(name => path.join(clientPath, name))
                    .filter(folder => fs.lstatSync(folder).isDirectory())
                    .filter(folder => folder.charAt(0) !== '.')
                    .filter(folder => path.basename(folder) !== 'default') // added a filter to block hidden folders, like .DS_Store
                
                for (let locale of locales) {
                    const name = path.basename(locale)
                    aliases[path.join(cartridge.alias, name)] = path.join(clientPath, name, type);
                }
            }   
        }

        return {
            modules: ["node_modules", path.resolve(__dirname, "cartridges")],
            alias: aliases,
        };
    };

    /**
     * Build an array of plugins needed for the JS configuration
     * https://webpack.js.org/concepts/plugins/
     * @return {Array}
     */
    getJsPlugins() {
        const plugins = new Array();
        const bootstrapPackages = {
            Alert: 'exports-loader?Alert!bootstrap/js/src/alert',
            // Button: 'exports-loader?Button!bootstrap/js/src/button',
            Carousel: 'exports-loader?Carousel!bootstrap/js/src/carousel',
            Collapse: 'exports-loader?Collapse!bootstrap/js/src/collapse',
            // Dropdown: 'exports-loader?Dropdown!bootstrap/js/src/dropdown',
            Modal: 'exports-loader?Modal!bootstrap/js/src/modal',
            // Popover: 'exports-loader?Popover!bootstrap/js/src/popover',
            Scrollspy: 'exports-loader?Scrollspy!bootstrap/js/src/scrollspy',
            Tab: 'exports-loader?Tab!bootstrap/js/src/tab',
            Tooltip: 'exports-loader?Tooltip!bootstrap/js/src/tooltip',
            Util: 'exports-loader?Util!bootstrap/js/src/util'
        };

        if (this.isOption('mode', 'production')) {
            const outputPath = path.resolve(this.cartridgesPath, this.siteCartridge.name, "cartridge/static")
            plugins.push(new CleanWebpackPlugin([
                `${outputPath}/*/js`,
                ".cache-loader"
            ], {
                root: process.cwd(),
                verbose: false
            }));
        }

        plugins.push(new webpack.ProvidePlugin(bootstrapPackages));
        
        plugins.push(new LogCompilerEventsPlugin({
            cartridges: this.cartridges,
            type: 'js'
        }))
        
        if (this.isOption('notifications')) {
            plugins.push(new WebpackNotifierPlugin({
                title: `${this.siteCartridge.name} JS Compiler`,
                alwaysNotify: true
            }));
        }

        return plugins;
    };

    /**
     * Build an array of plugins needed for the Scss configuration
     * https://webpack.js.org/concepts/plugins/
     * @return {Array}
     */
    getScssPlugins() {
        const plugins = new Array();

        if (this.isOption('mode', 'production')) {
            const outputPath = path.resolve(this.cartridgesPath, this.siteCartridge.name, "cartridge/static")
            plugins.push(new CleanWebpackPlugin([
                `${outputPath}/*/css`,
                ".cache-loader"
            ], {
                root: process.cwd(),
                verbose: false
            }));

            plugins.push(new OptimizeCssAssetsPlugin());
        }
        
        plugins.push(new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css"
        }));
        
        plugins.push(new MiniCssExtractPluginCleanup());
        
        plugins.push(new LogCompilerEventsPlugin({
            cartridges: this.cartridges,
            type: 'scss'
        }));

        if (this.isOption('notifications')) {
            plugins.push(new WebpackNotifierPlugin({
                title: `${this.siteCartridge.name} SCSS Compiler`,
                alwaysNotify: true
            }));
        }

        return plugins;
    };

    /**
     * Decide the amount of bundle information that is displayed by the compiler
     * https://webpack.js.org/configuration/stats/
     * @return {string}
     */
    getStats() {
        return (this.isOption('verbose')) ? "normal" : 'errors-only';
    }

    /**
     * Check whether an environmental option exists and is either equal to true or the passed value
     * @param {string} key
     * @param {string} value - this is optional
     * @return {boolean}
     */
    isOption(key, value) {
        return (value) ? (this.options.hasOwnProperty(key) && this.options[key] === value) :
                         (this.options.hasOwnProperty(key) && this.options[key] === 'true');
    };

    /**
     * Get the value of an environmental option 
     * @param {string} key
     * @return {any}
     */
    getOption(key) {
        return this.options[key];
    };
};
