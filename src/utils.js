function isNullOrUndefined(v) {
  return v === null || v === undefined;
}

function isObject(o) {
  return isObjectLiteral(o) || isObjectInstance(o);
}

function isObjectLiteral(o) {
  return !isNullOrUndefined(o) && Object.getPrototypeOf(o) === Object.prototype;
}

function isEmptyObjectLiteral(o) {
  return isObjectLiteral(o) && Object.keys(o).length === 0;
}

function isObjectInstance(o) {
  return !isNullOrUndefined(o)
    && !isArray(o)
    && Object.getPrototypeOf(o) !== Object.prototype
    && typeof o === 'object';
}

function isArray(a) {
  return !isNullOrUndefined(a) && Array.isArray(a);
}

function isEmptyArray(a) {
  return isArray(a) && a.length === 0;
}

function isArrayOfObjects(a) {
  if (!isArray(a) || a.length === 0) {
    return false;
  }

  return !a.some(o => !isObject(o));
}

function isArrayOfObjectLiterals(a) {
  if (!isArray(a) || a.length === 0) {
    return false;
  }

  return !a.some(o => !isObjectLiteral(o));
}

function isArrayOfPrimitives(a) {
  if (!isArray(a) || a.length === 0) {
    return false;
  }

  return !a.some(o => !isPrimitive(o));
}

function isArrayOfType(
  a,
  type
) {
  if (!isArray(a) || a.length === 0) {
    return false;
  }

  return !a.some(o => typeof o !== type);
}

function isArrayWhereEvery(a, fun) {
  if (!isArray(a) || a.length === 0) {
    return false;
  }

  return !a.some(o => !fun(o));
}

function isObjectLiteralWhereEvery(o, fun) {
  if (!isObjectLiteral(o) || isEmptyObjectLiteral(o)) {
    return false;
  }

  return isArrayWhereEvery(Object.values(o), fun);
}

function areValuesEqual(a, b) {
  if (a === b) return true;

  if (!a || !b) return false;

  if (typeof a !== typeof b) return false;

  if (isArray(a) !== isArray(b)) return false;

  if (isArray(a)) {
    if (!areArraysEqual(a, b)) return false;
    return true;
  }

  if (isObject(a) !== isObject(b)) return false;

  if (isObject(a)) {
    if (!areObjectsEqual(a, b)) return false;
    return true;
  }

  return false;
}

const ComparisonResult = {
  Equal: 'EQUAL',
  NotEqual: 'NOT_EQUAL',
  DefaultComparison: 'DEFAULT_COMPARISON',
};

function areObjectsEqual(a, b, options) {
  if (!isObject(a) || !isObject(b)) {
    throw new Error('expected objects');
  }

  if (a === b) return true;

  // ensure immutability
  a = { ...a };
  b = { ...b };

  switch (options?.compare(a, b)) {
    case 'DEFAULT_COMPARISON':
    case undefined:
      break;

    case 'EQUAL':
      return true;

    case 'NOT_EQUAL':
      return false;
  }

  if (isObjectLiteral(a) !== isObjectLiteral(b)) return false;

  if (isObjectInstance(a)) {
    const str = a.toString();
    return str !== '[object Object]' && str === b.toString();
  }

  if (Object.keys(a).length !== Object.keys(b).length) return false;

  for (let [key, value] of Object.entries(a)) {
    if (!hasProperty(b, key)) return false;

    const b_ = b;

    if (value === b_[key]) continue;

    if (!value || !b_[key]) return false;

    if (typeof value !== typeof b_[key]) return false;

    if (isArray(value) !== isArray(b_[key])) return false;

    if (isArray(value)) {
      if (!areArraysEqual(value, b_[key], options)) return false;
      continue;
    }

    if (isObject(value) !== isObject(b_[key])) return false;

    if (isObject(value)) {
      if (!areObjectsEqual(value, b_[key], options)) return false;
      continue;
    }

    return false;
  }

  return true;
}

function areArraysEqual(a, b, options) {
  if (!isArray(a) || !isArray(b)) {
    throw new Error('expected arrays');
  }

  if (a === b) return true;

  // ensure immutability
  a = [...a];
  b = [...b];

  switch (options?.compare(a, b)) {
    case 'DEFAULT_COMPARISON':
    case undefined:
      break;

    case 'EQUAL':
      return true;

    case 'NOT_EQUAL':
      return false;
  }

  if (a.length !== b.length) return false;

  for (let value of a) {
    if (isArray(value)) {
      const value_ = value;
      const index = b.findIndex(e => isArray(e) && areArraysEqual(e, value_, options));
      if (index === -1) return false;
      b.splice(index, 1);
      continue;
    }

    if (isObject(value)) {
      const value_ = value;
      const index = b.findIndex(e => isObject(e) && areObjectsEqual(e, value_, options));
      if (index === -1) return false;
      b.splice(index, 1);
      continue;
    }

    const index = b.findIndex(e => e === value);
    if (index === -1) return false;
    b.splice(index, 1);
  }

  return true;
}

