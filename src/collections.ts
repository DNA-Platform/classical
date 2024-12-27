/// <reference path="./classical.d.ts" />
import { mustBe, instanceIs, Lazy } from './util';

export interface IHashTable<TKey, TValue> {
    [key: string]: KeyValuePair<TKey, TValue>[];
}

//A dictionary is a mapping between unique keys and arbitrary values.
//Keys must implement hashCode and equals from the Object interface.
export class Dictionary<TKey, TValue> implements IEnumerable<KeyValuePair<TKey, TValue>> {
    private _hashTable: IHashTable<TKey, TValue> = {};
    private _bucketIndex: number;
    private _numberOfBuckets: number;
    private _numberOfElements = 0;

    get hashTable() { return this._hashTable; }

    //Builds a new dictionary.
    //The capacity a lower bound on the capacity is the number of elements that can be stored without rebalancing.
    constructor(capacity: number = 10) {
        var bucketIndex = DictionaryUtilities.capacityToBucketIndex(capacity);

        this._bucketIndex = bucketIndex;
        this._numberOfBuckets = DictionaryUtilities.getNumberOfBuckets(bucketIndex);
    }

    getEnumerator(): IEnumerator<KeyValuePair<TKey, TValue>> {
        return new DictionaryEnumerator<TKey, TValue>(this);
    }

    //Returns an IEnumerable implementation that is queryable.
    query(): IQueryable<KeyValuePair<TKey, TValue>> {
        throw new Queryable<KeyValuePair<TKey, TValue>>(this);
    }

    //Returns a JavaScript array.
    toArray(): KeyValuePair<TKey, TValue>[] {
        var array: any[] = [];
        foreach<KeyValuePair<TKey, TValue>>(
            <any>this,
            pair => { array.add(pair); }
        );
        return array;
    }

    //Enumerates the sequence
    foreach(operation: (item: KeyValuePair<TKey, TValue>, index?: number) => void | any): void {
        foreach<KeyValuePair<TKey, TValue>>(this, operation);
    }

    //Enumerates the sequence
    do(operation: (item: KeyValuePair<TKey, TValue>, index?: number) => void | any): this {
        foreach<KeyValuePair<TKey, TValue>>(this, operation);
        return this;
    }

    //Adds a key-value pair to the dictionary.
    //If it exists, the existing value will be overwritten.
    //The key can be undefined, but not undefined.
    add(key: TKey, value: TValue): Dictionary<TKey, TValue> {
        mustBe(key);
        var added = this.addWithoutRebalancing(this._hashTable, this._numberOfBuckets, {
            key: key,
            value: value
        });

        if (added) this._numberOfElements++;
        this.rebalanceIfNecessary();
        return this;
    }

    //Removes a key from the dictionary.
    remove(key: TKey): Dictionary<TKey, TValue> {
        var elements = this.getElements(key);
        var pair =
            this.getPair(
                elements,
                this._hashTable,
                this._numberOfBuckets,
                key);

        if (pair !== undefined)
            elements.remove(pair);

        return this;
    }

    //Returns the value of the key if it exists; undefined otherwise.
    getValue(key: TKey): TValue | undefined {
        var elements = this.getElements(key);
        if (elements === undefined)
            return undefined;

        for (var i = 0, elementsLength = elements.length; i < elementsLength; i++) {
            var pair = elements[i];
            if (pair.key === key)
                return pair.value;
        }

        return undefined;
    }

    //Returns true if the dictionary contains the specified key; False otherwise.
    containsKey(key: TKey): boolean {
        var elements = this.getElements(key);

        return instanceIs.specified(
            this.getPair(
                elements,
                this._hashTable,
                this._numberOfBuckets,
                key));
    }

    //Counts the number of elements in the dictionary.
    count(): number {
        return this._numberOfElements;
    }

    //Returns a sequence containing the keys of the dictionary.
    getKeys(): IEnumerable<TKey> {
        return new DictionaryKeyCollection<TKey, TValue>(this);
    }

    private getIndex(key: TKey): number {
        return (key as any).hashCode % this._numberOfBuckets;
    }

    private getElements(key: TKey): KeyValuePair<TKey, TValue>[] {
        var index = this.getIndex(key);
        return this._hashTable[index] as KeyValuePair<TKey, TValue>[];
    }

