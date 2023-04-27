# i18n for Eleventy

`eleventy-i18n` offers a translation dictionary, dynamic parameters, and pluralization support to create multilingual websites with ease.

First, add your translation files into your project. For example:

```js
// translations/en.json
{
  "hello": "Hello!"
}

// translations/fr.json
{
  "hello": "Bonjour !"
}
```

Then, add the built-in Eleventy i18n plugin and this plugin in the `.eleventy.js` file:

```js
const { EleventyI18nPlugin } = require("@11ty/eleventy");
const i18nPlugin = require("eleventy-i18n");

module.exports = function (eleventyConfig) {
  // code...

  eleventyConfig.addPlugin(EleventyI18nPlugin, {
    defaultLanguage: "en",
    filters: {
      url: "locale_url",

      // find the other localized content for a specific input file
      links: "locale_links",
    },

    // When to throw errors for missing localized content files
    errorMode: "strict", // throw an error if content is missing at /en/slug
    // errorMode: "allow-fallback", // only throw an error when the content is missing at both /en/slug and /slug
    // errorMode: "never", // don’t throw errors for missing content
  });

  eleventyConfig.addPlugin(i18nPlugin, {
    translations: {
      en: enTranslations,
      fr: frTranslations
    }
  });

  // code...
};

```
