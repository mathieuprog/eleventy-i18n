const {
  areObjectsEqual,
  isEmptyObjectLiteral,
  isObjectLiteral,
  rejectProperties
} = require('./utils.js');

const registry = require('./registry.js');

const defaultOptions = {
  keySeparator: undefined,
  fallbackLanguageTag: undefined,
  translations: {}
};

module.exports = function (opts = {}) {
  opts = Object.assign({}, defaultOptions, opts);

  if (isEmptyObjectLiteral(opts.translations)) {
    throw new Error('no translations provided');
  }

  for (const [languageTag, translations] of Object.entries(opts.translations)) {
    registry.addTranslations(languageTag, translations);
  }

  return (key, params = {}, languageTag) => {
    const fallbackTranslations =
      (opts.fallbackLanguageTag)
        ? registry[opts.fallbackLanguageTag]
        : {};

    const translations = registry[this.page.lang];

    let translations_ =
      (languageTag)
        ? registry[languageTag]
        : translations;

    let value;

    if (opts.keySeparator) {
      const splitKey = key.split(opts.keySeparator);
      const firstKey = splitKey.shift();

      const translationsObject =
        (translations_[firstKey] && translations_)
          ?? (fallbackTranslations[firstKey] && fallbackTranslations)
          ?? (() => { throw new Error(`translation for "${firstKey}" not found`) })();

      let o = translationsObject[firstKey];

      while (splitKey.length > 0) {
        const k = splitKey.shift();
        o = o[k] ?? (() => { throw new Error(`translation for "${key}" not found`) })();
      }

      value = o;
    } else {
      value =
        translations_[key]
        ?? fallbackTranslations[key]
        ?? (() => { throw new Error(`translation for "${key}" not found`) })();
    }

    let paramsUsed = {};

    let isPlural = false;

    if (isObjectLiteral(value)) {
      const pluralTranslations = value;

      const rejectedProps = rejectProperties(pluralTranslations, ['zero', 'one', 'two', 'few', 'many', 'other']);
      if (!isEmptyObjectLiteral(rejectedProps)) {
        throw new Error(`invalid keys "${JSON.stringify(rejectedProps)}"`);
      }

      const cardinal = params['cardinal'];
      const ordinal = params['ordinal'];
      if (!cardinal && !ordinal) {
        throw new Error('cardinal or ordinal parameter not found');
      }
      if (cardinal && ordinal) {
        throw new Error('cannot use both cardinal and ordinal parameters');
      }

      const count = cardinal || ordinal;

      const pluralRule = new Intl.PluralRules(this.page.lang).select(count);

      value = pluralTranslations[pluralRule];
      if (!value) {
        throw new Error(`message for plural rule "${pluralRule}" not found`);
      }

      isPlural = true;
    }

    value =
      value.replace(/{{(.*?)}}/g, (_, path) => {
        let paramsUsed_ = paramsUsed;

        path = path.trim();
        const splitKey = path.split('.');

        const value = splitKey.reduce((params, key) => {
          paramsUsed_[key] = isObjectLiteral(params[key]) ? (paramsUsed_[key] ?? {}) : params[key];
          paramsUsed_ = paramsUsed_[key];

          return params[key] ?? (() => { throw new Error(`value for parameter "${path}" not found`) })();
        }, params);

        if (typeof value !== 'string' && typeof value !== 'number') {
          (value === undefined)
            ? (() => { throw new Error(`value for parameter "${path}" not found`) })()
            : (() => { throw new Error(`invalid value for parameter "${path}": ${value}`) })();
        }

        return value;
      });

    if (isPlural) {
      if ('cardinal' in params) {
        paramsUsed.cardinal = params.cardinal;
      }
      if ('ordinal' in params) {
        paramsUsed.ordinal = params.ordinal;
      }
    }

    if (!areObjectsEqual(params, paramsUsed)) {
      throw new Error(`too many parameters passed "${JSON.stringify(params)}"`);
    }

    return value;
  };
};
