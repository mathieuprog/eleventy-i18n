let registry = {};

function getSupportedLanguageTags() {
  return Object.keys(registry);
}

function addTranslations(locale, translations) {
  registry[locale] ??= {};

  const collidingKeys = commonKeys(registry[locale], translations);
  if (collidingKeys.length > 0) {
    throw new Error(`colliding keys: ${collidingKeys.join(', ')}`);
  }

  registry[locale] = {
    ...registry[locale],
    ...translations
  };
}

function commonKeys(a, b) {
  return Object.keys(a).filter(function (key) { 
    return b.hasOwnProperty(key); 
  });
};

module.exports = registry;
module.exports.getSupportedLanguageTags = getSupportedLanguageTags;
module.exports.addTranslations = addTranslations;
