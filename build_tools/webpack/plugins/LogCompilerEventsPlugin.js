'use strict';

const chalk = require('chalk');

/**
 * A custom Webpack plugin to generate logging around compiler events
 */
module.exports = class LogCompilerEventsPlugin {
    constructor(options) {
        this.cartridges = options.cartridges || [];
        this.siteCartridge = this.cartridges[this.cartridges.findIndex(cartridge => cartridge.alias === 'site')];
        this.type = (options.type).toUpperCase()
    }
    apply(compiler) {
      compiler.hooks.thisCompilation.tap('LogCompilerEventsPlugin', (compilation) => {
        this.timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
        console.log(chalk.white(`[${this.timestamp}] "${chalk.bold(this.siteCartridge.name)}" ${this.type} compiler is ${chalk.yellow(`running`)}`));

      })
      compiler.hooks.done.tap('LogCompilerEventsPlugin', (stats) => {
            const timing = ((stats.endTime - stats.startTime)/1000).toFixed(2);
            console.log(chalk.white(`[${this.timestamp}] "${chalk.bold(this.siteCartridge.name)}" ${this.type} compiler was ${chalk.green(`successful`)} in ${timing} seconds`));
            if (this.watch) {
                console.log(chalk.white(`[${this.timestamp}] "${chalk.bold(this.siteCartridge.name)}" ${this.type} compiler is ${chalk.cyan(`ready`)} for changes`));
            }
      });
      compiler.hooks.watchRun.tap('LogCompilerEventsPlugin', (compiler) => {
          this.watch = true;
      });
    }
}