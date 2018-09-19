/* jshint node: true */
'use strict';

const RSVP = require('rsvp');
const DeployPluginBase = require('ember-cli-deploy-plugin');
const path = require('path');

const sendDeployData = function(assets, options) {
  const pushedAssets = assets.map(function(asset) {
    // Get rid of the fingerprint
    asset.name = asset.name.split(/-[a-f0-9]{32}/ig).join('');
    // And only keep filename
    asset.name = path.basename(asset.name);
    return asset;
  });
}

module.exports = {
  name: 'ember-cli-deploy-asset-sizes',

  createDeployPlugin: function(options) {
    const DeployPlugin = DeployPluginBase.extend({
      name: options.name,

      defaultConfig: {
        projectRoot: function(context) {
          return context.project.root;
        },
        distDir: function(context) {
          return context.distDir || 'tmp/deploy-dist';
        },
      },

      willUpload: function(context) {
        const root = this.readConfig('projectRoot');
        const distDir = this.readConfig('distDir');
        const outputPath = root + '/' + distDir;

        const AssetSizePrinter = require('ember-cli/lib/models/asset-size-printer');
        const sizePrinter = new AssetSizePrinter({
          ui: this.ui,
          outputPath: outputPath
        });
        const makeAssetSizesObject = sizePrinter.makeAssetSizesObject();

        // this.readConfig('sendDeployData') will automatically call the function
        // Instead, we take it from the pluginConfig
        const sendDeployDataFunction = this.pluginConfig.sendDeployData || sendDeployData;

        return makeAssetSizesObject.then(function(assets) {
          return sendDeployDataFunction(assets, options);
        });
      }
    });

    return new DeployPlugin();
  }
};
