/// <reference path="./classical.d.ts" />

export interface InstanceIs {
    <T>(value: any, constructor: Constructor<T> | any, orThrow?: { orThrow: boolean | string }): value is T;
}

export class InstanceIs extends Function {
    constructor() {
        super();
        return new Proxy(this, {
            apply: (target, thisArg, ...args) => (this.instanceOf as Function)(...args),
            get: (target, prop) => {
                return (this as any)[prop];
            },
        });
    }

    undefined(value: any, orThrow?: { orThrow: boolean | string }): value is undefined {
        const isUndefined = value === undefined;
        return this._handleResult(isUndefined, orThrow, "The provided value is not undefined.");
    }

    null(value: any, orThrow?: { orThrow: boolean | string }): value is null {
        const isNull = value === null;
        return this._handleResult(isNull, orThrow, "The provided value is not null.");
    }

    equal<T>(first: T | any, second: any, orThrow?: { orThrow: boolean | string }): first is T {
        const result = first === second;
        return this._handleResult(result, orThrow, "Values are not equal.");
    }

    string(value: any, orThrow?: { orThrow: boolean | string }): value is string {
        const isString = typeof value === 'string';
        return this._handleResult(isString, orThrow, "The provided value is not a string.");
    }

    number(value: any, orThrow?: { orThrow: boolean | string }): value is number {
        const isNumber = typeof value === 'number';
        return this._handleResult(isNumber, orThrow, "The provided value is not a number.");
    }

    boolean(value: any, orThrow?: { orThrow: boolean | string }): value is boolean {
        const isBoolean = typeof value === 'boolean';
        return this._handleResult(isBoolean, orThrow, "The provided value is not a boolean.");
    }

    true(value: any, orThrow?: { orThrow: boolean | string }): value is true {
        const isTrue = value === true;
        return this._handleResult(isTrue, orThrow, "The provided value is not true.");
    }

    false(value: any, orThrow?: { orThrow: boolean | string }): value is true {
        const isFalse = value === false;
        return this._handleResult(isFalse, orThrow, "The provided value is not false");
    }

    bigint(value: any, orThrow?: { orThrow: boolean | string }): value is BigInt {
        const isBigInt = typeof value === 'bigint';
        return this._handleResult(isBigInt, orThrow, "The provided value is not a bigint.");
    }

    symbol(value: any, orThrow?: { orThrow: boolean | string }): value is Symbol {
        const isSymbol = typeof value === 'symbol';
        return this._handleResult(isSymbol, orThrow, "The provided value is not a symbol.");
    }

    object(value: any, orThrow?: { orThrow: boolean | string }): value is object {
        const isObject = value !== null && typeof value === 'object';
        return this._handleResult(isObject, orThrow, "The provided value is not an object.");
    }

    function(value: any, orThrow?: { orThrow: boolean | string }): value is Function {
        const isFunction = this.instanceOf(value, Function, orThrow);
        return this._handleResult(isFunction, orThrow, "The provided value is not a function.");
    }

    type(value: any, orThrow?: { orThrow: boolean | string }): value is Constructor {
        return this.function(value, orThrow) && this.function(value.constructorThrow, orThrow);
    }

    parentType(value: any, parentType: Constructor, orThrow?: { orThrow: boolean | string }): boolean {
        if (value === parentType || !this.type(value, orThrow) || !this.type(parentType, orThrow)) {
            return this._handleResult(false, orThrow, `The provided value is not a parent type of ${parentType.name ?? "the specified constructor"}.`);
        }

        let prototype = Object.getPrototypeOf(value);
        const parentPrototype = parentType;
        while (prototype) {
            if (prototype === parentPrototype) return true;
            prototype = Object.getPrototypeOf(prototype);
        }

        return this._handleResult(false, orThrow, `The provided value is not a parent type of ${parentType.name ?? "the specified constructor"}.`);
    }

    childType(value: any, childType: Constructor, orThrow?: { orThrow: boolean | string }): boolean {
        const isChildType = this.type(value, orThrow) && this.parentType(childType, value, orThrow);
        return this._handleResult(isChildType, orThrow, `The provided value is not a child type of ${childType?.name ?? "the specified constructor"}.`);
    }

    instanceOf<T=any>(value: any, type: Constructor<T> | any, orThrow?: { orThrow: boolean | string }): value is T {
        const isInstanceOf = value instanceof type;
        return this._handleResult(isInstanceOf, orThrow, `The provided value is not an instance of ${type.name ?? "the specified constructor"}.`);
    }

