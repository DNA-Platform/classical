import '@src/index';
import u from '@src/utilities';

// Tests for areEqual
test('areEqual should return true for equal primitive values', () => {
  const expected = true;
  const actual = u.areEqual(1, 1);
  expect(actual).toBe(expected);
});

test('areEqual should return false for different primitive values', () => {
  const expected = false;
  const actual = u.areEqual(1, 2);
  expect(actual).toBe(expected);
});

// Tests for argumentsToArray
function testFunction(a?: any, b?: any, c?: any) {
  return u.argumentsToArray<number>(arguments);
}

test('argumentsToArray should convert arguments to an array', () => {
  const expected = [1, 2, 3];
  const actual = testFunction(1, 2, 3);
  expect(actual).toEqual(expected);
});

test('argumentsToArray should handle no arguments', () => {
  const expected = [];
  const actual = testFunction();
  expect(actual).toEqual(expected);
});

// Tests for coalesce
test('coalesce should return the value if it is not null or undefined', () => {
  const expected = 1;
  const actual = u.coalesce(1, 2);
  expect(actual).toBe(expected);
});

test('coalesce should return the alternative if the value is null or undefined', () => {
  const expected = 2;
  const actual = u.coalesce(undefined, 2);
  expect(actual).toBe(expected);
});

// Tests for extend
test('extend should copy properties from source to destination', () => {
  const dest = { a: 1 };
  const source = { b: 2 };
  const expected = { a: 1, b: 2 };
  const actual = u.extend(dest, source);
  expect(actual).toEqual(expected);
});

test('extend should overwrite properties in destination with source properties', () => {
  const dest = { a: 1, b: 1 };
  const source = { b: 2 };
  const expected = { a: 1, b: 2 };
  const actual = u.extend(dest, source);
  expect(actual).toEqual(expected);
});

// Tests for format
test('format should replace placeholders with corresponding values', () => {
  const expected = 'Hello world!';
  const actual = u.format('Hello {0}!', 'world');
  expect(actual).toBe(expected);
});

test('format should handle multiple placeholders', () => {
  const expected = 'Hello Alice, you have 5 new messages';
  const actual = u.format('Hello {0}, you have {1} new messages', 'Alice', 5);
  expect(actual).toBe(expected);
});

// Tests for titleCase
test('titleCase should capitalize the first letter of each word', () => {
  const expected = 'Hello World';
  const actual = u.titleCase('hello world');
  expect(actual).toBe(expected);
});

test('titleCase should handle empty strings', () => {
  const expected = '';
  const actual = u.titleCase('');
  expect(actual).toBe(expected);
});

// Tests for sentenceCase
test('sentenceCase should capitalize the first word and ensure the sentence ends with a period', () => {
  const expected = 'Hello world.';
  const actual = u.sentenceCase('hello world');
  expect(actual).toBe(expected);
});

test('sentenceCase should handle empty strings', () => {
  const expected = '';
  const actual = u.sentenceCase('');
  expect(actual).toBe(expected);
});

// Tests for getPropertyNames
test('getPropertyNames should return all property names of an object', () => {
  const obj = { a: 1, b: 2 };
  const actual = u.getPropertyNames(obj);
  const expected = expect.arrayContaining(['a', 'b']);
  expect(actual).toEqual(expected);
});

test('getPropertyNames should return inherited properties', () => {
  class Parent {
    parentProp = 'parent';
  }
  class Child extends Parent {
    childProp = 'child';
  }
  const child = new Child();
  const actual = u.getPropertyNames(child);
  const expected = expect.arrayContaining(['parentProp', 'childProp']);
  expect(actual).toEqual(expected);
});

// Tests for isNull
test('isNull should return true for null values', () => {
  const expected = true;
  const actual = u.isNull(null);
  expect(actual).toBe(expected);
});

test('isNull should return false for non-null values', () => {
  const expected = false;
  const actual = u.isNull(1);
  expect(actual).toBe(expected);
});

// Tests for isUndefined
test('isUndefined should return true for undefined values', () => {
  const expected = true;
  const actual = u.isUndefined(undefined);
  expect(actual).toBe(expected);
});

test('isUndefined should return false for defined values', () => {
  const expected = false;
  const actual = u.isUndefined(1);
  expect(actual).toBe(expected);
});

// Tests for isNullOrUndefined
test('isNullOrUndefined should return true for null or undefined values', () => {
  const expected = true;
  const actualNull = u.isNullOrUndefined(null);
  const actualUndefined = u.isNullOrUndefined(undefined);
  expect(actualNull).toBe(expected);
  expect(actualUndefined).toBe(expected);
});

test('isNullOrUndefined should return false for defined values', () => {
  const expected = false;
  const actual = u.isNullOrUndefined(1);
  expect(actual).toBe(expected);
});

// Tests for isDefined
test('isDefined should return true for defined values', () => {
  const expected = true;
  const actual = u.isDefined(1);
  expect(actual).toBe(expected);
});

test('isDefined should return false for null or undefined values', () => {
  const expected = false;
  const actualNull = u.isDefined(null);
  const actualUndefined = u.isDefined(undefined);
  expect(actualNull).toBe(expected);
  expect(actualUndefined).toBe(expected);
});

// Tests for isNumber
test('isNumber should return true for number values', () => {
  const expected = true;
  const actualPrimitive = u.isNumber(1);
  const actualObject = u.isNumber(new Number(1));
  expect(actualPrimitive).toBe(expected);
  expect(actualObject).toBe(expected);
});

