# i18n for Eleventy

`eleventy-i18n` offers a translation dictionary, dynamic parameters, and pluralization support to create multilingual websites with ease.

* [Scope](#scope)
* [Installation](#installation)
* [Translation files](#translation-files)
* [Plugin setup](#plugin-setup)
* [Translation filter `t`](#translation-filter-t)
  * [Translation parameters](#translation-parameters)
  * [Pluralization](#pluralization)
  * [Overriding the current locale](#overriding-the-current-locale)
  * [Additional configuration options](#additional-configuration-options)
* [Organizing files & directories](#organizing-files--directories)

## Scope

This library offers the following features:
* A translation dictionary
* Parameter support
* Pluralization support
* Fallback translation support

For further information on serving pages in different languages and guidance on structuring folders and pages, consult the official documentation:
* https://www.11ty.dev/docs/i18n/
* https://www.11ty.dev/docs/plugins/i18n/

In essence, this library provides a translation dictionary but does not dictate any specific approaches concerning project structure, language folders, or multilingual URLs. However, an approach to organizing files and directories is suggested in the [Organizing files & directories](#organizing-files--directories) section of the Readme.

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

Your translations may also include parameters, as illustrated in the following example:

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

### Pluralization

Languages have different rules for plurals.

This plugin allows you to define a translation per plural rule:

```js
// translations/en.json
{
  "messages": {
    "one": "One message received.",
    "other": "{{ cardinal }} messages received.",
    "zero": "No messages received."
  },
  "position": {
    "one": "{{ ordinal }}st",
    "two": "{{ ordinal }}nd",
    "few": "{{ ordinal }}rd",
    "other": "{{ ordinal }}th",
  }
}
```

Either a cardinal or ordinal parameter must be present when translating, for the library to pick the right message:

```html
<p>{{ 'messages' | t({ cardinal: 1 }) }}</p>
<!-- One message received. -->
```

```html
<p>{{ 'position' | t({ ordinal: 1 }) }}</p>
<!-- 1st -->
```

### Overriding the current locale

You have the option to enforce translation in a specific language, rather than relying on the current language:

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

## Organizing files & directories

The following outlines a suggested approach for organizing folders and files.

1. Add the layout files

To prevent duplicating markup for each language, treat every page as a layout:

```
├─ src
    └─ _includes
      └─ content
        ├─ about.njk
        └─ index.njk
      └─ layout
        └─ base.njk
```

`src/_includes/layout/base.njk`:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ 'head_title' | t }}</title>
  <link rel="alternate" hreflang="{{page.lang}}" href="{{ site.url }}{{ page.url }}">
  {% for link in page.url | locale_links %}<link rel="alternate" hreflang="{{ link.lang }}" href="{{ site.url }}{{ link.url }}">{% endfor %}
  <meta name="description" content="{{ 'head_description' | t }}">
  <link rel="stylesheet" href="{{ '/css/style.css' | url | safe }}">
</head>
<body>
  <div class="page">
    {{ content | safe }}
  </div>
</body>
</html>
```

`src/_includes/content/index.njk`:

```html
---
layout: "layout/base.njk"
---

<main>
  <div class="view homepage">
    <h1 class="homepage__title">{{ 'landing_title' | t }}</h1>
    <h2 class="homepage__subtitle">{{ 'landing_subtitle' | t }}</h2>
    <a class="homepage__cta" href="#">{{ 'landing_cta' | t }}</a>
  </div>
</main>
```

2. Create directories corresponding to each language code (e.g. 'en', 'fr', 'de', etc.):

```
├─ src
    ├─ en
    └─ fr
```

3. Include the pages within these directories:

```
├─ src
    └─ en
      ├─ about.njk
      ├─ index.njk
    └─ fr
      ├─ about.njk
      ├─ index.njk
```

`src/en/about.njk`:

```
---
permalink: /about
layout: "content/index.njk"
---
```

`src/fr/about.njk`:

```
---
permalink: /fr/a-propos
layout: "content/index.njk"
---
```

In the example mentioned above, 'en' is set as the default language, and the URLs for the English version don't include the language code '/en' in the URL structure (see permalink).

4. Add Directory Data Files (the JSON files as shown in the directory structure below):

```
├─ src
    └─ en
      ├─ about.njk
      ├─ index.njk
      └─ en.json
    └─ fr
      ├─ about.njk
      ├─ index.njk
      └─ fr.json
```

`src/fr/fr.json`:

```
{
  "dir": "ltr"
}
```

`src/en/en.json`:

```
{
  "dir": "ltr"
}
```

5. Add `<html>` attributes:

```html
<html lang="{{ page.lang }}" dir="{{ dir }}">
```

6. If you'd like to automatically redirect users to their preferred language version of your website, you can use the following approach. In this example, 'en' serves as the default language, and the homepage for the default language includes a script that redirects users to another supported language if it's their preferred language as configured in their browser.

`src/en/index.njk`:

```html
---
permalink: /
layout: "content/index.njk"
head_scripts: >
  <script>
    const supportedLanguageTags = ['en', 'fr'];
    const defaultLanguageTag = 'en';

    function detectPreferredLanguageTag() {
      for (let preferredLanguageTag of navigator.languages) {
        preferredLanguageTag = preferredLanguageTag.toLowerCase();

        if (supportedLanguageTags.includes(preferredLanguageTag)) {
          return preferredLanguageTag;
        }

        const languageCode = preferredLanguageTag.split('-')[0];
        if (supportedLanguageTags.includes(languageCode)) {
          return languageCode;
        }
      }
      return null;
    }

    function redirectToLanguage() {
      const languageSwitched = sessionStorage.getItem('languageSwitched');
      if (languageSwitched) {
        return;
      }

      const preferredLanguageTag = detectPreferredLanguageTag();
      if (preferredLanguageTag && window.location.pathname === '/' && preferredLanguageTag !== defaultLanguageTag) {
        sessionStorage.setItem('languageSwitched', 'true');
        window.location.href = `/${preferredLanguageTag}`;
      }
    }

    redirectToLanguage();
  </script>
---
```
