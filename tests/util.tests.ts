import '../src/classical';
import { u } from '../src/util';

describe('AssertCondition', () => {
    describe('truthy', () => {
        test('should not throw for truthy values', () => {
            expect(() => assert.truthy(true)).not.toThrow();
            expect(() => assert.truthy(1)).not.toThrow();
            expect(() => assert.truthy("hello")).not.toThrow();
            expect(() => assert.truthy([])).not.toThrow();
        });

        test('should throw for falsy values', () => {
            expect(() => assert.truthy(false)).toThrow(`The value "false" is not truthy.`);
            expect(() => assert.truthy(0)).toThrow(`The value "0" is not truthy.`);
            expect(() => assert.truthy("")).toThrow(`The value "" is not truthy.`);
            expect(() => assert.truthy(null)).toThrow(`The value "null" is not truthy.`);
            expect(() => assert.truthy(undefined)).toThrow(`The value "undefined" is not truthy.`);
        });

        test('should allow a custom message', () => {
            expect(() => assert.truthy(null, "Custom error")).toThrow("Custom error");
        });
    });

    describe('falsy', () => {
        test('should not throw for falsy values', () => {
            expect(() => assert.falsy(false)).not.toThrow();
            expect(() => assert.falsy(0)).not.toThrow();
            expect(() => assert.falsy("")).not.toThrow();
            expect(() => assert.falsy(null)).not.toThrow();
            expect(() => assert.falsy(undefined)).not.toThrow();
        });

        test('should throw for truthy values', () => {
            expect(() => assert.falsy(true)).toThrow(`The value "true" is not falsy.`);
            expect(() => assert.falsy(1)).toThrow(`The value "1" is not falsy.`);
            expect(() => assert.falsy("non-empty")).toThrow(`The value "non-empty" is not falsy.`);
        });

        test('should allow a custom message', () => {
            expect(() => assert.falsy(true, "Custom error")).toThrow("Custom error");
        });
    });

    describe('string', () => {
        test('should not throw for string values', () => {
            expect(() => assert.string("hello")).not.toThrow();
            expect(() => assert.string("")).not.toThrow();
        });

        test('should throw for non-string values', () => {
            expect(() => assert.string(42)).toThrow();
            expect(() => assert.string(null)).toThrow();
            expect(() => assert.string(undefined)).toThrow();
        });

        test('should allow a custom message', () => {
            try {
                assert.string(42, "Custom error");
            } catch (e: any) {
                expect(e.message.startsWith("Custom error: ")).toBe(true);
            }
        });
    });

    describe('emptyString', () => {
        test('should not throw for an empty string', () => {
            expect(() => assert.emptyString("")).not.toThrow();
        });

        test('should throw for non-empty strings', () => {
            expect(() => assert.emptyString("hello")).toThrow(`The value "hello" is not empty`);
        });

        test('should throw for non-string values', () => {
            expect(() => assert.emptyString(42)).toThrow();
        });

        test('should allow a custom message', () => {
            expect(() => assert.emptyString("not-empty", "Custom error")).toThrow("Custom error");
        });
    });

    describe('populatedString', () => {
        test('should not throw for populated strings', () => {
            expect(() => assert.populatedString("hello")).not.toThrow();
        });

        test('should throw for empty strings', () => {
            expect(() => assert.populatedString("")).toThrow();
        });

        test('should throw for non-string values', () => {
            expect(() => assert.populatedString(42)).toThrow();
        });

        test('should allow a custom message', () => {
            expect(() => assert.populatedString("", "Custom error")).toThrow("Custom error");
        });
    });

    describe('number', () => {
        test('should not throw for number values', () => {
            expect(() => assert.number(42)).not.toThrow();
            expect(() => assert.number(0)).not.toThrow();
        });

        test('should throw for non-number values', () => {
            expect(() => assert.number("42")).toThrow();
            expect(() => assert.number(null)).toThrow();
        });

        test('should allow a custom message', () => {
            expect(() => assert.number("not a number", "Custom error")).toThrow("Custom error");
        });
    });

    describe('boolean', () => {
        test('should not throw for boolean values', () => {
            expect(() => assert.boolean(true)).not.toThrow();
            expect(() => assert.boolean(false)).not.toThrow();
        });

        test('should throw for non-boolean values', () => {
            expect(() => assert.boolean(1)).toThrow();
            expect(() => assert.boolean("true")).toThrow();
        });
    });

    describe('true', () => {
        test('should not throw for true value', () => {
            expect(() => assert.true(true)).not.toThrow();
        });

        test('should throw for non-true values', () => {
            expect(() => assert.true(false)).toThrow();
            expect(() => assert.true(1)).toThrow();
        });
    });

    describe('false', () => {
        test('should not throw for false value', () => {
            expect(() => assert.false(false)).not.toThrow();
        });

        test('should throw for non-false values', () => {
            expect(() => assert.false(true)).toThrow();
            expect(() => assert.false(0)).toThrow();
        });
    });

    describe('assert callable behavior', () => {
        test('should validate value against a constructor', () => {
            expect(() => assert("test", [String])).not.toThrow();
            expect(() => assert(123, Number)).not.toThrow();
        });

        test('should throw when value does not match constructor', () => {
            expect(() => assert("test", [Number])).toThrow();
            expect(() => assert(123, String)).toThrow();
        });

        test('should allow multiple constructors (logical OR)', () => {
            expect(() => assert("test", [String, Number])).not.toThrow();
            expect(() => assert(123, [String, Number])).not.toThrow();
            expect(() => assert(true, [String, Number])).toThrow();
        });

        test('should allow null and undefined explicitly', () => {
            expect(() => assert(null, null)).not.toThrow();
            expect(() => assert(undefined, undefined)).not.toThrow();
            expect(() => assert(undefined, null)).toThrow();
        });
    });

    describe('defined', () => {
        test('should not throw for defined values', () => {
            expect(() => assert.defined("string")).not.toThrow();
            expect(() => assert.defined(123)).not.toThrow();
            expect(() => assert.defined({})).not.toThrow();
        });

        test('should throw for undefined or null', () => {
            expect(() => assert.defined(null)).toThrow();
            expect(() => assert.defined(undefined)).toThrow();
        });
    });

    describe('notDefined', () => {
        test('should not throw for undefined or null', () => {
            expect(() => assert.notDefined(undefined)).not.toThrow();
            expect(() => assert.notDefined(null)).not.toThrow();
        });

        test('should throw for defined values', () => {
            expect(() => assert.notDefined("string")).toThrow();
            expect(() => assert.notDefined(123)).toThrow();
            expect(() => assert.notDefined({})).toThrow();
        });
    });

    describe('equal', () => {
        test('should not throw when values are equal', () => {
            expect(() => assert.equal(42, 42)).not.toThrow();
            expect(() => assert.equal("test", "test")).not.toThrow();
        });

        test('should throw when values are not equal', () => {
            expect(() => assert.equal(42, 43)).toThrow();
            expect(() => assert.equal("test", "other")).toThrow();
        });

        test('should handle object equality', () => {
            const obj = { a: 1 };
            expect(() => assert.equal(obj, obj)).not.toThrow();
            expect(() => assert.equal({ a: 1 }, { a: 1 })).toThrow(); // Different references
        });
    });

    describe('invalid', () => {
        test('should always throw with default message', () => {
            expect(() => assert.invalid()).toThrow('The system is in an invalid state.');
        });

        test('should allow a custom message', () => {
            expect(() => assert.invalid('Custom invalid state')).toThrow('Custom invalid state');
        });
    });

    describe('unexpected', () => {
        test('should always throw with default message', () => {
            expect(() => assert.unexpected()).toThrow('The system is in an unexpected state.');
        });

        test('should allow a custom message', () => {
            expect(() => assert.unexpected('Custom unexpected state')).toThrow(
                'Custom unexpected state'
            );
        });
    });

    describe('staticClass', () => {
        test('should always throw with default message', () => {
            expect(() => assert.staticClass()).toThrow('Static classes cannot be instantiated.');
        });

        test('should allow a custom message', () => {
            expect(() => assert.staticClass('Custom message')).toThrow('Custom message');
        });
    });

    describe('notImplemented', () => {
        test('should always throw with default message', () => {
            expect(() => assert.notImplemented()).toThrow('The method is not implemented.');
        });

        test('should allow a custom message', () => {
            expect(() => assert.notImplemented('Custom not implemented')).toThrow(
                'Custom not implemented'
            );
        });
    });
});

