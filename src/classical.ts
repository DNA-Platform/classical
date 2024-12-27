/// <reference path="./classical.d.ts" />
import { Type as GlobalType, environment as globalEnvironment } from "./reflection";
import { Dictionary as GlobalDictionary, Queryable as GlobalQueryable, ArrayEnumerator, Hash, foreach } from "./collections";
import { Is, instanceIs, ensure, Lazy as GlobalLazy } from "./util";
import { } from "./util";

var classicalInitialized: boolean | undefined;
if (!classicalInitialized) {
    var globalScope = globalThis as any;

    globalScope.typeOf = !globalScope.typeOf ? GlobalType.typeOf : (() => { throw new Error("classical cannot be loaded because typeOf already exists"); })();
    globalScope.instanceOf = !globalScope.instanceOf ? GlobalType.instanceOf : (() => { throw new Error("classical cannot be loaded because instanceOf already exists"); })();
    globalScope.Type = !globalScope.Type ? GlobalType : (() => { throw new Error("classical cannot be loaded because Type already exists"); })();
    globalScope.Environment = !globalScope.Environment ? globalEnvironment : (() => { throw new Error("classical cannot be loaded because Environment already exists"); })();
    globalScope.Dictionary = !globalScope.Dictionary ? GlobalDictionary : (() => { throw new Error("classical cannot be loaded because Dictionary already exists"); })();
    globalScope.Queryable = !globalScope.Queryable ? GlobalQueryable : (() => { throw new Error("classical cannot be loaded because Queryable already exists"); })();
    globalScope.Lazy = !globalScope.Lazy ? GlobalLazy : (() => { throw new Error("classical cannot be loaded because Lazy already exists"); })();
    globalScope.environment = !globalScope.environment ? globalEnvironment : (() => { throw new Error("classical cannot be loaded because environment already exists"); })();
    globalScope.instanceIs = !globalScope.instanceIs ? instanceIs : (() => { throw new Error("classical cannot be loaded because instanceIs already exists"); })();
    globalScope.ensure = !globalScope.ensure ? ensure : (() => { throw new Error("classical cannot be loaded because ensure already exists"); })();

    globalScope.ensure = function <T>(value: T | null | undefined | any): asserts value is T {
        instanceIs.specified(value, { orThrow: true });
    }

    globalScope.specified = function <T>(value: T | null | undefined | any, orThrow?: { orThrow: boolean | string }): value is T {
        return instanceIs.specified(value, orThrow);
    }

    globalScope.unspecified = function <T>(value: T | null | undefined | any, orThrow?: { orThrow: boolean | string }): value is null | undefined {
        return instanceIs.unspecified(value, orThrow);
    }

    // Define `type` as a property that returns the object's type
    Object.defineProperty(Object.prototype, 'type', {
        get: function () {
            return GlobalType.typeOf(this.constructor);
        },
        enumerable: false,
        configurable: true
    });

    // Define `is` as a method to check the object's type
    Object.defineProperty(Object.prototype, 'is', {
        get: function (): Is {
            return new Is(this);
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
            ensure(items);
            ensure.array(items, "The items are null or undefined.");
            items.foreach(item => this.add(item));
            return this;
        },
        enumerable: false,
        configurable: true,
    });

    // Removes the first item in the array equal to the item. The array is returned for chaining.
    Object.defineProperty(Array.prototype, 'remove', {
        value: function (item: any) {
            ensure.array(this, "The array is null or undefined.");
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
            ensure.array(this, "The array is null or undefined.");
            ensure.true(index >= 0 && index < this.length, 'The index is out of range.');
            this.splice(index, 1);
            return this;
        },
        enumerable: false,
        configurable: true,
    });

    // Clears all elements from the collection.
    Object.defineProperty(Array.prototype, 'clear', {
        value: function () {
            ensure.array(this, "The array is null or undefined.");
            this.length = 0;
            return this;
        },
        enumerable: false,
        configurable: true,
    });

    // Returns the element at the specified index.
    Object.defineProperty(Array.prototype, 'get', {
        value: function (index: number) {
            ensure.array(this, "The array is null or undefined.");
            ensure.true(index >= 0 && index < this.length, 'The index is out of range.');
            return this[index];
        },
        enumerable: false,
        configurable: true,
    });

    // Sets the element at the specified index.
    Object.defineProperty(Array.prototype, 'set', {
        value: function (index: number, item: any) {
            ensure.true(index >= 0, 'The index must be greater than or equal to zero.');
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

    // Adds a unique hash code to a function.
    Object.defineProperty(Function.prototype, 'getHashCode', {
        value: function () {
            if (this._hashCode === undefined) this._hashCode = Hash.forNumber(Math.random());
            return this._hashCode;
        },
        enumerable: false,
        configurable: true,
    });

    // Adds a unique hash code to a date object.
    Object.defineProperty(Date.prototype, 'getHashCode', {
        value: function () {
            if (this._hashCode == undefined) this._hashCode = Hash.forNumber(Math.random());
            return this._hashCode;
        },
        enumerable: false,
        configurable: true,
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
}

classicalInitialized = true;