    private getPair(
        elements: KeyValuePair<TKey, TValue>[],
        hashTable: IHashTable<TKey, TValue>,
        numberOfBuckets: number,
        key: TKey):
        KeyValuePair<TKey, TValue> | undefined {

        if (elements === undefined)
            return undefined;

        var current: KeyValuePair<TKey, TValue>;
        for (var i = 0, elementsLength = elements.length; i < elementsLength; i++) {
            current = elements[i];
            if (current.key === key)
                return current;
        }

        return undefined;
    }

    private addWithoutRebalancing(
        hashTable: IHashTable<TKey, TValue>,
        numberOfBuckets: number,
        pair: KeyValuePair<TKey, TValue>,
        checkForExistance: boolean = true): boolean {

        var keyHashCode = (<any>pair.key).hashCode % numberOfBuckets;
        var elements = hashTable[keyHashCode];
        if (elements === undefined) {
            elements = [];
            hashTable[keyHashCode] = elements;
        }

        if (checkForExistance) {
            var foundPair = this.getPair(
                elements,
                hashTable,
                numberOfBuckets,
                pair.key);

            if (foundPair !== undefined) {
                foundPair.value = pair.value;
                return false;
            }
        }

        elements.push(pair);
        return true;
    }

    private rebalanceIfNecessary(): void {
        if (this._numberOfElements > (DictionaryUtilities.loadFactor * this._numberOfBuckets))
            this.rebalance();
    }

    private rebalance(): void {
        var currentBucketIndex = this._bucketIndex,
            currentNumberOfBuckets = this._numberOfBuckets,
            currentHashTable = this._hashTable,
            nextBucketIndex = currentBucketIndex + 1,
            nextNumberOfBuckets = DictionaryUtilities.getNumberOfBuckets(nextBucketIndex),
            nextHashTable = {},
            elements: KeyValuePair<TKey, TValue>[];

        for (var i = 0; i < currentNumberOfBuckets; i++) {
            elements = <KeyValuePair<TKey, TValue>[]>currentHashTable[i];
            if (instanceIs.specified(elements)) {
                for (var j = 0, elementsLength = elements.length; j < elementsLength; j++) {
                    this.addWithoutRebalancing(nextHashTable, nextNumberOfBuckets, elements[j], false);
                }
            }
        }

        this._bucketIndex = nextBucketIndex;
        this._numberOfBuckets = nextNumberOfBuckets;
        this._hashTable = nextHashTable;
    }
}

class DictionaryUtilities extends Object {
    static loadFactor = 2;

    constructor() {
        mustBe.staticClass();
        super();
    }

    //Gets the number of buckets for the nth reordering, always a prime number.
    static getNumberOfBuckets(numberOfRebalances: number): number {
        var result = numberOfBuckets[numberOfRebalances];
        mustBe(result, 'The maximum size for a Dictionary has been exceeded.');

        return result;
    }

    //Returns the bucketIndex closest to matching the specified capacity.
    static capacityToBucketIndex(capacity: number): number {
        var bucketValue: number = capacity / DictionaryUtilities.loadFactor,
            currentBucketValue: number;
        for (var i = 0, length = numberOfBuckets.length; i < length; i++) {
            currentBucketValue = numberOfBuckets[i];
            if (currentBucketValue > bucketValue)
                return i;
        }

        throw Error('The capacity is too large for the dictionary.');
        return -1;
    }
}

class DictionaryEnumerator<TKey, TValue>
    implements IEnumerator<KeyValuePair<TKey, TValue>> {
    private _index = -1;
    private _hashTable: IHashTable<TKey, TValue>;
    private _numberOfBuckets: number;
    private _bucketIndex: number;
    private _keys: string[];
    private _elements: KeyValuePair<TKey, TValue>[];

    constructor(dictionary: Dictionary<TKey, TValue>) {
        this._hashTable = dictionary.hashTable;
        this._numberOfBuckets = (<any>dictionary)._numberOfBuckets;
        this._bucketIndex = 0;
        this._keys = Object.keys(this._hashTable);
        this._elements = this._hashTable[this._keys[this._bucketIndex] as any];
    }

    get current(): KeyValuePair<TKey, TValue> {
        if (this._elements !== undefined)
            return this._elements[this._index];
        else
            throw new Error();
    }

    moveNext(): boolean {
        var bucketIndex = this._bucketIndex,
            numberOfBuckets = this._numberOfBuckets,
            elements = this._elements,
            keys = this._keys,
            hashTable = this._hashTable;

        if (instanceIs.populatedArray(elements)) {   
            this._index++;
            if (this._index < elements.length)
                return true;

            this._elements = [];
            elements = this._elements;
        }

        if (bucketIndex + 1 >= numberOfBuckets)
            return false;

        for (var i = this._bucketIndex + 1; i < numberOfBuckets; i++) {
            elements = hashTable[keys[i]];
            if (instanceIs.specified(elements)) {
                this._elements = elements;
                this._bucketIndex = i;
                this._index = 0;
                return true;
            }
        }

        return false;
    }
}

