import '../src/classical';

// Helper function to create a new array for testing
function createTestArray(): any[] {
    return [];
}

// Tests for equals
test('equals should return true for identical objects', () => {
    const obj1 = {};
    const obj2 = obj1;
    const actual = obj1.equals(obj2);
    const expected = true;
    expect(actual).toBe(expected);
});

test('equals should return false for different objects', () => {
    const obj1 = {};
    const obj2 = {};
    const actual = obj1.equals(obj2);
    const expected = false;
    expect(actual).toBe(expected);
});

// Tests for getHashCode
test('getHashCode should return a number for an object', () => {
    const obj = {};
    const actual = obj.getHashCode();
    const expected = 'number';
    expect(typeof actual).toBe(expected);
});

test('getHashCode should return a consistent hash code for the same object', () => {
    const obj = {};
    const actual1 = obj.getHashCode();
    const actual2 = obj.getHashCode();
    expect(actual1).toBe(actual2);
});

// Tests for add method on Array prototype
test('add should add an item to the array', () => {
    const array = createTestArray();
    array.add(1);
    const actual = array.length;
    const expected = 1;
    expect(actual).toBe(expected);
});

test('add should return the array for chaining', () => {
    const array = createTestArray();
    const actual = array.add(1);
    const expected = array;
    expect(actual).toBe(expected);
});

// Tests for remove method on Array prototype
test('remove should remove all occurrences of an item', () => {
    const array = [1, 2, 3, 2];
    array.remove(2);
    const actual = array;
    const expected = [1, 3];
    expect(actual).toEqual(expected);
});

test('remove should return the array for chaining', () => {
    const array = [1, 2, 3];
    const actual = array.remove(2);
    const expected = array;
    expect(actual).toBe(expected);
});

// Tests for clear method on Array prototype
test('clear should remove all elements from the array', () => {
    const array = [1, 2, 3];
    array.clear();
    const actual = array.length;
    const expected = 0;
    expect(actual).toBe(expected);
});

test('clear should return the array for chaining', () => {
    const array = [1, 2, 3];
    const actual = array.clear();
    const expected = array;
    expect(actual).toBe(expected);
});

// Tests for getType method on Object prototype
test('getType should return the constructor name of an object', () => {
    const obj = {};
    const actual = obj.getType();
    const expected = typeOf(Object);
    expect(actual).toBe(expected);
});

// Tests for getHashCode method on String prototype
test('String.prototype.getHashCode should return a number for a string', () => {
    const str = "hello";
    const actual = str.getHashCode();
    const expectedType = 'number';
    expect(typeof actual).toBe(expectedType);
});

test('String.prototype.getHashCode should return consistent hash code for the same string', () => {
    const str = "hello";
    const actual1 = str.getHashCode();
    const actual2 = str.getHashCode();
    expect(actual1).toBe(actual2);
});

// Tests for getHashCode method on Number prototype
test('Number.prototype.getHashCode should return a number for a number', () => {
    const num = 123;
    const actual = num.getHashCode();
    const expectedType = 'number';
    expect(typeof actual).toBe(expectedType);
});

test('Number.prototype.getHashCode should return consistent hash code for the same number', () => {
    const num = 123;
    const actual1 = num.getHashCode();
    const actual2 = num.getHashCode();
    expect(actual1).toBe(actual2);
});

// Tests for getHashCode method on Boolean prototype
test('Boolean.prototype.getHashCode should return a number for a boolean', () => {
    const bool = true;
    const actual = bool.getHashCode();
    const expectedType = 'number';
    expect(typeof actual).toBe(expectedType);
});

test('Boolean.prototype.getHashCode should return consistent hash code for the same boolean', () => {
    const bool = true;
    const actual1 = bool.getHashCode();
    const actual2 = bool.getHashCode();
    expect(actual1).toBe(actual2);
});

// Tests for addRange method on Array prototype
test('addRange should add multiple items to the array', () => {
    const array = createTestArray();
    const itemsToAdd = [1, 2, 3];
    array.addRange(itemsToAdd);
    const actual = array.length;
    const expected = 3;
    expect(actual).toBe(expected);
});

test('addRange should return the array for chaining', () => {
    const array = createTestArray();
    const itemsToAdd = [1, 2, 3];
    const actual = array.addRange(itemsToAdd);
    const expected = array;
    expect(actual).toBe(expected);
});

// Tests for removeAt method on Array prototype
test('removeAt should remove the item at the specified index', () => {
    const array = [1, 2, 3];
    array.removeAt(1);
    const actual = array;
    const expected = [1, 3];
    expect(actual).toEqual(expected);
});

test('removeAt should return the array for chaining', () => {
    const array = [1, 2, 3];
    const actual = array.removeAt(1);
    const expected = array;
    expect(actual).toBe(expected);
});

// Tests for get method on Array prototype
test('get should return the item at the specified index', () => {
    const array = [1, 2, 3];
    const actual = array.get(1);
    const expected = 2;
    expect(actual).toBe(expected);
});

test('get should throw an error if the index is out of range', () => {
    const array = [1, 2, 3];
    expect(() => array.get(3)).toThrow('The index is out of range.');
});

// Tests for set method on Array prototype
test('set should set the item at the specified index', () => {
    const array = [1, 2, 3];
    array.set(1, 4);
    const actual = array[1];
    const expected = 4;
    expect(actual).toBe(expected);
});

test('set should return the array for chaining', () => {
    const array = [1, 2, 3];
    const actual = array.set(1, 4);
    const expected = array;
    expect(actual).toBe(expected);
});

// Tests for is method on Object prototype
test('is should return true if the object is of the specified type', () => {
    const obj = {};
    const actual = obj.isType(Object);
    const expected = true;
    expect(actual).toBe(expected);
});

test('is should return false if the object is not of the specified type', () => {
    const obj = {};
    const actual = obj.isType(Array);
    const expected = false;
    expect(actual).toBe(expected);
});

// Tests for getEnumerator method on Array prototype
test('getEnumerator should return an enumerator for the array', () => {
    const array = [1, 2, 3];
    const enumerator = array.getEnumerator();
    enumerator.moveNext();
    const actual = enumerator.current;
    const expected = 1;
    expect(actual).toBe(expected);
});

test('getEnumerator should iterate through the array', () => {
    const array = [1, 2, 3];
    const enumerator = array.getEnumerator();
    let result: number[] = [];
    while (enumerator.moveNext()) {
        result.push(enumerator.current);
    }
    const actual = result;
    const expected = [1, 2, 3];
    expect(actual).toEqual(expected);
});

// Tests for count method on Array prototype
test('count should return the number of elements in the array', () => {
    const array = [1, 2, 3];
    const actual = array.count();
    const expected = 3;
    expect(actual).toBe(expected);
});

test('count should return 0 for an empty array', () => {
    const array = createTestArray();
    const actual = array.count();
    const expected = 0;
    expect(actual).toBe(expected);
});

