
import '../dist/classical';
import { Lazy } from '../src/util';

describe('InstanceIs', () => {
    // Test the callable behavior first
    describe('callable behavior', () => {
        it('should work as a function checking instanceof', () => {
            class TestClass { }
            const instance = new TestClass();
            const nonInstance = {};

            // Runtime checks
            expect(instanceIs(instance, TestClass)).toBe(true);
            expect(instanceIs(nonInstance, TestClass)).toBe(false);

            // Type narrowing check
            if (instanceIs(instance, TestClass)) {
                const test: TestClass = instance; // Should compile
                // @ts-expect-error - instance should not be string
                const fail: string = instance;
            }
        });

        it('should handle primitive constructors', () => {
            const str = "test";
            const num = 42;

            // Runtime checks
            expect(instanceIs(str, String)).toBe(true);
            expect(instanceIs(num, String)).toBe(false);

            if (instanceIs(str, String)) {
                // Type narrowing check
                const length: number = str.length; // Should compile
                // @ts-expect-error - str should not be number
                const fail: number = str;
            }
        });

        it('should handle String constructor correctly', () => {
            const strObj: any = new String("test");
            const strConstructor: Constructor<String> = String;

            // Both of these should work the same
            if (instanceIs(strObj, String)) {
                const test: String = strObj;  // Should compile
            }

            if (instanceIs(strObj, strConstructor)) {
                const test: String = strObj;  // Should compile
            }
        });
    });

    describe('type guards', () => {
        describe('string', () => {
            it('should correctly identify and narrow strings', () => {
                const validStr: unknown = "test";
                const invalidStr: unknown = 42;

                // Runtime checks
                expect(instanceIs.string(validStr)).toBe(true);
                expect(instanceIs.string(invalidStr)).toBe(false);

                if (instanceIs.string(validStr)) {
                    expect(validStr.length).toBe(4); // Runtime usage
                    const length: number = validStr.length; // Should compile
                    // @ts-expect-error - value should not be number
                    const fail: number = validStr;
                }
            });
        });

        describe('number', () => {
            it('should correctly identify and narrow numbers', () => {
                const validNum: unknown = 42;
                const invalidNum: unknown = "42";

                // Runtime checks
                expect(instanceIs.number(validNum)).toBe(true);
                expect(instanceIs.number(invalidNum)).toBe(false);

                if (instanceIs.number(validNum)) {
                    expect(validNum.toFixed(2)).toBe("42.00"); // Runtime usage
                    const result: number = validNum; // Should compile
                    // @ts-expect-error - value should not be string
                    const fail: string = validNum;
                }
            });
        });

        describe('array', () => {
            it('should correctly identify and narrow arrays with type parameters', () => {
                const numArray: unknown = [1, 2, 3];
                const notArray: unknown = { length: 3 };

                // Runtime checks
                expect(instanceIs.array(numArray)).toBe(true);
                expect(instanceIs.array(notArray)).toBe(false);
                if (instanceIs.array<number>(numArray)) {
                    expect(numArray[0]).toBe(1); // Runtime usage
                    const first: number = numArray[0]; // Should compile
                    // @ts-expect-error - elements should not be string
                    const fail: string = numArray[0];
                }
            });
        });

        describe('emptyArray', () => {
            it('should correctly identify and narrow empty arrays', () => {
                const empty: unknown = [];
                const nonEmpty: unknown = [1, 2, 3];

                // Runtime checks
                expect(instanceIs.emptyArray(empty)).toBe(true);
                expect(instanceIs.emptyArray(nonEmpty)).toBe(false);

                if (instanceIs.emptyArray<number>(empty)) {
                    expect(empty.length).toBe(0); // Runtime usage
                    const test: number[] = empty; // Should compile
                    // @ts-expect-error - should not be string[]
                    const fail: string[] = empty;
                }
            });
        });

        describe('populatedArray', () => {
            it('should correctly identify and narrow populated arrays', () => {
                const populated: unknown = [1, 2, 3];
                const empty: unknown = [];

                // Runtime checks
                expect(instanceIs.populatedArray(populated)).toBe(true);
                expect(instanceIs.populatedArray(empty)).toBe(false);

                if (instanceIs.populatedArray<number>(populated)) {
                    expect(populated.length).toBeGreaterThan(0); // Runtime usage
                    const test: number[] = populated; // Should compile
                    // @ts-expect-error - should not be string[]
                    const fail: string[] = populated;
                }
            });
        });

        describe('object', () => {
            it('should correctly identify and narrow objects', () => {
                const obj: unknown = { prop: "test" };
                const nonObj: unknown = null;

                // Runtime checks
                expect(instanceIs.object(obj)).toBe(true);
                expect(instanceIs.object(nonObj)).toBe(false);

                if (instanceIs.object(obj)) {
                    const test: object = obj; // Should compile
                    // Runtime usage
                    expect(Object.keys(obj).length).toBeGreaterThan(0);
                    // @ts-expect-error - should not know about prop
                    const fail: string = obj.prop;
                }
            });
        });

        describe('specified', () => {
            it('should correctly identify and narrow non-null/undefined values', () => {
                const definedValue: string | null | undefined = "test";
                const nullValue: string | null | undefined = null;

                // Runtime checks
                expect(instanceIs.specified(definedValue)).toBe(true);
                expect(instanceIs.specified(nullValue)).toBe(false);

                if (instanceIs.specified(definedValue)) {
                    expect(definedValue.length).toBe(4); // Runtime usage
                    const test: string = definedValue; // Should compile
                    // @ts-expect-error - should not be null
                    const fail: null = definedValue;
                }
            });
        });

        describe('error throwing', () => {
            it('should handle orThrow options correctly', () => {
                // With custom message
                expect(() => {
                    instanceIs.string(42, { orThrow: 'Custom error' });
                }).toThrow('Custom error');

                // With default message
                expect(() => {
                    instanceIs.string(42, { orThrow: true });
                }).toThrow('The provided value is not a string.');

                // Without orThrow
                expect(() => {
                    expect(instanceIs.string(42)).toBe(false);
                }).not.toThrow();
            });
        });
    });
});