test('isNumber should return false for non-number values', () => {
  const expected = false;
  const actual = u.isNumber('1');
  expect(actual).toBe(expected);
});

// Tests for isNaN
test('isNaN should return true for NaN values', () => {
  const expected = true;
  const actual = u.isNaN(NaN);
  expect(actual).toBe(expected);
});

test('isNaN should return false for non-NaN values', () => {
  const expected = false;
  const actual = u.isNaN(1);
  expect(actual).toBe(expected);
});

// Tests for isInfinity
test('isInfinity should return true for Infinity values', () => {
  const expected = true;
  const actualPositive = u.isInfinity(Infinity);
  const actualNegative = u.isInfinity(-Infinity);
  expect(actualPositive).toBe(expected);
  expect(actualNegative).toBe(expected);
});

test('isInfinity should return false for finite values', () => {
  const expected = false;
  const actual = u.isInfinity(1);
  expect(actual).toBe(expected);
});

// Tests for isInteger
test('isInteger should return true for integer values', () => {
  const expected = true;
  const actualPositive = u.isInteger(1);
  const actualNegative = u.isInteger(-1);
  expect(actualPositive).toBe(expected);
  expect(actualNegative).toBe(expected);
});

test('isInteger should return false for non-integer values', () => {
  const expected = false;
  const actual = u.isInteger(1.1);
  expect(actual).toBe(expected);
});

// Tests for isString
test('isString should return true for string values', () => {
  const expected = true;
  const actualPrimitive = u.isString('test');
  const actualObject = u.isString(new String('test'));
  expect(actualPrimitive).toBe(expected);
  expect(actualObject).toBe(expected);
});

test('isString should return false for non-string values', () => {
  const expected = false;
  const actual = u.isString(1);
  expect(actual).toBe(expected);
});

// Tests for isBoolean
test('isBoolean should return true for boolean values', () => {
  const expected = true;
  const actualPrimitive = u.isBoolean(true);
  const actualObject = u.isBoolean(new Boolean(true));
  expect(actualPrimitive).toBe(expected);
  expect(actualObject).toBe(expected);
});

test('isBoolean should return false for non-boolean values', () => {
  const expected = false;
  const actual = u.isBoolean(1);
  expect(actual).toBe(expected);
});

// Tests for isTrue
test('isTrue should return true for true boolean values', () => {
  const expected = true;
  const actual = u.isTrue(true);
  expect(actual).toBe(expected);
});

test('isTrue should return false for false boolean values', () => {
  const expected = false;
  const actual = u.isTrue(false);
  expect(actual).toBe(expected);
});

// Tests for isTruthyds
test('isTruthy should return true for truthy values', () => {
  const expected = true;
  const actual1 = u.isTruthy(1);
  const actual2 = u.isTruthy('test');
  expect(actual1).toBe(expected);
  expect(actual2).toBe(expected);
});

test('isTruthy should return false for falsy values', () => {
  const expected = false;
  const actual1 = u.isTruthy(0);
  const actual2 = u.isTruthy('');
  expect(actual1).toBe(expected);
  expect(actual2).toBe(expected);
});

// Tests for isFalse
test('isFalse should return true for false boolean values', () => {
  const expected = true;
  const actual = u.isFalse(false);
  expect(actual).toBe(expected);
});

test('isFalse should return false for true boolean values', () => {
  const expected = false;
  const actual = u.isFalse(true);
  expect(actual).toBe(expected);
});

// Tests for isFalsy
test('isFalsy should return true for falsy values', () => {
  const expected = true;
  const actual1 = u.isFalsy(0);
  const actual2 = u.isFalsy('');
  expect(actual1).toBe(expected);
  expect(actual2).toBe(expected);
});

test('isFalsy should return false for truthy values', () => {
  const expected = false;
  const actual1 = u.isFalsy(1);
  const actual2 = u.isFalsy('test');
  expect(actual1).toBe(expected);
  expect(actual2).toBe(expected);
});

// Tests for isObject
test('isObject should return true for objects', () => {
  const expected = true;
  const actual1 = u.isObject({});
  const actual2 = u.isObject([]);
  expect(actual1).toBe(expected);
  expect(actual2).toBe(expected);
});

test('isObject should return false for non-objects', () => {
  const expected = false;
  const actual1 = u.isObject(null);
  const actual2 = u.isObject(1);
  expect(actual1).toBe(expected);
  expect(actual2).toBe(expected);
});

// Tests for isEmptyObject
test('isEmptyObject should return true for empty objects', () => {
  const expected = true;
  const actual = u.isEmptyObject({});
  expect(actual).toBe(expected);
});

test('isEmptyObject should return false for non-empty objects', () => {
  const expected = false;
  const actual = u.isEmptyObject({ a: 1 });
  expect(actual).toBe(expected);
});

// Tests for isArray
test('isArray should return true for arrays', () => {
  const expected = true;
  const actual1 = u.isArray([]);
  const actual2 = u.isArray(new Array());
  expect(actual1).toBe(expected);
  expect(actual2).toBe(expected);
});

test('isArray should return false for non-arrays', () => {
  const expected = false;
  const actual = u.isArray(1);
  expect(actual).toBe(expected);
});

// Tests for isFunction
test('isFunction should return true for functions', () => {
  const expected = true;
  const actual1 = u.isFunction(() => {});
  const actual2 = u.isFunction(function() {});
  expect(actual1).toBe(expected);
  expect(actual2).toBe(expected);
});

test('isFunction should return false for non-functions', () => {
  const expected = false;
  const actual = u.isFunction(1);
  expect(actual).toBe(expected);
});