    emptyObject(value: any, orThrow?: { orThrow: boolean | string }): value is object {
        const isObject = this.object(value, orThrow);
        const hasNoProperties = isObject && Object.keys(value).length === 0;
        const isEmptyObject = isObject && hasNoProperties;
        return this._handleResult(isEmptyObject, orThrow, "The provided value is not an empty object.");
    }
    
    populatedObject(value: any, orThrow?: { orThrow: boolean | string }): value is object {
        const populatedObject = !this.emptyObject(value);
        return this._handleResult(populatedObject, orThrow, "The provided value is not a populated object.");
    }
    
    array<T>(value: T[] | null | undefined, orThrow?: { orThrow: boolean | string }): value is T[] {
        const result = Array.isArray(value);
        return this._handleResult(result, orThrow, "The provided value is not an array.");
    }
    
    emptyArray<T = any>(value: T[] | any[] | any, orThrow?: { orThrow: boolean | string }): value is T[] {
        const result = this.array(value) && value.length === 0;
        return this._handleResult(result, orThrow, "The provided value is not an empty array.");
    }
    
    populatedArray<T = any>(value: any | T[], orThrow?: { orThrow: boolean | string }): value is T[]  {
        const result = this.array(value) && value.length > 0;
        return this._handleResult(result, orThrow, "The provided value is not a populated array.");
    }
    
    specified<T>(value: T, orThrow?: { orThrow: boolean | string }): value is T 
    specified<T>(value: T | null, orThrow?: { orThrow: boolean | string }): value is T 
    specified<T>(value: T | undefined, orThrow?: { orThrow: boolean | string }): value is T 
    specified<T>(value: T | null | undefined, orThrow?: { orThrow: boolean | string }): value is T {
        const isDefined = value !== null && value !== this.undefined;
        return this._handleResult(isDefined, orThrow, `The provided value is ${value}.`);
    }
    
    unspecified<T>(value: T | null | undefined | any, orThrow?: { orThrow: boolean | string }): value is null | undefined {
        const isNotDefined = !this.specified(value);
        return this._handleResult(isNotDefined, orThrow, "The provided value is defined.");
    }
    
    positiveInfinity(value: any, orThrow?: { orThrow: boolean | string }): value is number {
        const result = value === Number.POSITIVE_INFINITY;
        return this._handleResult(result, orThrow, "The provided value is not positive infinity.");
    }
    
    negativeInfinity(value: any, orThrow?: { orThrow: boolean | string }): value is number {
        const result = value === Number.NEGATIVE_INFINITY;
        return this._handleResult(result, orThrow, "The provided value is not negative infinity.");
    }
    
    nan(value: number | null | undefined, orThrow?: { orThrow: boolean | string }): value is number {
        const result = Number.isNaN(value);
        return this._handleResult(result, orThrow, "The provided value is not NaN.");
    }
    
    notNan(value: number | null | undefined, orThrow?: { orThrow: boolean | string }): value is number {
        const result = this.number(value) && !this.nan(value);
        return this._handleResult(result, orThrow, "The provided value is NaN.");
    }
    
    private _<T>(value: any, constructor: Constructor<T> | any, orThrow?: { orThrow: boolean | string }): value is T {
        let result: boolean;
    
        // Handle cases where `constructor` is a primitive type
        if (constructor === String) {
            result = typeof value === "string";
        } else if (constructor === Number) {
            result = typeof value === "number";
        } else if (constructor === Boolean) {
            result = typeof value === "boolean";
        } else if (constructor === BigInt) {
            result = typeof value === "bigint";
        } else if (constructor === Symbol) {
            result = typeof value === "symbol";
        } else if (constructor === Object) {
            result = typeof value === "object" && value !== null;
        } else if (constructor === Function) {
            result = typeof value === "function";
        } else {
            // For non-primitive types, use `instanceof`
            result = value instanceof constructor;
        }
    
        // Handle the result and throw if specified
        return this._handleResult(result, orThrow, `The provided value is not an instance of ${constructor.name ?? "the specified constructor"}.`);
    }

    private _handleResult(result: boolean, orThrow?: { orThrow: boolean | string }, message?: string): boolean {
        if (!result && orThrow?.orThrow) {
            const errorMessage = this.string(orThrow.orThrow) ? orThrow.orThrow : message || "The validation failed.";
            throw new Error(errorMessage);
        }
        return result;
    }
}