export class DictionaryKeyCollection<TKey, TValue> implements IEnumerable<TKey> {

    private _dictionary: Dictionary<TKey, TValue>;

    constructor(dictionary: Dictionary<TKey, TValue>) {
        this._dictionary = dictionary;
    }

    getEnumerator(): IEnumerator<TKey> {
        return new DictionaryKeyEnumerator(this._dictionary);
    }

    query(): IQueryable<TKey> {
        return new Queryable<TKey>(this);
    }

    toArray(): TKey[] {
        const array: TKey[] = [];
        this.foreach(key => array.push(key));
        return array;
    }

    foreach(operation: (item: TKey, index?: number) => void | any): void {
        foreach(this, operation);
    }

    do(operation: (item: TKey) => void | any): this
    do(operation: (item: TKey, index?: number) => void | any): this {
        foreach(this, operation);
        return this;
    }

    count(): number {
        return this._dictionary.count();
    }
}

export class DictionaryKeyEnumerator<TKey, TValue> implements IEnumerator<TKey> {

    private _dictionaryEnumerator: IEnumerator<KeyValuePair<TKey, TValue>>;

    constructor(dictionary: Dictionary<TKey, TValue>) {
        this._dictionaryEnumerator = dictionary.getEnumerator();
    }

    get current(): TKey {
        if (instanceIs.unspecified(this._dictionaryEnumerator.current)) return undefined as any;
        return this._dictionaryEnumerator.current.key;
    }

    moveNext(): boolean {
        return this._dictionaryEnumerator.moveNext();
    }
}

export class KeyValuePair<TKey, TValue> {
    key: TKey;
    value: TValue;

    constructor(key: TKey, value: TValue) {
        this.key = key;
        this.value = value;
    }
}

//Provides a global loop function for all enumerables.
//It returns the enumerable for chaining.
export function foreach<T>(enumerable: IEnumerable<T>, operation: (item: T, index?: number) => void | any): void {
    var enumerator = enumerable.getEnumerator()
    var i = 0;

    while (enumerator.moveNext()) {
        operation(enumerator.current, i)
        i = i + 1;
    }
}

//The buckets numbers for the hashTable in DictionaryBase.
//The number of buckets is approximately 2^(index + 3), and it is guaranteed to be prime.
var numberOfBuckets: number[] = [7, 13, 23, 43, 83, 163, 317, 631, 1259, 2503, 5003, 9973, 19937, 39869, 79699, 159389, 318751, 637499, 1274989, 2549951, 5099893, 10199767, 20399531, 40799041, 81598067, 163196129, 326392249, 652784471];