describe('Is Properties and Methods', () => {
    // Properties
    describe('undefined property', () => {
        it('returns false for defined values', () => {
            "string".is.undefined;
            expect("string".is.undefined).toBe(false);
            expect((42).is.undefined).toBe(false);
            expect(false.is.undefined).toBe(false);
        });
    });

    describe('string property', () => {
        it('returns true for strings', () => {
            expect("".is.string).toBe(true);
            expect("hello".is.string).toBe(true);
            expect(String("test").is.string).toBe(true);
        });

        it('returns false for non-strings', () => {
            expect((42).is.string).toBe(false);
            expect(true.is.string).toBe(false);
            expect([].is.string).toBe(false);
            expect(({}).is.string).toBe(false);
        });
    });

    describe('number property', () => {
        it('returns true for numbers', () => {
            expect((42).is.number).toBe(true);
            expect((0).is.number).toBe(true);
            expect((-1).is.number).toBe(true);
            expect((3.14).is.number).toBe(true);
            expect((NaN).is.number).toBe(true);
            expect(Number.POSITIVE_INFINITY.is.number).toBe(true);
        });

        it('returns false for non-numbers', () => {
            expect("42".is.number).toBe(false);
            expect(true.is.number).toBe(false);
            expect(BigInt(42).is.number).toBe(false);
        });
    });

    describe('boolean property', () => {
        it('returns true for booleans', () => {
            expect(true.is.boolean).toBe(true);
            expect(false.is.boolean).toBe(true);
            expect(Boolean(1).is.boolean).toBe(true);
        });

        it('returns false for non-booleans', () => {
            expect("true".is.boolean).toBe(false);
            expect((1).is.boolean).toBe(false);
            expect(([]).is.boolean).toBe(false);
        });
    });

    describe('bigint property', () => {
        it('returns true for bigints', () => {
            expect(BigInt(42).is.bigint).toBe(true);
            expect(BigInt(0).is.bigint).toBe(true);
            expect(BigInt(-1).is.bigint).toBe(true);
        });

        it('returns false for non-bigints', () => {
            expect((42).is.bigint).toBe(false);
            expect("42".is.bigint).toBe(false);
            expect(true.is.bigint).toBe(false);
        });
    });

    describe('symbol property', () => {
        it('returns true for symbols', () => {
            expect(Symbol().is.symbol).toBe(true);
            expect(Symbol('test').is.symbol).toBe(true);
            expect(Symbol.for('test').is.symbol).toBe(true);
        });

        it('returns false for non-symbols', () => {
            expect("symbol".is.symbol).toBe(false);
            expect((42).is.symbol).toBe(false);
            expect(({}).is.symbol).toBe(false);
        });
    });

    describe('object property', () => {
        it('returns true for objects', () => {
            expect(({}).is.object).toBe(true);
            expect(([]).is.object).toBe(true);
            expect(new Date().is.object).toBe(true);
            expect(new Map().is.object).toBe(true);
        });

        it('returns false for non-objects', () => {
            expect("string".is.object).toBe(false);
            expect((42).is.object).toBe(false);
            expect(true.is.object).toBe(false);
        });
    });

    describe('function property', () => {
        it('returns true for functions', () => {
            expect((() => { }).is.function).toBe(true);
            expect((function () { }).is.function).toBe(true);
            expect((async () => { }).is.function).toBe(true);
            expect((class { }).is.function).toBe(true);
        });

        it('returns false for non-functions', () => {
            expect("function".is.function).toBe(false);
            expect(({}).is.function).toBe(false);
            expect([].is.function).toBe(false);
        });
    });

    describe('type property', () => {
        it('returns true for constructor functions', () => {
            class Test { }
            expect(Test.is.type).toBe(true);
            expect(String.is.type).toBe(true);
            expect(Number.is.type).toBe(true);
            expect(Boolean.is.type).toBe(true);
        });

        it('returns false for non-constructor functions', () => {
            expect((() => { }).is.type).toBe(false);
            expect(({}).is.type).toBe(false);
            expect("class".is.type).toBe(false);
        });
    });

    describe('emptyObject property', () => {
        it('returns true for empty objects', () => {
            ({}).is.emptyObject
            expect(({}).is.emptyObject).toBe(true);
        });

        it('returns false for non-empty objects or non-objects', () => {
            expect(({ prop: 'value' }).is.emptyObject).toBe(false);
            expect([].is.emptyObject).toBe(false);
            expect("".is.emptyObject).toBe(false);
        });
    });

    describe('plainObject property', () => {
        it('returns true for plain objects', () => {
            instanceIs.plainObject(Object.create(null))
            expect(instanceIs.plainObject(Object.create(null))).toBe(true);
        });

        it('fails with is property because is property does not exist', () => {
            expect(() => Object.create(null).is.plainObject).toThrow();
        });

        it('returns false for non-empty objects or non-objects', () => {
            expect(({}).is.plainObject).toBe(false);
            expect(({ prop: 'value' }).is.emptyObject).toBe(false);
            expect([].is.emptyObject).toBe(false);
            expect("".is.emptyObject).toBe(false);
        });
    });

    describe('populatedObject property', () => {
        it('returns true for populated objects', () => {
            expect(({ prop: 'value' }).is.populatedObject).toBe(true);
            expect(new Date().is.populatedObject).toBe(true);
        });

        it('returns false for empty objects or non-objects', () => {
            expect(({}).is.populatedObject).toBe(false);
        });
    });

    describe('array property', () => {
        it('returns true for arrays', () => {
            expect([].is.array).toBe(true);
            expect([1, 2, 3].is.array).toBe(true);
            expect(new Array().is.array).toBe(true);
        });

        it('returns false for non-arrays', () => {
            expect(({}).is.array).toBe(false);
            expect("[]".is.array).toBe(false);
        });
    });

    describe('emptyArray property', () => {
        it('returns true for empty arrays', () => {
            expect([].is.emptyArray).toBe(true);
            expect(new Array().is.emptyArray).toBe(true);
        });

        it('returns false for non-empty arrays or non-arrays', () => {
            expect([1].is.emptyArray).toBe(false);
            expect(({}).is.emptyArray).toBe(false);
        });
    });

    describe('populatedArray property', () => {
        it('returns true for populated arrays', () => {
            expect([1].is.populatedArray).toBe(true);
            expect(['test'].is.populatedArray).toBe(true);
            expect([{}].is.populatedArray).toBe(true);
        });

        it('returns false for empty arrays or non-arrays', () => {
            expect([].is.populatedArray).toBe(false);
            expect(({}).is.populatedArray).toBe(false);
        });
    });

    describe('specified property', () => {
        it('returns true for specified values', () => {
            expect("".is.specified).toBe(true);
            expect((0).is.specified).toBe(true);
            expect(false.is.specified).toBe(true);
            expect(({}).is.specified).toBe(true);
        });

        it('returns true for instance properties', () => {
            const obj: any = { prop: "value" };
            expect(obj.prop.is.specified).toBe(true);
        });
    });

    describe('positiveInfinity property', () => {
        it('returns true for positive infinity', () => {
            expect(Number.POSITIVE_INFINITY.is.positiveInfinity).toBe(true);
            expect((1 / 0).is.positiveInfinity).toBe(true);
        });

        it('returns false for other values', () => {
            expect(Number.NEGATIVE_INFINITY.is.positiveInfinity).toBe(false);
            expect((42).is.positiveInfinity).toBe(false);
            expect(NaN.is.positiveInfinity).toBe(false);
        });
    });

    describe('negativeInfinity property', () => {
        it('returns true for negative infinity', () => {
            expect(Number.NEGATIVE_INFINITY.is.negativeInfinity).toBe(true);
            expect((-1 / 0).is.negativeInfinity).toBe(true);
        });

        it('returns false for other values', () => {
            expect(Number.POSITIVE_INFINITY.is.negativeInfinity).toBe(false);
            expect((-42).is.negativeInfinity).toBe(false);
            expect(NaN.is.negativeInfinity).toBe(false);
        });
    });

    describe('nan property', () => {
        it('returns true for NaN', () => {
            expect(NaN.is.nan).toBe(true);
            expect((0 / 0).is.nan).toBe(true);
            expect(Number('not a number').is.nan).toBe(true);
        });

        it('returns false for non-NaN values', () => {
            expect((42).is.nan).toBe(false);
            expect(Number.POSITIVE_INFINITY.is.nan).toBe(false);
            expect("NaN".is.nan).toBe(false);
        });
    });

    describe('notNan property', () => {
        it('returns true for non-NaN numbers', () => {
            expect((42).is.notNan).toBe(true);
            expect((0).is.notNan).toBe(true);
            expect(Number.POSITIVE_INFINITY.is.notNan).toBe(true);
        });

        it('returns false for NaN or non-numbers', () => {
            expect(NaN.is.notNan).toBe(false);
            expect("number".is.notNan).toBe(false);
        });
    });

    // Methods
    describe('equal method', () => {
        it('correctly compares equal values', () => {
            expect("test".is.equal("test")).toBe(true);
            expect((42).is.equal(42)).toBe(true);
            expect(true.is.equal(true)).toBe(true);
            const obj = {};
            expect(obj.is.equal(obj)).toBe(true);
        });

        it('correctly identifies non-equal values', () => {
            expect("test".is.equal("other")).toBe(false);
            expect((42).is.equal(43)).toBe(false);
            expect(({}).is.equal({})).toBe(false);
            expect([].is.equal([])).toBe(false);
        });
    });

    describe('parentOf method', () => {
        class Parent { }
        class Child extends Parent { }
        class Other { }
        class StringArray extends Array<string> { }

        it('correctly identifies parent types', () => {
            expect(Parent.is.parentOf(Child)).toBe(true);
            expect(Array.is.parentOf(StringArray)).toBe(true);
        });

        it('correctly identifies non-parent types', () => {
            expect(Child.is.parentOf(Parent)).toBe(false);
            expect(Other.is.parentOf(Child)).toBe(false);
            expect(({}).is.parentOf(Parent)).toBe(false);
        });
    });

    describe('childOf method', () => {
        class Parent { }
        class Child extends Parent { }
        class Other { }

        it('correctly identifies child types', () => {
            Array.is.childOf(Object)
            expect(Child.is.childOf(Parent)).toBe(true);
            expect(Array.is.childOf(Object)).toBe(true);
        });

        it('correctly identifies non-child types', () => {
            expect(Parent.is.childOf(Child)).toBe(false);
            expect(Other.is.childOf(Parent)).toBe(false);
            expect(({}).is.childOf(Parent)).toBe(false);
        });
    });

    describe('instanceOf method', () => {
        class TestClass { }
        const instance = new TestClass();

        it('correctly identifies instances', () => {
            expect(instance.is.instanceOf(TestClass)).toBe(true);
            expect([].is.instanceOf(Array)).toBe(true);
            expect(({}).is.instanceOf(Object)).toBe(true);
        });

        it('correctly identifies non-instances', () => {
            expect(instance.is.instanceOf(Array)).toBe(false);
            expect("string".is.instanceOf(Number)).toBe(false);
            expect((42).is.instanceOf(String)).toBe(false);
        });
    });

    // Function behavior
    describe('function call behavior', () => {
        it('works as a function for type checking', () => {
            expect("string".is(String)).toBe(true);
            expect((42).is(Number)).toBe(true);
            expect(true.is(Boolean)).toBe(true);
            expect([].is(Array)).toBe(true);
            expect(({}).is(Object)).toBe(true);
        });

        it('returns false for incorrect types', () => {
            expect("string".is(Number)).toBe(false);
            expect((42).is(String)).toBe(false);
            expect(true.is(Array)).toBe(false);
            expect([].is(String)).toBe(false);
        });

        it('works with inheritance', () => {
            class Parent { }
            class Child extends Parent { }
            const child = new Child();

            expect(child.is(Child)).toBe(true);
            expect(child.is(Parent)).toBe(true);
            expect(child.is(Object)).toBe(true);
        });

        it('works with built-in inheritance', () => {
            const arr: any[] = [];
            expect(arr.is(Array)).toBe(true);
            expect(arr.is(Object)).toBe(true);
        });
    });

    // Edge cases and special scenarios
    describe('edge cases', () => {
        it('handles NaN correctly', () => {
            expect(NaN.is.number).toBe(true);
            expect(NaN.is.nan).toBe(true);
            expect(NaN.is.notNan).toBe(false);
        });

        it('handles zero correctly', () => {
            expect((0).is.number).toBe(true);
            expect((0).is.specified).toBe(true);
            expect((0).is.notNan).toBe(true);
        });

        it('handles empty string correctly', () => {
            expect("".is.string).toBe(true);
            expect("".is.specified).toBe(true);
            expect("".is.emptyArray).toBe(false);
        });

        it('handles false correctly', () => {
            expect(false.is.boolean).toBe(true);
            expect(false.is.specified).toBe(true);
            expect(false.is.undefined).toBe(false);
        });

        it('handles all primitive types and their wrappers correctly', () => {
            // Regular primitives
            expect("test".is.string).toBe(true);
            expect((42).is.number).toBe(true);
            expect(true.is.boolean).toBe(true);
            expect(Symbol('test').is.symbol).toBe(true);
        
            // Wrapped primitives
            expect(new String("test").is.string).toBe(true);
            expect(new Number(42).is.number).toBe(true);
            expect(new Boolean(true).is.boolean).toBe(true);
            
            // Object wrappers of non-constructable primitives
            expect(Object(Symbol('test')).is.symbol).toBe(true);
        });

        it('handles symbol registration correctly', () => {
            const sym1 = Symbol('test');
            const sym2 = Symbol('test');
            const sym3 = Symbol.for('test');
            const sym4 = Symbol.for('test');

            expect(sym1.is.equal(sym2)).toBe(false); // Different symbols
            expect(sym3.is.equal(sym4)).toBe(true);  // Same registered symbol
        });

        it('handles promise-like objects correctly', () => {
            const promise = Promise.resolve();
            expect(promise.is.instanceOf(Promise)).toBe(true);
            expect(promise.is.object).toBe(true);
            expect(({ then: () => { } }).is.instanceOf(Promise)).toBe(false);
        });

        it('handles array-like objects correctly', () => {
            const arrayLike = { length: 0 };
            expect(arrayLike.is.array).toBe(false);
            expect(arrayLike.is.object).toBe(true);
        });
    });

    // Multiple checks combinations
    describe('combined checks', () => {
        it('can combine multiple checks meaningfully', () => {
            const arr = [1, 2, 3];
            expect(arr.is.array && arr.is.populatedArray).toBe(true);
            expect(arr.is.array && arr.is.emptyArray).toBe(false);
        });

        it('can check type and properties together', () => {
            const str = "test";
            expect(str.is.string && str.is.specified).toBe(true);
            expect(str.is(String) && str.is.specified).toBe(true);
        });

        it('handles complex type hierarchies', () => {
            class A { }
            class B extends A { }
            class C extends B { }
            const c = new C();

            expect(c.is.instanceOf(C) && c.is.instanceOf(B) && c.is.instanceOf(A)).toBe(true);
            expect(C.is.childOf(B) && B.is.childOf(A)).toBe(true);
            expect(A.is.parentOf(B) && B.is.parentOf(C)).toBe(true);
        });
    });
});