export const instanceIs: InstanceIs = new InstanceIs();

export interface Is {
    <T = any>(constructor: Constructor<T> | any, orThrow?: { orThrow: boolean | string }): boolean;
}

export class Is<T = any> extends Function {
    constructor(private value: T) {
        super();
        return new Proxy(this, {
            apply: (target, thisArg, ...args) => (this.instanceOf as Function)(...args),
            get: (target, prop) => {
                return (this as any)[prop];
            },
        });
    }

    undefined(orThrow?: { orThrow: boolean | string }): boolean {
        return instanceIs.undefined(this.value, orThrow);
    }

    null(orThrow?: { orThrow: boolean | string }): boolean {
        return instanceIs.null(this.value, orThrow);
    }

    equal(second: any, orThrow?: { orThrow: boolean | string }): boolean {
        return instanceIs.equal(this.value, second, orThrow);
    }

    string(orThrow?: { orThrow: boolean | string }): boolean {
        return instanceIs.string(this.value, orThrow);
    }

    number(orThrow?: { orThrow: boolean | string }): boolean {
        return instanceIs.number(this.value, orThrow);
    }

    boolean(orThrow?: { orThrow: boolean | string }): boolean {
        return instanceIs.boolean(this.value, orThrow);
    }

    bigint(orThrow?: { orThrow: boolean | string }): boolean {
        return instanceIs.bigint(this.value, orThrow);
    }

    symbol(orThrow?: { orThrow: boolean | string }): boolean {
        return instanceIs.symbol(this.value, orThrow);
    }

    object(orThrow?: { orThrow: boolean | string }): boolean {
        return instanceIs.object(this.value, orThrow);
    }

    function(orThrow?: { orThrow: boolean | string }): boolean {
        return instanceIs.function(this.value, orThrow);
    }

    type(orThrow?: { orThrow: boolean | string }): boolean {
        return instanceIs.type(this.value, orThrow);
    }

    parentType(parentType: Constructor, orThrow?: { orThrow: boolean | string }): boolean {
        return instanceIs.parentType(this.value, parentType, orThrow);
    }

    childType(childType: Constructor, orThrow?: { orThrow: boolean | string }): boolean {
        return instanceIs.childType(this.value, childType, orThrow);
    }

    instanceOf<T=any>(type: Constructor<T> | any, orThrow?: { orThrow: boolean | string }): boolean {
        return instanceIs.instanceOf(this.value, type, orThrow);
    }

    emptyObject<T>(orThrow?: { orThrow: boolean | string }): boolean {
        return instanceIs.emptyObject(this.value, orThrow);
    }

    populatedObject<T>(orThrow?: { orThrow: boolean | string }): boolean {
        return instanceIs.populatedObject(this.value, orThrow);
    }

    array(orThrow?: { orThrow: boolean | string }): boolean {
        return instanceIs.array(this.value as any, orThrow);
    }

    emptyArray(orThrow?: { orThrow: boolean | string }): boolean {
        return instanceIs.emptyArray(this.value, orThrow);
    }

    populatedArray<T = any>(orThrow?: { orThrow: boolean | string }): boolean {
        return instanceIs.populatedArray(this.value, orThrow);
    }

    specified<T>(orThrow?: { orThrow: boolean | string }): boolean {
        return instanceIs.specified(this.value, orThrow);
    }

    unspecified<T>(orThrow?: { orThrow: boolean | string }): boolean {
        return instanceIs.unspecified(this.value, orThrow);
    }

    positiveInfinity(orThrow?: { orThrow: boolean | string }): boolean {
        return instanceIs.positiveInfinity(this.value, orThrow);
    }

    negativeInfinity(orThrow?: { orThrow: boolean | string }): boolean {
        return instanceIs.negativeInfinity(this.value, orThrow);
    }

    nan(orThrow?: { orThrow: boolean | string }): boolean {
        return instanceIs.nan(this.value as number, orThrow);
    }

    notNan(orThrow?: { orThrow: boolean | string }): boolean {
        return instanceIs.notNan(this.value as number, orThrow);
    }
}

export interface Ensure {
    <T>(value: T | null | undefined, reason?: string): asserts value is T;
}

export class Ensure extends Function {
    constructor() {
        super();
        return new Proxy(this, {
            apply: (target, thisArg, ...args) => (this.specified as Function)(...args),
            get: (target, prop) => {
                return (this as any)[prop];
            },
        });
    }