function hasProperty(o, prop) {
  if (!isObject(o)) {
    throw new Error('expected object');
  }

  return Object.prototype.hasOwnProperty.call(o, prop);
}

function hasProperties(o, props) {
  return props.every(prop => hasProperty(o, prop));
}

function filterProperties(o, arg) {
  return isArray(arg)
    ? filterPropsByWhitelist(o, arg)
    : filterPropsByFun(o, arg);
}

function filterPropsByWhitelist(o, props) {
  return props.reduce((newObject, prop) => {
    return (prop in o)
      ? { ...newObject, [prop]: o[prop] }
      : newObject;
  }, {});
}

function filterPropsByFun(o, fun) {
  const filteredEntries = Object.entries(o).filter(([key, val]) => fun(key, val));
  return Object.fromEntries(filteredEntries);
}

function rejectProperties(o, arg) {
  return isArray(arg)
    ? rejectPropsByWhitelist(o, arg)
    : rejectPropsByFun(o, arg);
}

function rejectPropsByWhitelist(o, props) {
  return Object.keys(o).reduce((newObject, prop) => {
    return (props.includes(prop))
      ? newObject
      : { ...newObject, [prop]: o[prop] };
  }, {});
}

function rejectPropsByFun(o, fun) {
  const filteredEntries = Object.entries(o).filter(([key, val]) => !fun(key, val));
  return Object.fromEntries(filteredEntries);
}

function takeProperties(o, arg) {
  return isArray(arg)
    ? takePropsByWhitelist(o, arg)
    : takePropsByFun(o, arg);
}

function takePropsByWhitelist(o, props) {
  const keys = Object.keys(o);

  const undefined_ =
    differenceArraysOfPrimitives(props, keys)
      .reduce((acc, key) => ({ ...acc, [key]: undefined }), {});

  return keys.reduce(({ filtered, rejected, undefined }, prop) => {
    return (props.includes(prop))
      ? { filtered: { ...filtered, [prop]: o[prop] }, rejected, undefined }
      : { filtered, rejected: { ...rejected, [prop]: o[prop] }, undefined }
  }, { filtered: {}, rejected: {}, undefined: undefined_ });
}

function takePropsByFun(o, fun) {
  const filteredKeys =
    Object.entries(o)
      .filter(([key, val]) => fun(key, val))
      .map(([key, _]) => key);

  return takePropsByWhitelist(o, filteredKeys);
}

function removeArrayElements(array, listOfValues) {
  if (!isArray(array) || !isArray(listOfValues)) {
    throw new Error('expected array');
  }

  listOfValues.forEach((value) => {
    array = removeArrayElement(array, value);
  });

  return array;
}

function removeArrayElement(array, valueOrFun) {
  if (!isArray(array)) {
    throw new Error('expected array');
  }

  return (typeof valueOrFun === 'function')
    ? removeArrayElementByFun(array, valueOrFun)
    : removeArrayElementByValue(array, valueOrFun);
}

function removeArrayElementByValue(array, value) {
  const indexToRemove = array.indexOf(value);

  return (indexToRemove !== -1)
    ? removeArrayElementByIndex(array, indexToRemove)
    : array;
}

function removeArrayElementByFun(array, fun) {
  let indexToRemove = null;

  for (let i = 0; i < array.length; ++i) {
    if (fun(array[i])) {
      indexToRemove = i;
      break;
    }
  }

  if (indexToRemove === null) {
    return array;
  }

  return removeArrayElementByIndex(array, indexToRemove);
}

function removeArrayElementByIndex(array, index) {
  if (!isArray(array)) {
    throw new Error('expected array');
  }

  if (isNaN(index) || index < 0) {
    throw new Error('expected positive number')
  }

  return [...array.slice(0, index), ...array.slice(index + 1)];
}

function differenceArraysOfPrimitives(a1, a2) {
  return a1.filter((e) => !a2.includes(e));
}