describe('MustBe', () => {
    describe('primitive type assertions', () => {
        it('validates strings', () => {
            expect(() => mustBe.string("test")).not.toThrow();
            expect(() => mustBe.string(42)).toThrow();
            expect(() => mustBe.string(new String("test"))).not.toThrow();
        });

        it('validates numbers', () => {
            expect(() => mustBe.number(42)).not.toThrow();
            expect(() => mustBe.number("42")).toThrow();
            expect(() => mustBe.number(new Number(42))).not.toThrow();
        });

        it('validates booleans', () => {
            expect(() => mustBe.boolean(true)).not.toThrow();
            expect(() => mustBe.boolean(false)).not.toThrow();
            expect(() => mustBe.boolean("true")).toThrow();
            expect(() => mustBe.boolean(new Boolean(true))).not.toThrow();
        });

        it('validates true/false specifically', () => {
            expect(() => mustBe.true(true)).not.toThrow();
            expect(() => mustBe.true(false)).toThrow();
            expect(() => mustBe.false(false)).not.toThrow();
            expect(() => mustBe.false(true)).toThrow();
        });

        it('validates bigints', () => {
            expect(() => mustBe.bigint(BigInt(42))).not.toThrow();
            expect(() => mustBe.bigint(42)).toThrow();
        });

        it('validates symbols', () => {
            expect(() => mustBe.symbol(Symbol())).not.toThrow();
            expect(() => mustBe.symbol("symbol")).toThrow();
        });
    });

    describe('object assertions', () => {
        it('validates objects', () => {
            expect(() => mustBe.object({})).not.toThrow();
            expect(() => mustBe.object(null)).toThrow();
            expect(() => mustBe.object(42)).toThrow();
        });

        it('validates empty objects', () => {
            expect(() => mustBe.emptyObject({})).not.toThrow();
            expect(() => mustBe.emptyObject({ prop: "value" })).toThrow();
        });

        it('validates populated objects', () => {
            expect(() => mustBe.populatedObject({ prop: "value" })).not.toThrow();
            expect(() => mustBe.populatedObject({})).toThrow();
        });
    });

    describe('array assertions', () => {
        it('validates arrays', () => {
            expect(() => mustBe.array([])).not.toThrow();
            expect(() => mustBe.array({})).toThrow();
        });

        it('validates empty arrays', () => {
            expect(() => mustBe.emptyArray([])).not.toThrow();
            expect(() => mustBe.emptyArray([1, 2, 3])).toThrow();
        });

        it('validates populated arrays', () => {
            expect(() => mustBe.populatedArray([1, 2, 3])).not.toThrow();
            expect(() => mustBe.populatedArray([])).toThrow();
        });
    });

    describe('function and type assertions', () => {
        it('validates functions', () => {
            expect(() => mustBe.function(() => {})).not.toThrow();
            expect(() => mustBe.function({})).toThrow();
        });

        it('validates types', () => {
            class TestClass {}
            expect(() => mustBe.type(TestClass)).not.toThrow();
            expect(() => mustBe.type(() => {})).toThrow();
        });

        it('validates inheritance relationships', () => {
            class Parent {}
            class Child extends Parent {}
            class Other {}

            expect(() => mustBe.parentType(Child, Parent)).not.toThrow();
            expect(() => mustBe.childType(Parent, Child)).not.toThrow();
            expect(() => mustBe.parentType(Child, Other)).toThrow();
        });

        it('validates instanceof relationships', () => {
            class TestClass {}
            const instance = new TestClass();
            expect(() => mustBe.instanceOf(instance, TestClass)).not.toThrow();
            expect(() => mustBe.instanceOf({}, TestClass)).toThrow();
        });
    });

    describe('null/undefined assertions', () => {
        it('validates undefined', () => {
            let undef;
            expect(() => mustBe.undefined(undef)).not.toThrow();
            expect(() => mustBe.undefined(null)).toThrow();
        });

        it('validates null', () => {
            expect(() => mustBe.null(null)).not.toThrow();
            expect(() => mustBe.null(undefined)).toThrow();
        });
    });

    describe('special number assertions', () => {
        it('validates infinite numbers', () => {
            expect(() => mustBe.infinite(Infinity)).not.toThrow();
            expect(() => mustBe.infinite(-Infinity)).not.toThrow();
            expect(() => mustBe.infinite(42)).toThrow();
        });

        it('validates finite numbers', () => {
            expect(() => mustBe.finite(42)).not.toThrow();
            expect(() => mustBe.finite(Infinity)).toThrow();
            expect(() => mustBe.finite(NaN)).toThrow();
        });

        it('validates NaN', () => {
            expect(() => mustBe.nan(NaN)).not.toThrow();
            expect(() => mustBe.nan(42)).toThrow();
        });

        it('validates not NaN', () => {
            expect(() => mustBe.notNan(42)).not.toThrow();
            expect(() => mustBe.notNan(NaN)).toThrow();
        });

        it('validates positive infinity', () => {
            expect(() => mustBe.positiveInfinity(Infinity)).not.toThrow();
            expect(() => mustBe.positiveInfinity(-Infinity)).toThrow();
            expect(() => mustBe.positiveInfinity(42)).toThrow();
        });

        it('validates negative infinity', () => {
            expect(() => mustBe.negativeInfinity(-Infinity)).not.toThrow();
            expect(() => mustBe.negativeInfinity(Infinity)).toThrow();
            expect(() => mustBe.negativeInfinity(-42)).toThrow();
        });
    });

    describe('specified/defined assertions', () => {
        it('validates specified values', () => {
            expect(() => mustBe.specified("value")).not.toThrow();
            expect(() => mustBe.specified(null)).toThrow();
            expect(() => mustBe.specified(undefined)).toThrow();
        });

        it('validates unspecified values', () => {
            expect(() => mustBe.unspecified(null)).not.toThrow();
            expect(() => mustBe.unspecified(undefined)).not.toThrow();
            expect(() => mustBe.unspecified("value")).toThrow();
        });

        it('validates defined values', () => {
            expect(() => mustBe.defined("value")).not.toThrow();
            expect(() => mustBe.defined(null)).toThrow();
            expect(() => mustBe.defined(undefined)).toThrow();
        });

        it('validates not defined values', () => {
            expect(() => mustBe.notDefined(null)).not.toThrow();
            expect(() => mustBe.notDefined(undefined)).not.toThrow();
            expect(() => mustBe.notDefined("value")).toThrow();
        });
    });

    describe('utility assertions', () => {
        it('throws for not implemented', () => {
            expect(() => mustBe.notImplemented()).toThrow("The property methopd has not been implemented yet");
        });

        it('throws for static class', () => {
            expect(() => mustBe.staticClass()).toThrow("A static class cannot be instantiated");
        });
    });

    describe('custom error messages', () => {
        it('uses custom error messages when provided', () => {
            const customMessage = "Custom error message";
            expect(() => mustBe.string(42, customMessage)).toThrow(customMessage);
            expect(() => mustBe.number("42", customMessage)).toThrow(customMessage);
            expect(() => mustBe.boolean(42, customMessage)).toThrow(customMessage);
        });
    });
});

describe('Lazy', () => {
    it('initializes value on first access', () => {
        const initSpy = jest.fn(() => 42);
        const lazy = new Lazy(initSpy);
        
        expect(initSpy).not.toHaveBeenCalled();
        
        const value = lazy.value;
        expect(initSpy).toHaveBeenCalledTimes(1);
        expect(value).toBe(42);
    });

    it('caches initialized value', () => {
        const initSpy = jest.fn(() => 42);
        const lazy = new Lazy(initSpy);
        
        lazy.value;
        lazy.value;
        lazy.value;
        
        expect(initSpy).toHaveBeenCalledTimes(1);
    });

    it('maintains separate values for different instances', () => {
        const lazy1 = new Lazy(() => 42);
        const lazy2 = new Lazy(() => 84);
        
        expect(lazy1.value).toBe(42);
        expect(lazy2.value).toBe(84);
    });

    it('handles complex initializers', () => {
        const lazy = new Lazy(() => {
            const obj = { count: 0 };
            obj.count += 1;
            return obj;
        });
        
        const value1 = lazy.value;
        const value2 = lazy.value;
        
        expect(value1).toBe(value2);
        expect(value1.count).toBe(1);
    });
});