import u from './utilities';
import Assert from './assert';
import Hash from './hash';
import { Type } from './reflection';
import { Queryable } from './collections';

const ObjectPrototype: any = Object.prototype;
const StringPrototype: any = String.prototype;
const NumberPrototype: any = Number.prototype;
const BooleanPrototype: any = Boolean.prototype;
const ArrayPrototype: any = Array.prototype;
const FunctionPrototype: any = Function.prototype;
const DatePrototype: any = Date.prototype;

// Removing the _hashCode property from the object before stringifying it.
const stringify = JSON.stringify;
JSON.stringify = function (value: any) {
    let hashCode;
    if (value && value._hashCode) {
        hashCode = value._hashCode;
        delete value._hashCode;
    }

    const result = stringify(value);

    if (hashCode)
        value._hashCode = hashCode;

    return result;
}

Object.defineProperty(ObjectPrototype, 'equals', {
    value: function (other: any) {
        return this === other;
    },
    enumerable: false,
    configurable: true,
    writable: true
});

Object.defineProperty(ObjectPrototype, 'getHashCode', {
    value: function () {
        if (u.isNullOrUndefined(this)) return 0;

        if (this._hashCode === undefined) {
            let hashCode: number;
            switch (typeof this) {
                case 'number':
                    hashCode = Hash.forNumber(this);
                    break;
                case 'string':
                    hashCode = Hash.forString(this);
                    break;
                case 'boolean':
                    hashCode = Hash.forBoolean(this);
                    break;
                default:
                    hashCode = Hash.forNumber(Math.random());
                    break;
            }

            Object.defineProperty(this, '_hashCode', {
                value: hashCode,
                enumerable: false
            });
        }

        return this._hashCode;
    },
    enumerable: false,
    configurable: true,
    writable: true
});

Object.defineProperty(StringPrototype, 'getHashCode', {
    value: function () {
        return Hash.forString(this);
    },
    enumerable: false,
    configurable: true,
    writable: true
});

Object.defineProperty(NumberPrototype, 'getHashCode', {
    value: function () {
        return Hash.forNumber(this);
    },
    enumerable: false,
    configurable: true,
    writable: true
});

Object.defineProperty(BooleanPrototype, 'getHashCode', {
    value: function () {
        return Hash.forBoolean(this);
    },
    enumerable: false,
    configurable: true,
    writable: true
});

Object.defineProperty(ObjectPrototype, 'is', {
    value: function (type: Function) {
        if (u.isNullOrUndefined(this))
            return false;
        if (u.isNullOrUndefined(type))
            return false;

        return this.getType().isAssignableTo(typeOf(type));
    },
    enumerable: false,
    configurable: true,
    writable: true
});

Object.defineProperty(ObjectPrototype, 'getType', {
    value: function () {
        if (u.isNullOrUndefined(this))
            return Type.undefined;
        return Type.getType(this.constructor);
    },
    enumerable: false,
    configurable: true,
    writable: true
});

// Adds the item to the end of the array.
// The array is returned for chaining.
ArrayPrototype.add = function (item: any) {
    Assert.isDefined(this, "The array is null or undefined.");
    this.push(item);
    return this;
};

// Adds the items to the end of the array.
// The array is returned for chaining.
ArrayPrototype.addRange = function (items: IEnumerable<any>) {
    Assert.isDefined(this, "The array is null or undefined.");
    Assert.isDefined(items, "The items are null or undefined.");
    items.forEach(item => this.add(item));

    return this;
};

// Removes the first item in the array equal to the item.
// The array is returned for chaining.
ArrayPrototype.remove = function (item: any) {
    Assert.isDefined(this, "The array is null or undefined.");
    var array: any[] = this;
    for (var i = 0, length = this.length; i < length; i++) {
        if (u.areEqual(item, array[i])) {
            array.splice(i, 1);
            i--;
            length--;
        }
    }

    return this;
};

// Removes the element at the specified index.
// The array is returned for chaining.
ArrayPrototype.removeAt = function (index: number) {
    Assert.isDefined(this, "The array is null or undefined.");
    Assert.isTrue(index >= 0 && index < this.length, 'The index is out of range.');
    this.splice(index, 1);
    return this;
}

// Clears all elements from the collection.
ArrayPrototype.clear = function () {
    Assert.isDefined(this, "The array is null or undefined.");
    this.length = 0;
    return this;
}

// Returns the element at the specified index.
ArrayPrototype.get = function (index: number) {
    Assert.isDefined(this, "The array is null or undefined.");
    Assert.isTrue(index >= 0 && index < this.length, 'The index is out of range.');
    return this[index];
}

// Returns the element at the specified index.
ArrayPrototype.set = function (index: number, item: any) {
    Assert.isDefined(this, "The array is null or undefined.");
    Assert.isTrue(index >= 0, 'The index must be greater than or equal to zero.');

    this[index] = item;
    return this;
}

// Implements IEnumerable<T>.getEnumerator
ArrayPrototype.getEnumerator = function () {
    Assert.isDefined(this, "The array is null or undefined.");
    return new _ArrayEnumerator<any>(<any[]>this);
};

// Implements IEnumerable<T>.array
ArrayPrototype.toArray = function () {
    return this;
};

// Implements IEnumerable<T>.query
ArrayPrototype.query = function () {
    Assert.isDefined(this, "The array is null or undefined.");
    return new Queryable<any>(<IEnumerable<any>>this);
};

// Counts the number of elements in the array
ArrayPrototype.count = function () {
    Assert.isDefined(this, "The array is null or undefined.");
    return this.length;
};

FunctionPrototype.getHashCode = function () {
    if (u.isNullOrUndefined(this))
        return 0;
    if (this._hashCode === undefined)
        this._hashCode = Hash.forNumber(Math.random());

    return this._hashCode;
}

DatePrototype.getHashCode = function () {
    if (this._hashCode == undefined)
        this._hashCode = Hash.forNumber(Math.random());

    return this._hashCode;
}

class _ArrayEnumerator<T> implements IEnumerator<T> {

    _index = -1;
    _array: T[];

    constructor(array: T[]) {
        Assert.isDefined(array);
        this._array = array;
    }

    get current(): T {
        return this._array[this._index];
    }

    moveNext(): boolean {
        this._index++;
        return this._index < this._array.length;
    }
}

export function typeOf(ctor: Function): Type {
    return Type.getType(ctor);
}

globalThis.typeOf = typeOf;
globalThis.Type = Type;
