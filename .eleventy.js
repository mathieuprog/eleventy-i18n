const createTranslateFun = require('./src/createTranslateFun.js');

const defaultOptions = {
  keySeparator: undefined,
  fallbackLanguageTag: undefined,
  translations: {}
};

module.exports = (eleventyConfig, options) => {
  options = {
    ...defaultOptions,
    ...options,
  };

  eleventyConfig.addFilter("translate", createTranslateFun(options));
};
