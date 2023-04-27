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

  const translate = createTranslateFun(options);

  eleventyConfig.addFilter('translate', function (key, params = {}, languageTag) {
    return translate(key, params, languageTag ?? this.page.lang);
  });
};
