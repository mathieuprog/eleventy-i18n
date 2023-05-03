# i18n for Eleventy

`eleventy-i18n` offers a translation dictionary, dynamic parameters, and pluralization support to create multilingual websites with ease.

* [Installation](#installation)
* [Translation files](#translation-files)
* [Plugin setup](#plugin-setup)
* [Translation filter `t`](#translation-filter-t)
  * [Translation parameters](#translation-parameters)
  * [Overriding the current locale](#overriding-the-current-locale)
  * [Additional configuration options](#additional-configuration-options)

## Installation

```bash
npm install eleventy-i18n --save-dev
```

## Translation files

Initially, incorporate your translation files into your project, for example:

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

## Plugin setup

Next, integrate the built-in Eleventy i18n plugin along with this plugin by adding them to the `.eleventy.js` file:

```js
const { EleventyI18nPlugin } = require("@11ty/eleventy");
const i18nPlugin = require("eleventy-i18n");

const en = require("./src/translations/en.json");
const fr = require("./src/translations/fr.json");

module.exports = function (eleventyConfig) {
  // code...

  eleventyConfig.addPlugin(EleventyI18nPlugin, {
    defaultLanguage: "en",
    filters: {
      url: "locale_url",
      links: "locale_links"
    },
    errorMode: "strict"
  });

  eleventyConfig.addPlugin(i18nPlugin, {
    translations: { en, fr }
  });
};
```

## Translation filter `t`

You can then make use of the `t` filter to translate the key into the desired language, as demonstrated below:

```html
<p>{{ 'hello' | t }}</p>
```

### Translation parameters

Your translations may also include parameter, as illustrated in the following example:

```js
// translations/en.json
{
  "welcome": "Welcome {{ name }}!"
}

// translations/fr.json
{
  "welcome": "Bienvenue {{ name }} !"
}
```

```html
<p>{{ 'welcome' | t({ name: 'John' }) }}</p>
```

Parameters may also be objects:

```js
// translations/en.json
{
  "Hello, {{ user.name }}!"
}
```

```html
<p>{{ 'welcome' | t({ user: { name: 'John' }}) }}</p>
```

### Overriding the current locale

You have the option to enforce translation in a specific language, rather than relying on the current language setting:

```html
<p>{{ 'hello' | t({}, 'fr') }}</p>
```

### Additional configuration options

The plugin offers two optional configuration parameters:
* `fallbackLanguageTag`: Specifies the fallback locale when a translation is not available for the current locale.
* `keySeparator`: Enables the use of nested translations.

```js
eleventyConfig.addPlugin(i18nPlugin, {
  translations: { en, fr },
  fallbackLanguageTag: 'en',
  keySeparator: '.'
});
```

Keep in mind that if you have a locale such as `fr-CA`, the plugin will first attempt to fallback to `fr` before resorting to the default locale you specified.

Here's an example illustrating the use of nested translations, made possible by the `keySeparator` configuration:

```js
// translations/en.json
{
  "welcome": {
    "hello": "Hello!"
  }
}
```

```html
<p>{{ 'welcome.hello' | t }}</p>
```
