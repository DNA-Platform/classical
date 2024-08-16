import '@src/index';
import { Dictionary, Queryable, Enumerable, foreach } from '@src/collections';

test('Dictionary.add should add a key-value pair to the dictionary', () => {
    const dictionary = new Dictionary<number, string>();
    dictionary.add(1, 'one');
    const actual = dictionary.getValue(1);
    const expected = 'one';
    expect(actual).toBe(expected);
});

test('Dictionary.remove should remove a key-value pair from the dictionary', () => {
    const dictionary = new Dictionary<number, string>();
    dictionary.add(1, 'one');
    dictionary.remove(1);
    const actual = dictionary.getValue(1);
    const expected = null;
    expect(actual).toBe(expected);
});

test('Dictionary.getValue should return the value of the key if it exists', () => {
    const dictionary = new Dictionary<number, string>();
    dictionary.add(1, 'one');
    const actual = dictionary.getValue(1);
    const expected = 'one';
    expect(actual).toBe(expected);
});

test('Dictionary.getValue should return null if the key does not exist', () => {
    const dictionary = new Dictionary<number, string>();
    const actual = dictionary.getValue(1);
    const expected = null;
    expect(actual).toBe(expected);
});

test('Dictionary.containsKey should return true if the dictionary contains the specified key', () => {
    const dictionary = new Dictionary<number, string>();
    dictionary.add(1, 'one');
    const actual = dictionary.containsKey(1);
    const expected = true;
    expect(actual).toBe(expected);
});

test('Dictionary.containsKey should return false if the dictionary does not contain the specified key', () => {
    const dictionary = new Dictionary<number, string>();
    const actual = dictionary.containsKey(1);
    const expected = false;
    expect(actual).toBe(expected);
});

test('Dictionary.count should return the number of elements in the dictionary', () => {
    const dictionary = new Dictionary<number, string>();
    dictionary.add(1, 'one');
    dictionary.add(2, 'two');
    const actual = dictionary.count();
    const expected = 2;
    expect(actual).toBe(expected);
});

test('Dictionary.getKeys should return a sequence containing the keys of the dictionary', () => {
    const dictionary = new Dictionary<number, string>();
    dictionary.add(1, 'one');
    dictionary.add(2, 'two');
    const keys = dictionary.getKeys().toArray();
    const actual = keys.sort();
    const expected = [1, 2];
    expect(actual).toEqual(expected);
});

describe('foreach', () => {
    test('should iterate over all elements and perform the operation', () => {
        const enumerable = [1, 2, 3]
        let actual = 0;
        const expected = 6;
        const enumerableAgain = foreach(enumerable, item => actual += item);
        expect(expected).toBe(actual);
        expect(enumerable).toBe(enumerableAgain);
    });

    test('should handle empty enumerables correctly', () => {
        const enumerable: number[] = []
        let actual = 0;
        const expected = 0;
        const enumerableAgain = foreach(enumerable, () => actual++);
        expect(expected).toBe(actual);
        expect(enumerable).toBe(enumerableAgain);
    });
});

// Tests for Queryable
describe('Queryable', () => {
    test('count should return the number of elements', () => {
        const queryable = new Queryable<number>([1, 2, 3])
        const expected = 3;
        const actual = queryable.count();
        expect(actual).toBe(expected);
    });

    test('sum should return the sum of elements', () => {
        const queryable = new Queryable<number>([1, 2, 3])
        const expected = 6;
        const actual = queryable.sum();
        expect(actual).toBe(expected);
    });

    test('first should return the first element', () => {
        const queryable = new Queryable<number>([1, 2, 3])
        const expected = 1;
        const actual = queryable.first();
        expect(actual).toBe(expected);
    });

    test('firstOrDefault should return the first element or default', () => {
        const queryable = new Queryable<number>([1, 2, 3])
        const expected = 1;
        const actual = queryable.firstOrDefault();
        expect(actual).toBe(expected);

        const emptyQueryable = new Queryable<number>([])
        const expectedDefault = null;
        const actualDefault = emptyQueryable.firstOrDefault();
        expect(actualDefault).toBe(expectedDefault);
    });

    test('last should return the last element', () => {
        const queryable = new Queryable<number>([1, 2, 3])
        const expected = 3;
        const actual = queryable.last();
        expect(actual).toBe(expected);
    });

    test('lastOrDefault should return the last element or default', () => {
        const queryable = new Queryable<number>([1, 2, 3])
        const expected = 3;
        const actual = queryable.lastOrDefault();
        expect(actual).toBe(expected);

        const emptyQueryable = new Queryable<number>([]);
        const expectedDefault = null;
        const actualDefault = emptyQueryable.lastOrDefault();
        expect(actualDefault).toBe(expectedDefault);
    });

    test('where should filter elements based on predicate', () => {
        const queryable = new Queryable<number>([1, 2, 3, 4, 5]);
        const expected = [2, 4];
        const actual = queryable.where(x => x % 2 === 0).toArray();
        expect(actual).toEqual(expected);
    });

    test('select should transform elements based on selector', () => {
        const queryable = new Queryable<number>([1, 2, 3]);
        const expected = [2, 4, 6];
        const actual = queryable.select(x => x * 2).toArray();
        expect(actual).toEqual(expected);
    });

    test('distinct should return unique elements', () => {
        const queryable = new Queryable<number>([1, 2, 2, 3, 3, 3]);
        const expected = [1, 2, 3];
        const actual = queryable.distinct().orderBy(item => item).toArray();
        expect(actual).toEqual(expected);
    });

    test('reverse should return elements in reverse order', () => {
        const queryable = new Queryable<number>([1, 2, 3]);
        const expected = [3, 2, 1];
        const actual = queryable.reverse().toArray();
        expect(actual).toEqual(expected);
    });
});