    undefined(value: any, reason?: string): asserts value is undefined {
        instanceIs.undefined(value, { orThrow: reason || true });
    }

    null(value: any, reason?: string): asserts value is null {
        instanceIs.null(value, { orThrow: reason || true });
    }

    equal<T = any>(first: T | any, second: any, reason?: string): asserts first is T {
        instanceIs.equal(first, second, { orThrow: reason || true });
    }

    string(value: any, reason?: string): asserts value is string {
        instanceIs.string(value, { orThrow: reason || true });
    }

    number(value: any, reason?: string): asserts value is number {
        instanceIs.number(value, { orThrow: reason || true });
    }

    boolean(value: any, reason?: string): asserts value is boolean {
        instanceIs.boolean(value, { orThrow: reason || true });
    }

    true(value: any, reason?: string): asserts value is true {
        instanceIs.true(value, { orThrow: reason || true });
    }

    false(value: any, reason?: string): asserts value is false {
        instanceIs.false(value, { orThrow: reason || true });
    }

    bigint(value: any, reason?: string): asserts value is BigInt {
        instanceIs.bigint(value, { orThrow: reason || true });
    }

    symbol(value: any, reason?: string): asserts value is Symbol {
        instanceIs.symbol(value, { orThrow: reason || true });
    }

    object(value: any, reason?: string): asserts value is object {
        instanceIs.object(value, { orThrow: reason || true });
    }

    function(value: any, reason?: string): asserts value is Function {
        instanceIs.function(value, { orThrow: reason || true });
    }

    type(value: any, reason?: string): asserts value is Constructor {
        instanceIs.type(value, { orThrow: reason || true });
    }

    parentType(value: any, parentType: Constructor, reason?: string): void {
        instanceIs.parentType(value, parentType, { orThrow: reason || true });
    }

    childType(value: any, childType: Constructor, reason?: string): void {
        instanceIs.childType(value, childType, { orThrow: reason || true });
    }

    instanceOf<T=any>(value: any, type: Constructor<T> | any, reason?: string): asserts value is T {
        instanceIs.instanceOf(value, type, { orThrow: reason || true });
    }

    emptyObject<T>(value: T | object, reason?: string): asserts value is T {
        instanceIs.emptyObject(value, { orThrow: reason || true });
    }

    populatedObject<T>(value: T | object, reason?: string): asserts value is T {
        instanceIs.populatedObject(value, { orThrow: reason || true });
    }

    array<T=any>(value: T[] | any[] | any, reason?: string): asserts value is T[] {
        instanceIs.array(value, { orThrow: reason || true });
    }

    emptyArray<T = any>(value: T[] | any[] | any, reason?: string): asserts value is T[] {
        instanceIs.emptyArray(value, { orThrow: reason || true });
    }

    populatedArray<T = any>(value: any | T[], reason?: string): asserts value is T[] {
        instanceIs.populatedArray(value, { orThrow: reason || true });
    }

    specified<T>(value: T | null | undefined, reason?: string): asserts value is T {
        instanceIs.specified(value, { orThrow: reason || true });
    }

    unspecified<T>(value: any, reason?: string): asserts value is null | undefined {
        instanceIs.unspecified(value, { orThrow: reason || true });
    }

    positiveInfinity(value: any, reason?: string): asserts value is number {
        instanceIs.positiveInfinity(value, { orThrow: reason || true });
    }

    negativeInfinity(value: any, reason?: string): asserts value is number {
        instanceIs.negativeInfinity(value, { orThrow: reason || true });
    }

    nan(value: number | null | undefined, reason?: string): asserts value is number {
        instanceIs.nan(value, { orThrow: reason || true });
    }

    notNan(value: number | null | undefined, reason?: string): asserts value is number {
        instanceIs.notNan(value, { orThrow: reason || true });
    }

    notImplemented() {
        throw Error("The property methopd has not been implemented yet");
    }

    staticClass() {
        throw Error("A static class cannot be instantiated");
    }
}

export const ensure: Ensure = new Ensure();

export class Lazy<T> {
    private _initializer: () => T;
    private _uninitialized: boolean = true;
    private _value: T | undefined;
    public get value(): T {
        if (this._uninitialized) {
            this._uninitialized = false;
            this._value = this._initializer();
        }
        return this._value!;
    }

    constructor(initializer: () => T) {
        this._initializer = initializer;
    }
}
