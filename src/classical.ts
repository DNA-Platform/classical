/// <reference path="./classical.d.ts" />
import { Type as GlobalType, environment as globalEnvironment } from "./reflection";
import { Dictionary as GlobalDictionary, Queryable as GlobalQueryable, ArrayEnumerator, Hash, foreach } from "./collections";
import { Is, Be, instanceIs, mustBe, Lazy as GlobalLazy } from "./util";
import { } from "./util";

var classicalInitialized: boolean | undefined;
if (!classicalInitialized) {
    var globalScope = globalThis as any;

    globalScope.Type = !globalScope.Type ? GlobalType : (() => { throw new Error("classical cannot be loaded because Type already exists"); })();
    globalScope.Environment = !globalScope.Environment ? globalEnvironment : (() => { throw new Error("classical cannot be loaded because Environment already exists"); })();
    globalScope.Dictionary = !globalScope.Dictionary ? GlobalDictionary : (() => { throw new Error("classical cannot be loaded because Dictionary already exists"); })();
    globalScope.Queryable = !globalScope.Queryable ? GlobalQueryable : (() => { throw new Error("classical cannot be loaded because Queryable already exists"); })();
    globalScope.Lazy = !globalScope.Lazy ? GlobalLazy : (() => { throw new Error("classical cannot be loaded because Lazy already exists"); })();
    globalScope.environment = !globalScope.environment ? globalEnvironment : (() => { throw new Error("classical cannot be loaded because environment already exists"); })();
    globalScope.instanceIs = !globalScope.instanceIs ? instanceIs : (() => { throw new Error("classical cannot be loaded because instanceIs already exists"); })();
    globalScope.mustBe = !globalScope.mustBe ? mustBe : (() => { throw new Error("classical cannot be loaded because mustBe already exists"); })();

    globalScope.typeOf = GlobalType.typeOf;
    globalScope.instanceOf = GlobalType.instanceOf;
    globalScope.defined = function(value: any, orThrow: any) { return instanceIs.defined(value, orThrow) };
    globalScope.notDefined = function(value: any, orThrow: any) { return instanceIs.notDefined(value, orThrow) };

    // For Object prototype
    Object.defineProperty(Object.prototype, 'type', {
        get: function () {
            return typeOf(this.constructor);
        },
        enumerable: false,
        configurable: true
    });

    // For Number primitive wrapper - using constructor for subclassing support
    Object.defineProperty(Number.prototype, 'type', {
        get: function () {
            return typeOf(this.constructor);
        },
        enumerable: false,
        configurable: true
    });

    // For String primitive wrapper - using constructor for subclassing support
    Object.defineProperty(String.prototype, 'type', {
        get: function () {
            return typeOf(this.constructor);
        },
        enumerable: false,
        configurable: true
    });

    // For Boolean primitive wrapper - using constructor for subclassing support
    Object.defineProperty(Boolean.prototype, 'type', {
        get: function () {
            return typeOf(this.constructor);
        },
        enumerable: false,
        configurable: true
    });

    // For Symbol primitive wrapper - using constructor for subclassing support
    Object.defineProperty(Symbol.prototype, 'type', {
        get: function () {
            return typeOf(this.constructor);
        },
        enumerable: false,
        configurable: true
    });

    // For BigInt primitive wrapper - using constructor for subclassing support
    Object.defineProperty(BigInt.prototype, 'type', {
        get: function () {
            return typeOf(this.constructor);
        },
        enumerable: false,
        configurable: true
    });

    // Define `hashCode` as a property that computes or retrieves a hash code
    Object.defineProperty(Object.prototype, 'hashCode', {
        get: function () {
            if (this._hashCode === undefined) {
                Object.defineProperty(this, '_hashCode', {
                    value: Hash.forNumber(Math.random()),
                    enumerable: false
                });
            }
            return this._hashCode;
        },
        enumerable: false,
        configurable: true
    });

    // For Number primitive wrapper
    Object.defineProperty(Number.prototype, 'hashCode', {
        get: function () {
            return Hash.forNumber(this.valueOf());
        },
        enumerable: false
    });

    // For String primitive wrapper
    Object.defineProperty(String.prototype, 'hashCode', {
        get: function () {
            return Hash.forString(this.valueOf());
        },
        enumerable: false
    });

    // For Boolean primitive wrapper
    Object.defineProperty(Boolean.prototype, 'hashCode', {
        get: function () {
            return Hash.forNumber(this.valueOf() ? 1 : 0);
        },
        enumerable: false
    });

    // For Symbol primitive wrapper
    Object.defineProperty(Symbol.prototype, 'hashCode', {
        get: function () {
            return Hash.forString(this.toString());
        },
        enumerable: false
    });

    // For BigInt primitive wrapper
    Object.defineProperty(BigInt.prototype, 'hashCode', {
        get: function () {
            return Hash.forString(this.toString());
        },
        enumerable: false
    });

    // Define `is` as a property on Object prototype
    Object.defineProperty(Object.prototype, 'is', {
        get: function () {
            if (this._is === undefined) {
                Object.defineProperty(this, '_is', {
                    value: new Is(this),
                    enumerable: false
                });
            }
            return this._is;
        },
        enumerable: false,
        configurable: true
    });

    // For Number primitive wrapper
    Object.defineProperty(Number.prototype, 'is', {
        get: function () {
            return new Is(this);
        },
        enumerable: false
    });

    // For String primitive wrapper
    Object.defineProperty(String.prototype, 'is', {
        get: function () {
            return new Is(this);
        },
        enumerable: false
    });

    // For Boolean primitive wrapper
    Object.defineProperty(Boolean.prototype, 'is', {
        get: function () {
            return new Is(this);
        },
        enumerable: false
    });

    // For Symbol primitive wrapper
    Object.defineProperty(Symbol.prototype, 'is', {
        get: function () {
            return new Is(this);
        },
        enumerable: false
    });

    // For BigInt primitive wrapper
    Object.defineProperty(BigInt.prototype, 'is', {
        get: function () {
            return new Is(this);
        },
        enumerable: false
    });

    // Define `mustbe` as a property on Object prototype
    Object.defineProperty(Object.prototype, 'must', {
        get: function () {
            if (this._mustbe === undefined) {
                Object.defineProperty(this, '_must', {
                    value: { be: new Be<Object>(this) },
                    enumerable: false
                });
            }
            return this._mustbe;
        },
        enumerable: false,
        configurable: true
    });

    // For Number primitive wrapper
    Object.defineProperty(Number.prototype, 'must', {
        get: function () {
            return { be: new Be<Number>(this) };
        },
        enumerable: false,
        configurable: true
    });

    // For String primitive wrapper
    Object.defineProperty(String.prototype, 'must', {
        get: function () {
            return { be: new Be<String>(this) };
        },
        enumerable: false,
        configurable: true
    });

    // For Boolean primitive wrapper
    Object.defineProperty(Boolean.prototype, 'must', {
        get: function () {
            return { be: new Be<Boolean>(this) };
        },
        enumerable: false,
        configurable: true
    });

    // For Symbol primitive wrapper
    Object.defineProperty(Symbol.prototype, 'must', {
        get: function () {
            return { be: new Be<Symbol>(this) };
        },
        enumerable: false,
        configurable: true
    });

    // For BigInt primitive wrapper
    Object.defineProperty(BigInt.prototype, 'must', {
        get: function () {
            return { be: new Be<BigInt>(this) };
        },
        enumerable: false,
        configurable: true
    });

    // For Object prototype
    const orThrow = { orThrow: true };
    Object.defineProperty(Object.prototype, 'mustbe', {
        value: function <T>(type: Constructor<T>): asserts this is T {
            instanceIs(this, type, orThrow);
        },
        enumerable: false,
        configurable: true
    });

    // For Number prototype
    Object.defineProperty(Number.prototype, 'mustbe', {
        value: function <T>(type: Constructor<T>): asserts this is T {
            instanceIs(this, type, orThrow);
        },
        enumerable: false,
        configurable: true
    });

    // For String prototype
    Object.defineProperty(String.prototype, 'mustbe', {
        value: function <T>(type: Constructor<T>): asserts this is T {
            instanceIs(this, type, orThrow);
        },
        enumerable: false,
        configurable: true
    });

    // For Boolean prototype
    Object.defineProperty(Boolean.prototype, 'mustbe', {
        value: function <T>(type: Constructor<T>): asserts this is T {
            instanceIs(this, type, orThrow);
        },
        enumerable: false,
        configurable: true
    });

    // For Symbol prototype
    Object.defineProperty(Symbol.prototype, 'mustbe', {
        value: function <T>(type: Constructor<T>): asserts this is T {
            instanceIs(this, type, orThrow);
        },
        enumerable: false,
        configurable: true
    });

    // For BigInt prototype
    Object.defineProperty(BigInt.prototype, 'mustbe', {
        value: function <T>(type: Constructor<T>): asserts this is T {
            instanceIs(this, type, orThrow);
        },
        enumerable: false,
        configurable: true
    });

    // Adds the item to the end of the array. The array is returned for chaining.
    Object.defineProperty(Array.prototype, 'add', {
        value: function (item: any) {
            this.push(item);
            return this;
        },
        enumerable: false,
        configurable: true,
    });

    // Adds the items to the end of the array. The array is returned for chaining.
    Object.defineProperty(Array.prototype, 'addRange', {
        value: function (items: IEnumerable<any>) {
            mustBe(items);
            mustBe.array(items, "The items are null or undefined.");
            items.foreach(item => this.add(item));
            return this;
        },
        enumerable: false,
        configurable: true,
    });

    // Removes the first item in the array equal to the item. The array is returned for chaining.
    Object.defineProperty(Array.prototype, 'remove', {
        value: function (item: any) {
            mustBe.array(this, "The array is null or undefined.");
            const array: any[] = this;
            for (let i = 0; i < array.length; i++) {
                if (instanceIs.equal(item, array[i])) {
                    array.splice(i, 1);
                    i--;
                }
            }
            return this;
        },
        enumerable: false,
        configurable: true,
    });

    // Removes the element at the specified index. The array is returned for chaining.
    Object.defineProperty(Array.prototype, 'removeAt', {
        value: function (index: number) {
            mustBe.array(this, "The array is null or undefined.");
            mustBe.true(index >= 0 && index < this.length, 'The index is out of range.');
            this.splice(index, 1);
            return this;
        },
        enumerable: false,
        configurable: true,
    });

    // Clears all elements from the collection.
    Object.defineProperty(Array.prototype, 'clear', {
        value: function () {
            mustBe.array(this, "The array is null or undefined.");
            this.length = 0;
            return this;
        },
        enumerable: false,
        configurable: true,
    });

    // Returns the element at the specified index.
    Object.defineProperty(Array.prototype, 'get', {
        value: function (index: number) {
            mustBe.array(this, "The array is null or undefined.");
            mustBe.true(index >= 0 && index < this.length, 'The index is out of range.');
            return this[index];
        },
        enumerable: false,
        configurable: true,
    });

    // Sets the element at the specified index.
    Object.defineProperty(Array.prototype, 'set', {
        value: function (index: number, item: any) {
            mustBe.true(index >= 0, 'The index must be greater than or equal to zero.');
            this[index] = item;
            return this;
        },
        enumerable: false,
        configurable: true,
    });

    // Implements IEnumerable<T>.array
    Object.defineProperty(Array.prototype, 'foreach', {
        value: function (operation: (item: any, index?: number) => void | any): void {
            foreach(this, operation);
        },
        enumerable: false,
        configurable: true,
    });

    // Enumerates the sequence.
    Object.defineProperty(Array.prototype, 'do', {
        value: function (operation: (item: any, index?: number) => void | any): any {
            foreach(this, operation);
            return this;
        },
        enumerable: false,
        configurable: true,
    });

    // Implements IEnumerable<T>.getEnumerator
    Object.defineProperty(Array.prototype, 'getEnumerator', {
        value: function () {
            return new ArrayEnumerator<any>(<any[]>this);
        },
        enumerable: false,
        configurable: true,
    });

    // Implements IEnumerable<T>.array
    Object.defineProperty(Array.prototype, 'toArray', {
        value: function () {
            return this;
        },
        enumerable: false,
        configurable: true,
    });

    // Implements IEnumerable<T>.query
    Object.defineProperty(Array.prototype, 'query', {
        value: function () {
            return new GlobalQueryable<any>(<IEnumerable<any>>this);
        },
        enumerable: false,
        configurable: true,
    });

    // Counts the number of elements in the array.
    Object.defineProperty(Array.prototype, 'count', {
        value: function () {
            return this.length;
        },
        enumerable: false,
        configurable: true,
    });
}

classicalInitialized = true;