describe('Enumerable', () => {
    describe('range', () => {
        test('range should generate a sequence from 0 to end', () => {
            const end = 5;
            const expected = [0, 1, 2, 3, 4, 5];
            const actual = Enumerable.range(end);
            expect(actual).toEqual(expected);
        });

        test('range should generate a sequence from start to end with positive increment', () => {
            const start = 3;
            const end = 7;
            const expected = [3, 4, 5, 6, 7];
            const actual = Enumerable.range(start, end);
            expect(actual).toEqual(expected);
        });

        test('range should generate a sequence from start to end with negative increment', () => {
            const start = 5;
            const increment = -1;
            const end = 1;
            const expected = [5, 4, 3, 2, 1];
            const actual = Enumerable.range(start, increment, end);
            expect(actual).toEqual(expected);
        });

        test('range should generate a single-element sequence when start equals end', () => {
            const start = 4;
            const expected = [4];
            const actual = Enumerable.range(start, start);
            expect(actual).toEqual(expected);
        });

        test('range should throw an error if increment is zero', () => {
            const start = 4;
            const increment = 0;
            const end = 8;
            expect(() => {
                Enumerable.range(start, increment, end);
            }).toThrow('The increment cannot be zero.');
        });
    });

    describe('forEach', () => {
        test('forEach should apply the operation to each item in the sequence', () => {
            const items = [1, 2, 3, 4];
            const results: number[] = [];
            const operation = (item: number) => results.push(item * 2);
            Enumerable.forEach(items, operation);
            const expected = [2, 4, 6, 8];
            const actual = results;
            expect(actual).toEqual(expected);
        });

        test('forEach should handle an empty sequence without errors', () => {
            const items: number[] = [];
            const results: number[] = [];
            const operation = (item: number) => results.push(item * 2);
            Enumerable.forEach(items, operation);
            const expected: number[] = [];
            const actual = results;
            expect(actual).toEqual(expected);
        });
    });
});