describe('Utilities', () => {
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

  test('isEmptyObject should return true for empty objects', () => {
    const expected = true;
    const actual = is.emptyObject({});
    expect(actual).toBe(expected);
  });

  test('isEmptyObject should return false for non-empty objects', () => {
    const expected = false;
    const actual = is.emptyObject({ a: 1 });
    expect(actual).toBe(expected);
  });

  test('isArray should return true for arrays', () => {
    const expected = true;
    const actual1 = is.array([]);
    const actual2 = is.array(new Array());
    expect(actual1).toBe(expected);
    expect(actual2).toBe(expected);
  });

  test('isArray should return false for non-arrays', () => {
    const expected = false;
    const actual = is.array(1);
    expect(actual).toBe(expected);
  });

  test('isFunction should return true for functions', () => {
    const expected = true;
    const actual1 = is.function(() => {});
    const actual2 = is.function(function() {});
    expect(actual1).toBe(expected);
    expect(actual2).toBe(expected);
  });

  test('isFunction should return false for non-functions', () => {
    const expected = false;
    const actual = is.function(1);
    expect(actual).toBe(expected);
  })
});

describe('Ensure', () => {
    describe('truthy', () => {
        test('should return the value for truthy inputs', () => {
            expect(ensure.truthy(true)).toBe(true);
            expect(ensure.truthy(1)).toBe(1);
            expect(ensure.truthy('hello')).toBe('hello');
            expect(ensure.truthy([])).toEqual([]);
        });

        test('should throw for falsy values', () => {
            expect(() => ensure.truthy(false)).toThrow(`The value "false" is not truthy`);
            expect(() => ensure.truthy(0)).toThrow(`The value "0" is not truthy`);
            expect(() => ensure.truthy('')).toThrow(`The value "" is not truthy`);
            expect(() => ensure.truthy(null)).toThrow(`The value "null" is not truthy`);
            expect(() => ensure.truthy(undefined)).toThrow(`The value "undefined" is not truthy`);
        });
    });

    describe('falsy', () => {
        test('should return the value for falsy inputs', () => {
            expect(ensure.falsy(false)).toBe(false);
            expect(ensure.falsy(0)).toBe(0);
            expect(ensure.falsy('')).toBe('');
            expect(ensure.falsy(null)).toBe(null);
            expect(ensure.falsy(undefined)).toBe(undefined);
        });

        test('should throw for truthy values', () => {
            expect(() => ensure.falsy(true)).toThrow(`The value "true" is not falsy`);
            expect(() => ensure.falsy(1)).toThrow(`The value "1" is not falsy`);
            expect(() => ensure.falsy('text')).toThrow(`The value "text" is not falsy`);
        });
    });

    describe('string', () => {
        test('should return the value for strings', () => {
            expect(ensure.string('hello')).toBe('hello');
            expect(ensure.string('')).toBe('');
        });

        test('should throw for non-string values', () => {
            expect(() => ensure.string(42)).toThrow();
            expect(() => ensure.string(null)).toThrow();
        });
    });

    describe('emptyString', () => {
        test('should return the value for an empty string', () => {
            expect(ensure.emptyString('')).toBe('');
        });

        test('should throw for non-empty strings and non-string values', () => {
            expect(() => ensure.emptyString('hello')).toThrow(`The value "hello" is not empty`);
            expect(() => ensure.emptyString(42)).toThrow();
        });
    });

    describe('populatedString', () => {
        test('should return the value for populated strings', () => {
            expect(ensure.populatedString('hello')).toBe('hello');
        });

        test('should throw for empty strings and non-string values', () => {
            expect(() => ensure.populatedString('')).toThrow(`The value "" is en empty string`);
            expect(() => ensure.populatedString(42)).toThrow();
        });
    });

    describe('number', () => {
        test('should return the value for numbers', () => {
            expect(ensure.number(42)).toBe(42);
            expect(ensure.number(0)).toBe(0);
        });

        test('should throw for non-number values', () => {
            expect(() => ensure.number('42')).toThrow();
            expect(() => ensure.number(null)).toThrow();
        });
    });

    describe('boolean', () => {
        test('should return the value for booleans', () => {
            expect(ensure.boolean(true)).toBe(true);
            expect(ensure.boolean(false)).toBe(false);
        });

        test('should throw for non-boolean values', () => {
            expect(() => ensure.boolean(1)).toThrow();
            expect(() => ensure.boolean('true')).toThrow();
        });
    });

    describe('defined', () => {
        test('should return the value for defined inputs', () => {
            expect(ensure.defined('text')).toBe('text');
            expect(ensure.defined(123)).toBe(123);
        });

        test('should throw for undefined and null', () => {
            expect(() => ensure.defined(undefined)).toThrow();
            expect(() => ensure.defined(null)).toThrow();
        });
    });

    describe('notDefined', () => {
        test('should return the value for undefined or null', () => {
            expect(ensure.notDefined(undefined)).toBe(undefined);
            expect(ensure.notDefined(null)).toBe(null);
        });

        test('should throw for defined values', () => {
            expect(() => ensure.notDefined('value')).toThrow();
            expect(() => ensure.notDefined(123)).toThrow();
        });
    });
});