function isObjectSubset(superObject, subObject) {
  if (!isObject(superObject) || !isObject(subObject)) {
    throw new Error('expected objects');
  }

  if (superObject === subObject) return true;

  if (isObjectLiteral(superObject) !== isObjectLiteral(subObject)) return false;

  if (isObjectInstance(superObject)) {
    const str = superObject.toString();
    return str !== '[object Object]' && str === subObject.toString();
  }

  if (Object.keys(superObject).length < Object.keys(subObject).length) return false;

  return Object.keys(subObject).every(key => {
    if (!hasProperty(superObject, key)) return false;

    if (superObject[key] === subObject[key]) return true;

    if (!superObject[key] || !subObject[key]) return false;

    if (typeof superObject[key] !== typeof subObject[key]) return false;

    if (isObject(superObject[key]) !== isObject(subObject[key])) return false;

    if (isObject(superObject[key])) {
      return isObjectSubset(superObject[key], subObject[key]);
    }

    if (isArray(superObject[key]) !== isArray(subObject[key])) return false;

    if (isArray(superObject[key])) {
      return isArraySubset(superObject[key], subObject[key]);
    }

    return false;
  });
}

function isArraySubset(superArray, subArray) {
  if (!isArray(superArray) || !isArray(subArray)) {
    throw new Error('expected arrays');
  }

  if (superArray === subArray) return true;

  if (superArray.length < subArray.length) return false;

  superArray = [...superArray];
  subArray = [...subArray];

  for (let value of subArray) {
    if (isArray(value)) {
      const value_ = value;
      const index = superArray.findIndex(e => isArray(e) && isArraySubset(e, value_));
      if (index === -1) return false;
      superArray.splice(index, 1);
      continue;
    }

    if (isObject(value)) {
      const value_ = value;
      const index = superArray.findIndex(e => isObject(e) && isObjectSubset(e, value_));
      if (index === -1) return false;
      superArray.splice(index, 1);
      continue;
    }

    const index = superArray.findIndex(e => e === value);
    if (index === -1) return false;
    superArray.splice(index, 1);
  }

  return true;
}

function isPrimitive(value) {
  return value !== Object(value);
}

function deepFreeze(o) {
  if (!isObject(o) && !isArray(o)) {
    throw new Error('expected object or array');
  }

  Object.keys(o).forEach((prop) => {
    const o_ = o;
    if ((!isObject(o_[prop]) || !isArray(o_[prop])) && !Object.isFrozen(o_[prop])) {
      deepFreeze(o_[prop]);
    }
  });

  return Object.freeze(o);
}

function sortProperties(o) {
  return Object.fromEntries(Object.entries(o).sort(([k1], [k2]) => k1 < k2 ? -1 : 1));
}

function range(options) {
  const unknownOptions = rejectProperties(options, ['start', 'count', 'endInclusive', 'endExclusive']);

  if (!isEmptyObjectLiteral(unknownOptions)) {
    throw new Error(`unknown options: ${Object.keys(unknownOptions).join(', ')}`);
  }

  if (!options.endInclusive && !options.endExclusive && !options.count) {
    throw new Error('expected either `endInclusive`, `endExclusive` or `count` to be specified');
  }

  if (Number(!!options?.count) + Number(!!options?.endInclusive) + Number(!!options?.endExclusive) > 1) {
    throw new Error('expected only one of the properties `endInclusive`, `endExclusive`, or `count` to be specified.');
  }

  const start = options.start ?? 0;

  if (options.endInclusive && start > options.endInclusive) {
    throw new Error('`endInclusive` should be greater or equal than `start`');
  }

  if (options.endExclusive && start >= options.endExclusive) {
    throw new Error('`endExclusive` should be greater than `start`');
  }

  const count = options.count ?? ((options.endInclusive) ? options.endInclusive - start + 1 : options.endExclusive - start);

  return [...Array(count).keys()].map(i => i + start);
}

function duplicate(value, count, transformFun) {
  return [...Array(count).keys()].map(i => transformFun(value, i));
}

function unique(a, fun) {
  if (!fun) {
    return [...new Set(a)];
  }

  const uniqueMap = new Map();

  for (const item of a) {
    const key = fun(item);

    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, item);
    }
  }

  return Array.from(uniqueMap.values());
}

module.exports = {
  areArraysEqual,
  areObjectsEqual,
  areValuesEqual,
  ComparisonResult,
  deepFreeze,
  differenceArraysOfPrimitives,
  duplicate,
  filterProperties,
  hasProperty,
  hasProperties,
  isArray,
  isArrayOfObjects,
  isArrayOfObjectLiterals,
  isArrayOfPrimitives,
  isArrayOfType,
  isArraySubset,
  isArrayWhereEvery,
  isEmptyArray,
  isEmptyObjectLiteral,
  isNullOrUndefined,
  isObject,
  isObjectInstance,
  isObjectLiteral,
  isObjectLiteralWhereEvery,
  isObjectSubset,
  isPrimitive,
  range,
  rejectProperties,
  removeArrayElement,
  removeArrayElementByIndex,
  removeArrayElements,
  sortProperties,
  takeProperties,
  unique
};