describe('Queryable Tests', () => {

    test('should filter and then select items from an array', () => {
        const array = new Queryable<number>([1, 2, 3, 4, 5]);
        const expected = [6, 8, 10];
        const actual = array.where(n => n > 2).select(n => n * 2).result();
        expect(actual).toEqual(expected);
    });

    test('should order items in ascending order and then select them', () => {
        const array = new Queryable<number>([3, 1, 4, 2]);
        const expected = [2, 4, 6, 8];
        const actual = array.orderBy(n => n).select(n => n * 2).result();
        expect(actual).toEqual(expected);
    });

    test('should order items in descending order and then select them', () => {
        const array = new Queryable<number>([3, 1, 4, 2]);
        const expected = [8, 6, 4, 2];
        const actual = array.orderByDescending(n => n).select(n => n * 2).result();
        expect(actual).toEqual(expected);
    });

    test('should filter items from an array and then take the first two', () => {
        const array = new Queryable<number>([1, 2, 3, 4, 5]);
        const expected = [3, 4];
        const actual = array.where(n => n > 2).take(2).result();
        expect(actual).toEqual(expected);
    });

    test('should concatenate two arrays and select distinct items', () => {
        const array1 = new Queryable<number>([1, 2, 3]);
        const array2 = new Queryable<number>([3, 4, 5]);
        const expected = [1, 2, 3, 4, 5];
        const actual = array1.concat(array2).distinct().result();
        expect(actual).toEqual(expected);
    });

    test('should skip the first two elements and return the rest', () => {
        const array = new Queryable<number>([1, 2, 3, 4, 5]);
        const expected = [3, 4, 5];
        const actual = array.skip(2).result();
        expect(actual).toEqual(expected);
    });

    test('should return the maximum number in an array', () => {
        const array = new Queryable<number>([1, 3, 5, 2, 4]);
        const expected = 5;
        const actual = array.max();
        expect(actual).toEqual(expected);
    });

    test('should return the minimum number in an array', () => {
        const array = new Queryable<number>([1, 3, 5, 2, 4]);
        const expected = 1;
        const actual = array.min();
        expect(actual).toEqual(expected);
    });

    test('should return the sum of numbers in an array', () => {
        const array = new Queryable<number>([1, 2, 3, 4, 5]);
        const expected = 15;
        const actual = array.sum();
        expect(actual).toEqual(expected);
    });

    test('should reverse the array and return the first element', () => {
        const array = new Queryable<number>([1, 2, 3, 4, 5]);
        const expected = 5;
        const actual = array.reverse().first();
        expect(actual).toEqual(expected);
    });

    test('should return a dictionary from a queryable array', () => {
        const array = new Queryable<number>([1, 2, 3, 4, 5]);
        const dictionary = array.toDictionary(n => n, n => n * 2);
        const expected = 4;
        const actual = dictionary.getValue(2);
        expect(actual).toEqual(expected);
    });

    test('should select items and then check if any item is greater than 4', () => {
        const array = new Queryable<number>([1, 2, 3, 4, 5]);
        const expected = true;
        const actual = array.select(n => n * 2).hasAny(n => n > 4);
        expect(actual).toBe(expected);
    });

    test('should select items and then check if no item is greater than 10', () => {
        const array = new Queryable<number>([1, 2, 3, 4, 5]);
        const expected = false;
        const actual = array.select(n => n * 2).hasAny(n => n > 10);
        expect(actual).toBe(expected);
    });

    test('should filter items and check if none are less than 2', () => {
        const array = new Queryable<number>([2, 3, 4, 5]);
        const expected = true;
        const actual = array.where(n => n > 1).hasNone(n => n < 2);
        expect(actual).toBe(expected);
    });

    test('should return the only element that satisfies the predicate', () => {
        const array = new Queryable<number>([1, 2, 3, 4, 5]);
        const expected = 3;
        const actual = array.single(n => n === 3);
        expect(actual).toEqual(expected);
    });

    test('should return null if no elements match the predicate', () => {
        const array = new Queryable<number>([1, 2, 3, 4, 5]);
        const expected = null;
        const actual = array.singleOrDefault(n => n === 6);
        expect(actual).toEqual(expected);
    });

    test('should return the first element that matches the predicate or null', () => {
        const array = new Queryable<number>([1, 2, 3, 4, 5]);
        const expected = 4;
        const actual = array.firstOrDefault(n => n > 3);
        expect(actual).toEqual(expected);
    });

    test('should return the last element that matches the predicate', () => {
        const array = new Queryable<number>([1, 2, 3, 4, 5]);
        const expected = 5;
        const actual = array.last(n => n > 3);
        expect(actual).toEqual(expected);
    });

    test('should return a concatenated and distinct list of keys from two dictionaries', () => {
        const dictionary1 = new Dictionary<string, number>();
        dictionary1.add('a', 1).add('b', 2);
        const dictionary2 = new Dictionary<string, number>();
        dictionary2.add('b', 3).add('c', 4);

        const expected = ['a', 'b', 'c'];
        const actual = dictionary1.getKeys().query().concat(dictionary2.getKeys()).distinct().result();
        expect(actual).toEqual(expected);
    });

    test('should filter keys from a dictionary and check if any are greater than b', () => {
        const dictionary = new Dictionary<string, number>();
        dictionary.add('a', 1).add('b', 2).add('c', 3);

        const expected = true;
        const actual = dictionary.getKeys().query().where(k => k > 'b').hasAny(k => k === 'c');
        expect(actual).toBe(expected);
    });
});