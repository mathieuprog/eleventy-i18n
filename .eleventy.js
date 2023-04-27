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

  const translateFun = createTranslateFun(options);

  eleventyConfig.addFilter("translate", (key, params = {}, languageTag) => {
    return translateFun(key, params, languageTag ?? this.page.lang);
  });
};