class _ArrayEnumerator<T>
    implements IEnumerator<T> {

    _index = -1;
    _array: T[];

    constructor(array: T[]) {
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

/**
 Defines a lazily executed query that performs a computation on a sequence of data.
 @typeparam [T] The type of item being queried.
 @remarks 
    Not all methods of IQueryable are lazily executed.
    In particular, methods which don't return IQueryables 
    are expected to have executed the query.
*/
export class Queryable<T> implements IQueryable<T> {

    //The wrapped IEnumerable.
    _enumerable: IEnumerable<T>;

    constructor(enumerable: IEnumerable<T>) {
        this._enumerable = enumerable;
    }

    toString() {
        return this.toArray().toString();
    }

    getEnumerator(): IEnumerator<T> {
        return this._enumerable.getEnumerator();
    }

    //Returns an IEnumerable implementation that is queryable.
    query(): Queryable<T> {
        return this;
    }

    //Returns a JavaScript array.
    toArray(): T[] {
        var result = new Array<T>(),
            enumerator = this.getEnumerator();
        while (enumerator.moveNext()) {
            result.push(enumerator.current);
        }
        return result;
    }

    //Returns the number of elements in the query.
    count(): number {
        var result: number = 0,
            enumerator = this.getEnumerator();
        while (enumerator.moveNext()) {
            result++;
        }
        return result;
    }

    foreach(operation: (item: T, index?: number) => void | any): void {
        var enumerator = this.getEnumerator(),
            current: T;

        var index = 0;
        while (enumerator.moveNext()) {
            var current = enumerator.current;
            operation.bind(current)(current, index);
            index += 1;
        }
    }

    do(operation: (item: T, index?: number) => void | any): this {
        this.foreach(operation);
        return this;
    }

    cast<TElement>(): IQueryable<TElement> {
        return <IQueryable<TElement>><any>this;
    }

    //Returns a queryable containing the items that satisfy the predicate.
    where(predicate: (item: T) => boolean): IQueryable<T> {
        return new WhereQueryable<T>(this, predicate);
    }

    //Returns a queryable containing the items selected by the selector.
    select<TSelected>(selector: (item: T) => TSelected): IQueryable<TSelected> {
        return new SelectQueryable<T, TSelected>(this, selector);
    }

    //Returns a queryable containing the concatenation of all sequences selected by the selector.
    selectMany<TSelected>(selector: (item: T) => IEnumerable<TSelected>): IQueryable<TSelected> {
        return new ConcatQueryable<TSelected>(
            this.select<IEnumerable<TSelected>>(selector));
    }

    //Returns a queryable ordered by the selected item.
    orderBy<TSelected>(
        selector: (item: T) => TSelected,
        comparison?: (first: TSelected, second: TSelected) => number
    ): IQueryable<T> {
        var result = this.toArray();
        if (result.length === 0) return result.query();
    
        var comparer: Function;
        if (comparison) {
            comparer = comparison;
        } else {
            const firstSelected = selector(result[0]);
    
            if (typeof firstSelected === 'number') {
                comparer = compareNumbers
            } else if (typeof firstSelected === 'string') {
                comparer = compareStrings
            } else if (typeof firstSelected === 'boolean') {
                comparer = compareBooleans
            } else if (firstSelected instanceof Date) {
                comparer = compareDates
            } else {
                throw new Error('The sequence cannot be ordered because the types are not comparable.');
            }
        }
    
        result.sort((first, second) => comparer(selector(first), selector(second)));
        return result.query();
    }

    //Returns a queryable ordered by the selected item in descending order.
    //This only works well for number and string.
    //TODO: Make this more efficient.
    orderByDescending<TSelected>(selector: (item: T) => TSelected, comparison?: (first: TSelected, second: TSelected) => number): IQueryable<T> {
        var ordered = this.orderBy(selector, comparison);
        return ordered.where(i => instanceIs.specified(i)).reverse()
            .concat(ordered.where(i => instanceIs.unspecified(i)));
    }

    //Returns the accumulation of the elements in the sequence, starting with a seed.
    aggregate<TAccumulate>(accumulator: (first: TAccumulate, second: T) => TAccumulate, seed?: TAccumulate): TAccumulate {
        var skipFirst = false;
        if (this.hasNone()){
            if (seed === undefined)
                throw new Error('The sequence cannot be aggregated because it is empty.');
            return seed;
        } else {
            if (seed === undefined) {
                skipFirst = true;
                seed = <TAccumulate><any>this.first();
            }
        }
        if (seed !== undefined) {
            var result: TAccumulate = seed
            var firstPass = true;
            this.foreach(item => {
                if (skipFirst && firstPass) {
                    firstPass = false;
                    return;
                }

                result = accumulator(result, item);
            });

            return result;
        } else {
            throw new Error('The sequence cannot be aggregated because the seed could not be defined.');
        }
    }

    //Sums the selected values from the sequence.
    //If the array is empty, undefined is returned.
    sum(selector?: (item: T) => number): number {
        if (this.hasNone())
            return 0;
        if (!selector)
            selector = item => <number><any>item;

        return this.aggregate<number>((first, second) => first + selector(second), 0);
    }

    //Returns the max of the values in the array.
    //If the array is empty, undefined is returned.
    max(selector?: (item: T) => number): number | undefined {
        if (this.hasNone())
            return undefined;
        if (!selector)
            selector = item => <number><any>item;

        var result = this.aggregate<number>((first, second) => {
            var secondValue = selector(second);
            if (first > secondValue)
                return first;
            return secondValue;
        }, -Infinity);

        if (result.is.infinite && this.hasNone(i => selector(i) === result)) {
            return undefined;
        }

        return result;
    }

    //Sums the selected values from the sequence.
    //If the array is empty, undefined is returned.
    min(selector?: (item: T) => number): number | undefined {
        if (this.hasNone())
            return undefined;
        if (!selector)
            selector = item => <number><any>item;

        var result = this.aggregate<number>((first, second) => {
            var secondValue = selector(second);
            if (first < secondValue)
                return first;
            return secondValue;
        }, Infinity);

        if (result.is.infinite && this.hasNone(i => selector(i) === result)) {
            return undefined;
        }

        return result;
    }

    //Returns whether the queryable is empty.
    hasNone(predicate?: (item: T) => boolean): boolean {
        return !this.hasAny(predicate);
    }

    //Returns whether the queryable has any items in it.
    hasAny(predicate?: (item: T) => boolean): boolean {
        predicate = this.coalescePredicate(predicate);
        return this.where(predicate).getEnumerator().moveNext();
    }

    //Returns the first element satisfying the predicate.
    //Throws an exception if empty.
    first(predicate?: (item: T) => boolean): T {
        predicate = this.coalescePredicate(predicate);
        var result = this.where(predicate),
            enumerator = result.getEnumerator();

        mustBe.true(enumerator.moveNext(),
            'The sequence does not have a first element.');

        return enumerator.current;
    }

    //Returns the first element satisfying the predicate, or undefined if empty.
    firstOrDefault(predicate?: (item: T) => boolean): T | undefined {
        predicate = this.coalescePredicate(predicate);
        var result = this.where(predicate),
            enumerator = result.getEnumerator();

        if (!enumerator.moveNext())
            return undefined;

        return enumerator.current;
    }

    //Returns the last element satisfying the predicate.
    //Throws an exception if empty.
    last(predicate?: (item: T) => boolean): T {
        return this.reverse().first(predicate);
    }

    //Returns the last element satisfying the predicate, or undefined if empty.
    lastOrDefault(predicate?: (item: T) => boolean): T | undefined {
        return this.reverse().firstOrDefault(predicate);
    }

    //Returns the only element satisfying the predicate.
    //Throws an exception if more then one satisfy the predicate.
    single(predicate?: (item: T) => boolean): T {
        predicate = this.coalescePredicate(predicate);
        var result = this.where(predicate),
            enumerator = result.getEnumerator();

        mustBe.true(enumerator.moveNext(),
            'The sequence does not have any matching elements.');

        var current = enumerator.current;
        mustBe.false(enumerator.moveNext(),
            'The sequence has more than one matching element.');

        return current;
    }

    //Returns the only element satisfying the predicate, or undefined if empty.
    //Throws an exception if more then one satisfy the predicate.
    singleOrDefault(predicate?: (item: T) => boolean): T | undefined {
        predicate = this.coalescePredicate(predicate);
        var result = this.where(predicate),
            enumerator = result.getEnumerator();

        if (!enumerator.moveNext())
            return undefined;

        var current = enumerator.current;
        mustBe.false(enumerator.moveNext(),
            'The sequence has more than one matching element.');

        return current;
    }

    //Skips up to the specified count, and returns the remaining elements.
    skip(count: number): IQueryable<T> {
        return new SkipQueryable<T>(this, count);
    }

    //Takes up to the specified count, omitting the remaining elements.
    take(count: number): IQueryable<T> {
        return new TakeQueryable<T>(this, count);
    }
    //Returns the item at the specified index.
    at(index: number): T {
        mustBe.true(index >= 0, 'The index must be a positive integer.');

        var rest = this.skip(index);
        mustBe.true(rest.hasAny(), 'The index is out of range.');

        return rest.first();
    }

    //Concatenates this query with the other query.
    concat(other: IEnumerable<T>): IQueryable<T> {
        var enumerables = [this, other].query();
        return new ConcatQueryable<T>(enumerables);
    }

    //Returns the distinct elements of a sequence.
    //The elements are sorted if they are of type number, string, boolean, or Date.
    distinct(): IQueryable<T> {
        var map = new Dictionary<T, boolean>();
        var enumerator = this.getEnumerator();

        while (enumerator.moveNext()) {
            map.add(enumerator.current, true);
        }

        const keys = map.getKeys().toArray();

        // Check if the array is empty
        if (keys.length === 0) {
            return keys.query();
        }

        // Determine the type of elements in the sequence
        const firstElement = keys[0];

        if (typeof firstElement === 'number' || 
            typeof firstElement === 'string' || 
            typeof firstElement === 'boolean' || 
            firstElement instanceof Date) {
            // Sort the distinct elements using orderBy
            return keys.query().orderBy(item => item);
        }

        return keys.query();
    }


    //Reverses the order of the sequence.
    reverse(): IQueryable<T> {
        return this.toArray().reverse().query();
    }

    //Returns a dictionary with the specified keys and values selected from the sequence.
    toDictionary<TKey, TValue>(
        keySelector: (item: T) => TKey,
        valueSelector: (item: T) => TValue):
        Dictionary<TKey, TValue> {
        var array = this.toArray(),
            length = array.length,
            result = new Dictionary<TKey, TValue>(length),
            current: T,
            key: TKey,
            value: TValue;

        for (var i = 0; i < length; i++) {
            current = array[i];
            key = keySelector(current);
            value = valueSelector(current);
            result.add(key, value);
        }

        return result;
    }

    //Returns an executed version of the query which can be passed around without risk of redundant calculation.
    execute(): IQueryable<T> {
        return this.result().query();
    }

    //Return the result of executing the query, as a basi JavaScript array.
    result(): Array<T> {
        return this.toArray();
    }

    private coalescePredicate(predicate?: (item: T) => boolean): (item: T) => boolean {
        return predicate ?? ((item: T) => true);
    }
}

class QueryableEnumerator<T, TSelected> implements IEnumerator<TSelected> {
    private _enumerator: IEnumerator<T>;
    private _iterator: (enumerator: IEnumerator<T>) => boolean;
    private _selector: (item: T) => TSelected;

    constructor(
        enumerator: IEnumerator<T>,
        iterator: (enumerator: IEnumerator<T>) => boolean,
        selector: (item: T) => TSelected) {
        this._enumerator = enumerator;
        this._iterator = iterator;
        this._selector = selector;
    }

    get current(): TSelected {
        return this._selector(this._enumerator.current);
    }

    moveNext(): boolean {
        return this._iterator(this._enumerator);
    }
}

class WhereQueryable<T> extends Queryable<T> {
    private _predicate: (item: T) => boolean;

    constructor(enumerable: IEnumerable<T>, predicate: (item: T) => boolean) {
        super(enumerable);
        this._predicate = predicate;
    }

    getEnumerator(): IEnumerator<T> {
        const predicate = this._predicate;
        const enumerator = this._enumerable.getEnumerator();

        return new QueryableEnumerator<T, T>(
            enumerator,
            (enumerator) => {
                while (enumerator.moveNext()) {
                    if (predicate(enumerator.current)) {
                        return true;
                    }
                }
                return false;
            },
            item => item
        );
    }
}

class SelectQueryable<T, TSelected> extends Queryable<TSelected> {
    private _selector: (item: T) => TSelected;
    private _selectedEnumerable: IEnumerable<T>;

    constructor(enumerable: IEnumerable<T>, selector: (item: T) => TSelected) {
        super(new Array<TSelected>());
        this._selector = selector;
        this._selectedEnumerable = enumerable;
    }

    getEnumerator(): IEnumerator<TSelected> {
        return new QueryableEnumerator<T, TSelected>(
            this._selectedEnumerable.getEnumerator(),
            enumerator => enumerator.moveNext(),
            this._selector
        );
    }
}

class SkipQueryable<T> extends Queryable<T> {
    private _count: number;

    constructor(enumerable: IEnumerable<T>, count: number) {
        super(enumerable);
        mustBe.false(count < 0, 'The number of elements to skip must be greater than zero.');
        this._count = count;
    }

    getEnumerator(): IEnumerator<T> {
        let currentCount = 0;
        return new QueryableEnumerator<T, T>(
            this._enumerable.getEnumerator(),
            (enumerator) => {
                while (enumerator.moveNext()) {
                    currentCount++;
                    if (currentCount > this._count) {
                        return true;
                    }
                }
                return false;
            },
            item => item
        );
    }
}

class TakeQueryable<T> extends Queryable<T> {
    private _count: number;

    constructor(enumerable: IEnumerable<T>, count: number) {
        super(enumerable);
        mustBe.false(count < 0, 'The number of elements to take must be greater than zero.');
        this._count = count;
    }

    getEnumerator(): IEnumerator<T> {
        let currentCount = 0;
        return new QueryableEnumerator<T, T>(
            this._enumerable.getEnumerator(),
            (enumerator) => {
                if (currentCount < this._count && enumerator.moveNext()) {
                    currentCount++;
                    return true;
                }
                return false;
            },
            item => item
        );
    }
}

class ConcatQueryable<T> extends Queryable<T> {
    private _enumerables: IEnumerable<IEnumerable<T>>;

    constructor(enumerables: IEnumerable<IEnumerable<T>>) {
        super([]);
        this._enumerable = this;
        this._enumerables = enumerables;
    }

    getEnumerator(): IEnumerator<T> {
        const enumerators = this._enumerables.query()
            .where(e => instanceIs.specified(e))
            .select(e => e.getEnumerator());

        return new ConcatQueryableEnumerator<T>(
            <IQueryable<IEnumerator<T>>><any>enumerators
        );
    }
}

class ConcatQueryableEnumerator<T> implements IEnumerator<T> {
    private _enumerator: IEnumerator<T> | undefined = undefined;
    private _outerEnumerator: IEnumerator<IEnumerator<T>>;

    constructor(enumerators: IQueryable<IEnumerator<T>>) {
        this._outerEnumerator = enumerators.getEnumerator();
        if (this._outerEnumerator.moveNext()) {
            this._enumerator = this._outerEnumerator.current;
        }
    }

    get current(): T {
        mustBe(this._enumerator);
        if (this._enumerator !== undefined) {
            return this._enumerator.current;
        } else {
            throw new Error();
        }
    }

    moveNext(): boolean {
        if (this._enumerator === undefined) {
            return false;
        }
        if (this._enumerator.moveNext()) {
            return true;
        }
        if (this._outerEnumerator.moveNext()) {
            this._enumerator = this._outerEnumerator.current;
            return this.moveNext();
        }
        this._enumerator = undefined;
        return false;
    }
}

/**
 A collection of utilities for working with objects that implement IEnumerable<T>
 @seealso IEnumerable<T>
*/
export class Enumerable {

    constructor() { 
        mustBe.staticClass();
    }

    static empty<T>(): IEnumerable<T> {
        return [];
    }

    //Returns numbers from 0, incremented by 1 or -1, to the end number.
    static range(end: number): IEnumerable<number>;

    //Returns numbers from the start number, incremented by 1 or -1, to the end number.
    static range(start: number, end: number): IEnumerable<number>;

    //Returns numbers from the start number, incrememted by the increment number, to the end number.
    static range(start: number, increment: number, end: number): IEnumerable<number>;

    //Returns numbers from the start number, incrememted by the increment number, to the end number.
    static range(startOrEnd: number, incrementOrEnd?: number, end?: number): IEnumerable<number> {
        let start: number, increment: number, finalEnd: number;
    
        // Handle overloads
        if (end === undefined) {
            // Two-argument form: range(start, end)
            finalEnd = incrementOrEnd !== undefined ? incrementOrEnd : startOrEnd;
            start = incrementOrEnd !== undefined ? startOrEnd : 0;
            increment = finalEnd < start ? -1 : 1;
        } else {
            // Three-argument form: range(start, increment, end)
            start = startOrEnd;
            increment = incrementOrEnd!;
            finalEnd = end;
        }
    
        // Assert conditions for increment
        mustBe.false(increment === 0, 'The increment cannot be zero.');
        mustBe.false(increment > 0 && start > finalEnd, 'Invalid range with positive increment.');
        mustBe.false(increment < 0 && start < finalEnd, 'Invalid range with negative increment.');
    
        // Generate the range
        const result: number[] = [];
        for (let value = start; (increment > 0 ? value <= finalEnd : value >= finalEnd); value += increment) {
            result.push(value);
        }
    
        return result as IEnumerable<number>;
    }  

    static forEach<T>(items: IEnumerable<T>, operation: (item: T) => void) {
        var enumerator = items.getEnumerator(),
            current: T;

        while (enumerator.moveNext()) {
            var current = enumerator.current;
            operation.bind(current)(current);
        }
    }
}

export class ArrayEnumerator<T> extends Object implements IEnumerator<T> {

    _index = -1;
    _array: T[];

    constructor(array: T[]) {
        super();
        mustBe.array(array);
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

function compareNumbers(first: number | undefined | undefined, second: number | undefined | undefined): number {
    if (instanceIs.unspecified(first) && instanceIs.unspecified(second)) return 0;
    if (instanceIs.unspecified(first)) return -1;
    if (instanceIs.unspecified(second)) return 1;
    return (first as number) - (second as number);
}

function compareStrings(first: string | undefined | undefined, second: string | undefined | undefined): number {
    if (instanceIs.unspecified(first) && instanceIs.unspecified(second)) return 0;
    if (instanceIs.unspecified(first)) return -1;
    if (instanceIs.unspecified(second)) return 1;
    return (first as string).localeCompare(second as string);
}

function compareBooleans(first: boolean | undefined | undefined, second: boolean | undefined | undefined): number {
    if (instanceIs.unspecified(first) && instanceIs.unspecified(second)) return 0;
    if (instanceIs.unspecified(first)) return -1;
    if (instanceIs.unspecified(second)) return 1;
    return first === second ? 0 : first ? 1 : -1;
}

function compareDates(first: Date | undefined | undefined, second: Date | undefined | undefined): number {
    if (instanceIs.unspecified(first) && instanceIs.unspecified(second)) return 0;
    if (instanceIs.unspecified(first)) return -1;
    if (instanceIs.unspecified(second)) return 1;
    return (first as Date).getTime() - (second as Date).getTime();
}

export class Hash {
    /*  
    Returns a numeric hash for a boolean value.
    @param [key] {boolean} The value to hash
    @return {number} 1 for true and 0 for false.
    @remarks undefined checking is excluded for performance.
    */
    static forBoolean(key: boolean): number {
        return +key;
    }

    /*  
    Returns a numeric hash for a numeric value.
    @param [key] {} The value to hash
    @param [seed?] {number} A positive integer seed to generate the hash.
    @return {number} 1 for true and 0 for false.
    @remarks 
        Null checking is excluded for performance.
        The default seed is 37.
    */
    static forNumber(key: number, seed?: number): number {
        return Hash.forString(key.toString(), seed);
    }

    /**
     JavaScript Implementation of MurmurHash3 (r136) (as of May 20, 2011)
    @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
    @see http://github.com/garycourt/murmurhash-js
    @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
    @see http://sites.google.com/site/murmurhash/ 
    @param [key] {string} The string to hash.
    @param [seed?] {number} A positive integer seed to generate the hash.
    @return {number} 32-bit positive integer hash 
    @remarks 
        Null checking is excluded for performance. 
        The string must be ASCII only.
        The default seed is 37.
    */
    static forString(key: string, seed?: number): number {
        if (seed === undefined)
            seed = 37;

        var remainder, bytes, h1, h1b, c1, c1b, c2, c2b, k1, i;

        remainder = key.length & 3; // key.length % 4
        bytes = key.length - remainder;
        h1 = seed;
        c1 = 0xcc9e2d51;
        c2 = 0x1b873593;
        i = 0;

        while (i < bytes) {
            k1 =
                ((key.charCodeAt(i) & 0xff)) |
                ((key.charCodeAt(++i) & 0xff) << 8) |
                ((key.charCodeAt(++i) & 0xff) << 16) |
                ((key.charCodeAt(++i) & 0xff) << 24);
            ++i;

            k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
            k1 = (k1 << 15) | (k1 >>> 17);
            k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

            h1 ^= k1;
            h1 = (h1 << 13) | (h1 >>> 19);
            h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
            h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
        }

        k1 = 0;

        switch (remainder) {
            case 3: k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
            case 2: k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
            case 1: k1 ^= (key.charCodeAt(i) & 0xff);

                k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
                k1 = (k1 << 15) | (k1 >>> 17);
                k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
                h1 ^= k1;
        }

        h1 ^= key.length;

        h1 ^= h1 >>> 16;
        h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
        h1 ^= h1 >>> 13;
        h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
        h1 ^= h1 >>> 16;

        return h1 >>> 0;
    }
}