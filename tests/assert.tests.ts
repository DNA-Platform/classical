import '@src/index';
import Assert from '@src/assert';

// Helper function to test exceptions
function expectThrow(fn: () => void, expectedMessage: string): void {
    try {
        fn();
    } catch (e) {
        if (e instanceof Error) {
            const actual = e.message;
            const expected = expectedMessage;
            expect(actual).toBe(expected);
        } else {
            throw new Error('Caught exception is not of type Error');
        }
    }
}

test('staticClass should throw an exception declaring a class as static', () => {
    expectThrow(() => Assert.staticClass(), 'Static classes cannot be instantiated.');
});

test('isDefined should not throw if value is defined', () => {
    const value = 1;
    const actual = () => Assert.isDefined(value);
    expect(actual).not.toThrow();
});

test('isDefined should throw if value is null or undefined', () => {
    expectThrow(() => Assert.isDefined(null), 'The value is either null or undefined.');
    expectThrow(() => Assert.isDefined(undefined), 'The value is either null or undefined.');
});

test('isNullOrUndefined should throw if value is defined', () => {
    expectThrow(() => Assert.isNullOrUndefined(1), 'The value is not null or undefined.');
});

test('isNullOrUndefined should not throw if value is null or undefined', () => {
    const actualNull = () => Assert.isNullOrUndefined(null);
    const actualUndefined = () => Assert.isNullOrUndefined(undefined);
    expect(actualNull).not.toThrow();
    expect(actualUndefined).not.toThrow();
});

test('isTrue should not throw if expression is true', () => {
    const actual = () => Assert.isTrue(true);
    expect(actual).not.toThrow();
});

test('isTrue should throw if expression is false', () => {
    expectThrow(() => Assert.isTrue(false), 'The expression was not True.');
});

test('isFalse should not throw if expression is false', () => {
    const actual = () => Assert.isFalse(false);
    expect(actual).not.toThrow();
});

test('isFalse should throw if expression is true', () => {
    expectThrow(() => Assert.isFalse(true), 'The expression was not False.');
});

test('isInvalid should always throw an invalid state exception', () => {
    expectThrow(() => Assert.isInvalid(), 'The system is in an invalid state.');
});

test('notImplemented should throw a not implemented exception', () => {
    expectThrow(() => { throw Assert.notImplemented(); }, 'The method has not been implemented.');
});

test('notImplemented should throw a custom not implemented exception', () => {
    expectThrow(() => { throw Assert.notImplemented('Custom message'); }, 'Custom message');
});
