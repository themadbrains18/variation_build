require("dotenv").config();
const path = require('path')
const webpack = require('webpack')

const apiKey =  JSON.stringify(process.env.SHOPIFY_API_KEY);
const host = JSON.stringify(process.env.HOSTNAME);
const SHOPIFY_BASE_URL = JSON.stringify(process.env.SHOPIFY_BASE_URL);



module.exports = {

  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  webpack : (config) => {
    const env = { API_KEY: apiKey, host : host, SHOPIFY_BASE_URL : SHOPIFY_BASE_URL };
    config.plugins.push(new webpack.DefinePlugin(env));
    return config;
  }
  
}
