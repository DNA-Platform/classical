/// <reference path="./classical.d.ts" />

export interface InstanceIs {
    <T>(value: any, type: Constructor<T>, orThrow?: { orThrow: boolean | string }): value is T;
}

export class InstanceIs extends Function {
    constructor() {
        super();
        return new Proxy(this, {
            apply: (target, thisArg, args) => (this._ as Function).apply(this, args),
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
        const isString = typeof value === 'string' || value instanceof String;
        return this._handleResult(isString, orThrow, "The provided value is not a string.");
    }

    number(value: any, orThrow?: { orThrow: boolean | string }): value is number {
        const isNumber = typeof value === 'number' || value instanceof Number;
        return this._handleResult(isNumber, orThrow, "The provided value is not a number.");
    }

    boolean(value: any, orThrow?: { orThrow: boolean | string }): value is boolean {
        const isBoolean = typeof value === 'boolean' || value instanceof Boolean;
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
        const isBigInt = typeof value === 'bigint' || value instanceof BigInt;
        return this._handleResult(isBigInt, orThrow, "The provided value is not a bigint.");
    }

    symbol(value: any, orThrow?: { orThrow: boolean | string }): value is Symbol {
        const isSymbol = typeof value === 'symbol' || value instanceof Symbol;
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
        // A constructor should:
        // 1. Be Object or: 
        // 2. Be a function
        // 3. Have a prototype
        // 4. Have a constructor property on its prototype
        // 5. The prototype's constructor should point back to itself
        if (value === Object) return true;
        const isFunction = this.function(value);
        if (!isFunction) return this._handleResult(false, orThrow, "The provided value is not a function.");
        
        const hasPrototype = 'prototype' in value && value.prototype instanceof Object;
        if (!hasPrototype) return this._handleResult(false, orThrow, "The provided value has no prototype.");
        
        const hasConstructor = 'constructor' in value.prototype;
        if (!hasConstructor) return this._handleResult(false, orThrow, "The prototype has no constructor.");
        
        const constructorPointsBack = value.prototype.constructor === value;
        
        return this._handleResult(constructorPointsBack, orThrow, "The provided value is not a constructor function.");
    }

    parentType(value: any, parentType: Constructor, orThrow?: { orThrow: boolean | string }): boolean {
        this.type(value, orThrow);
        this.type(parentType, orThrow);
        
        if (value === parentType) {
            return this._handleResult(false, orThrow, 
                `The provided value is not a parent type of ${parentType.name ?? "the specified constructor"}.`);
        }
    
        // Check if instances of value are instances of parentType
        const inherits = value.prototype instanceof parentType;
        
        return this._handleResult(inherits, orThrow, 
            `The provided value is not a parent type of ${parentType.name ?? "the specified constructor"}.`);
    }

    childType(value: any, childType: Constructor, orThrow?: { orThrow: boolean | string }): boolean {
        const isChildType = this.type(value, orThrow) && this.parentType(childType, value, orThrow);
        return this._handleResult(isChildType, orThrow, `The provided value is not a child type of ${childType?.name ?? "the specified constructor"}.`);
    }

    instanceOf<T = any>(value: any, type: Constructor<T>, orThrow?: { orThrow: boolean | string }): value is T {
        const isInstanceOf = value instanceof type;
        return this._handleResult(isInstanceOf, orThrow, `The provided value is not an instance of ${type.name ?? "the specified constructor"}.`);
    }

    emptyObject(value: any, orThrow?: { orThrow: boolean | string }): value is object {
        this.specified(value, orThrow);
        const isObject = Object.getPrototypeOf(value) === Object.prototype;
        const hasNoProperties = isObject && Object.keys(value).length === 0;
        const isEmptyObject = isObject && hasNoProperties;
        return this._handleResult(isEmptyObject, orThrow, "The provided value is not an empty object.");
    }

    plainObject(value: any, orThrow?: { orThrow: boolean | string }): boolean {
        this.specified(value, orThrow);
        const proto = Object.getPrototypeOf(value);
        const isPlain = this.unspecified(proto, orThrow);
        return this._handleResult(isPlain, orThrow, `The provided value is not a plain object because it has a prototype.`);
    }

    populatedObject(value: any, orThrow?: { orThrow: boolean | string }): value is object {
        const populatedObject = !this.emptyObject(value);
        return this._handleResult(populatedObject, orThrow, "The provided value is not a populated object.");
    }

    array<T>(value: T[] | null | undefined | any, orThrow?: { orThrow: boolean | string }): value is T[] {
        const result = Array.isArray(value);
        return this._handleResult(result, orThrow, "The provided value is not an array.");
    }

    emptyArray<T = any>(value: T[] | any[] | any, orThrow?: { orThrow: boolean | string }): value is T[] {
        const result = this.array(value) && value.length === 0;
        return this._handleResult(result, orThrow, "The provided value is not an empty array.");
    }

    populatedArray<T = any>(value: any | T[], orThrow?: { orThrow: boolean | string }): value is T[] {
        const result = this.array(value) && value.length > 0;
        return this._handleResult(result, orThrow, "The provided value is not a populated array.");
    }

    specified<T>(value: T | null | undefined, orThrow?: { orThrow: boolean | string }): value is T {
        const isSpecified = value !== null && value !== undefined;
        return this._handleResult(isSpecified, orThrow, `The provided value is unspecified as either null or undefined.`);
    }

    unspecified<T>(value: T | null | undefined | any, orThrow?: { orThrow: boolean | string }): value is null | undefined {
        const isNotSpecified = !this.specified(value);
        return this._handleResult(isNotSpecified, orThrow, "The provided value is defined.");
    }

    defined<T>(value: T | null | undefined, orThrow?: { orThrow: boolean | string }): value is T {
        return this.specified(value, orThrow);
    }

    notDefined<T>(value: T | null | undefined, orThrow?: { orThrow: boolean | string }): value is T {
        return this.unspecified(value, orThrow);
    }

    positiveInfinity(value: any, orThrow?: { orThrow: boolean | string }): value is number {
        const result = value === Number.POSITIVE_INFINITY;
        return this._handleResult(result, orThrow, "The provided value is not positive infinity.");
    }

    negativeInfinity(value: any, orThrow?: { orThrow: boolean | string }): value is number {
        const result = value === Number.NEGATIVE_INFINITY;
        return this._handleResult(result, orThrow, "The provided value is not negative infinity.");
    }

    infinite(value: any, orThrow?: { orThrow: boolean | string }): value is number {
        const result = value === Number.POSITIVE_INFINITY || value === Number.NEGATIVE_INFINITY;
        return this._handleResult(result, orThrow, "The provided value is not infinite.");
    }

    finite(value: any, orThrow?: { orThrow: boolean | string }): value is number {
        const result = this.number(value, orThrow) && !this.infinite(value) && !this.nan(value);
        return this._handleResult(result, orThrow, "The provided value is not finite.");
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

    private _handleResult(result: boolean, orThrow?: { orThrow: boolean | string }, reason?: string): boolean {
        if (!result && orThrow?.orThrow) {
            const errorMessage = this.string(orThrow.orThrow) ? orThrow.orThrow : reason || "The validation failed.";
            throw new Error(errorMessage);
        }
        return result;
    }
}

export const instanceIs: InstanceIs = new InstanceIs();

export interface Is {
    <T>(constructor: Constructor<T>, orThrow?: { orThrow: boolean | string }): boolean;
}

export class Is<T = any> extends Function {
    constructor(private value: T) {
        super();
        return new Proxy(this, {
            apply: (target, thisArg, args) => (instanceIs as Function)(this.value, ...args),
            get: (target, prop) => {
                return (this as any)[prop];
            },
        });
    }

    get undefined(): boolean {
        return instanceIs.undefined(this.value);
    }

    get null(): boolean {
        return instanceIs.null(this.value);
    }

    get string(): boolean {
        return instanceIs.string(this.value);
    }

    get number(): boolean {
        return instanceIs.number(this.value);
    }

    get boolean(): boolean {
        return instanceIs.boolean(this.value);
    }

    get bigint(): boolean {
        return instanceIs.bigint(this.value);
    }

    get symbol(): boolean {
        return instanceIs.symbol(this.value);
    }

    get object(): boolean {
        return instanceIs.object(this.value);
    }

    get function(): boolean {
        return instanceIs.function(this.value);
    }

    get type(): boolean {
        return instanceIs.type(this.value);
    }

    get emptyObject(): boolean {
        return instanceIs.emptyObject(this.value);
    }

    get plainObject(): boolean {
        return instanceIs.plainObject(this.value);
    }

    get populatedObject(): boolean {
        return instanceIs.populatedObject(this.value);
    }

    get array(): boolean {
        return instanceIs.array(this.value);
    }

    get emptyArray(): boolean {
        return instanceIs.emptyArray(this.value);
    }

    get populatedArray(): boolean {
        return instanceIs.populatedArray(this.value);
    }

    get specified(): boolean {
        return instanceIs.specified(this.value);
    }

    get unspecified(): boolean {
        return instanceIs.unspecified(this.value);
    }

    get defined(): boolean {
        return instanceIs.defined(this.value);
    }

    get notDefined(): boolean {
        return instanceIs.notDefined(this.value);
    }

    get infinite(): boolean {
        return instanceIs.infinite(this.value);
    }

    get finite(): boolean {
        return instanceIs.finite(this.value);
    }

    get positiveInfinity(): boolean {
        return instanceIs.positiveInfinity(this.value);
    }

    get negativeInfinity(): boolean {
        return instanceIs.negativeInfinity(this.value);
    }

    get nan(): boolean {
        return instanceIs.nan(this.value as number);
    }

    get notNan(): boolean {
        return instanceIs.notNan(this.value as number);
    }

    equal(other: any): boolean {
        return instanceIs.equal(this.value, other);
    }

    childOf(parentType: Constructor): boolean {
        return instanceIs.parentType(this.value, parentType);
    }

    parentOf(childType: Constructor): boolean {
        return instanceIs.childType(this.value, childType);
    }

    instanceOf<U>(type: Constructor<U>): boolean {
        return instanceIs.instanceOf(this.value, type);
    }
}

export class Be<T extends Verifiable = Verifiable> {
    constructor(private value: T) { }

    undefined(reason?: string): T {
        instanceIs.undefined(this.value, { orThrow: Be.formatReason(reason) });
        return this.value;
    }

    null(reason?: string): T {
        instanceIs.null(this.value, { orThrow: Be.formatReason(reason) });
        return this.value;
    }

    string(reason?: string): T {
        instanceIs.string(this.value, { orThrow: Be.formatReason(reason) });
        return this.value;
    }

    number(reason?: string): T {
        instanceIs.number(this.value, { orThrow: Be.formatReason(reason) });
        return this.value;
    }

    boolean(reason?: string): T {
        instanceIs.boolean(this.value, { orThrow: Be.formatReason(reason) });
        return this.value;
    }

    true(reason?: string): T {
        instanceIs.true(this.value, { orThrow: Be.formatReason(reason) });
        return this.value;
    }

    false(reason?: string): T {
        instanceIs.false(this.value, { orThrow: Be.formatReason(reason) });
        return this.value;
    }

    bigint(reason?: string): T {
        instanceIs.bigint(this.value, { orThrow: Be.formatReason(reason) });
        return this.value;
    }

    symbol(reason?: string): T {
        instanceIs.symbol(this.value, { orThrow: Be.formatReason(reason) });
        return this.value;
    }

    object(reason?: string): T {
        instanceIs.object(this.value, { orThrow: Be.formatReason(reason) });
        return this.value;
    }

    function(reason?: string): T {
        instanceIs.function(this.value, { orThrow: Be.formatReason(reason) });
        return this.value;
    }

    type(reason?: string): T {
        instanceIs.type(this.value, { orThrow: Be.formatReason(reason) });
        return this.value;
    }

    emptyObject(reason?: string): T {
        instanceIs.emptyObject(this.value, { orThrow: Be.formatReason(reason) });
        return this.value;
    }

    plainObject(reason?: string): T {
        instanceIs.plainObject(this.value, { orThrow: Be.formatReason(reason) });
        return this.value;
    }

    populatedObject(reason?: string): T {
        instanceIs.populatedObject(this.value, { orThrow: Be.formatReason(reason) });
        return this.value;
    }

    array(reason?: string): T {
        instanceIs.array(this.value, { orThrow: Be.formatReason(reason) });
        return this.value;
    }

    emptyArray(reason?: string): T {
        instanceIs.emptyArray(this.value, { orThrow: Be.formatReason(reason) });
        return this.value;
    }

    populatedArray(reason?: string): T {
        instanceIs.populatedArray(this.value, { orThrow: Be.formatReason(reason) });
        return this.value;
    }

    specified(reason?: string): T {
        instanceIs.specified(this.value, { orThrow: Be.formatReason(reason) });
        return this.value;
    }

    unspecified(reason?: string): T {
        instanceIs.unspecified(this.value, { orThrow: Be.formatReason(reason) });
        return this.value;
    }

    defined(reason?: string): T {
        instanceIs.defined(this.value, { orThrow: Be.formatReason(reason) });
        return this.value;
    }

    notDefined(reason?: string): T {
        instanceIs.notDefined(this.value, { orThrow: Be.formatReason(reason) });
        return this.value;
    }

    positiveInfinity(reason?: string): T {
        instanceIs.positiveInfinity(this.value, { orThrow: Be.formatReason(reason) });
        return this.value;
    }

    negativeInfinity(reason?: string): T {
        instanceIs.negativeInfinity(this.value, { orThrow: Be.formatReason(reason) });
        return this.value;
    }

    infinite(reason?: string): T {
        instanceIs.infinite(this.value, { orThrow: Be.formatReason(reason) });
        return this.value;
    }

    finite(reason?: string): T {
        instanceIs.finite(this.value, { orThrow: Be.formatReason(reason) });
        return this.value;
    }

    nan(reason?: string): T {
        instanceIs.nan(this.value as any, { orThrow: Be.formatReason(reason) });
        return this.value;
    }

    notNan(reason?: string): T {
        instanceIs.notNan(this.value as any, { orThrow: Be.formatReason(reason) });
        return this.value;
    }

    equal(other: any, reason?: string): T {
        instanceIs.equal(this.value, other, { orThrow: Be.formatReason(reason) });
        return this.value;
    }

    instanceOf<U>(type: Constructor<U>, reason?: string): T {
        instanceIs.instanceOf(this.value, type, { orThrow: Be.formatReason(reason) });
        return this.value;
    }

    parentType(parentType: Constructor, reason?: string): T {
        instanceIs.parentType(this.value, parentType, { orThrow: Be.formatReason(reason) });
        return this.value;
    }

    childType(childType: Constructor, reason?: string): T {
        instanceIs.childType(this.value, childType, { orThrow: Be.formatReason(reason) });
        return this.value;
    }

    private _(type: Constructor<T>, reason: string): T {
        instanceIs(this.value, type, { orThrow: Be.formatReason(reason) });
        return this.value;
    }

    private static formatReason(reason?: string): string | boolean {
        if (!reason) return true;
        return reason.replace(/^because[:\s]?\s*/i, (match) => {
            const restOfMessage = reason.slice(match.length);
            return restOfMessage.charAt(0).toUpperCase() + restOfMessage.slice(1);
        });
    }
}

export type Must<T extends Verifiable = Verifiable> = { be: Be<T> };

export class MustBe extends Function {
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

    instanceOf<T = any>(value: any, type: Constructor<T> | any, reason?: string): asserts value is T {
        instanceIs.instanceOf(value, type, { orThrow: reason || true });
    }

    emptyObject<T>(value: T | object, reason?: string): asserts value is T {
        instanceIs.emptyObject(value, { orThrow: reason || true });
    }

    populatedObject<T>(value: T | object, reason?: string): asserts value is T {
        instanceIs.populatedObject(value, { orThrow: reason || true });
    }

    array<T = any>(value: T[] | any[] | any, reason?: string): asserts value is T[] {
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

    unspecified(value: any, reason?: string): asserts value is null | undefined {
        instanceIs.unspecified(value, { orThrow: reason || true });
    }

    defined<T>(value: T | null | undefined, reason?: string): asserts value is T {
        instanceIs.defined(value, { orThrow: reason || true });
    }

    notDefined(value: any, reason?: string): asserts value is null | undefined {
        instanceIs.notDefined(value, { orThrow: reason || true });
    }

    positiveInfinity(value: any, reason?: string): asserts value is number {
        instanceIs.positiveInfinity(value, { orThrow: reason || true });
    }

    negativeInfinity(value: any, reason?: string): asserts value is number {
        instanceIs.negativeInfinity(value, { orThrow: reason || true });
    }

    infinite(value: any, reason?: string): asserts value is number {
        instanceIs.infinite(value, { orThrow: reason || true });
    }

    finite(value: any, reason?: string): asserts value is number {
        instanceIs.finite(value, { orThrow: reason || true });
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

export const mustBe: MustBe = new MustBe();

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
