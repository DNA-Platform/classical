import u from './utilities';

export default class Assert {
    static staticClass(): void {
        Assert._builder(false, 'Static classes cannot be instantiated.');
    }

    static isDefined(value: any, message?: string): void {
        Assert._builder(u.isDefined(value), message, 'The value is either null or undefined.');
    }

    static isNullOrUndefined(value: any, message?: string): void {
        Assert._builder(u.isNullOrUndefined(value), message, 'The value is not null or undefined.');
    }

    static isTrue(expression: boolean, message?: string): void {
        Assert._builder(expression === true, message, 'The expression was not True.');
    }

    static isFalse(expression: boolean, message?: string): void {
        Assert._builder(expression === false, message, 'The expression was not False.');
    }

    static isInvalid(message?: string): void {
        Assert._builder(false, message, 'The system is in an invalid state.');
    }

    static notImplemented(message?: string): Error {
        throw new Error(u.coalesce(message, 'The method has not been implemented.'));
    }

    private static _builder(expression: boolean, message?: string, defaultMessage?: string): void {
        if (expression === false) {
            throw new Error(u.coalesce(message, defaultMessage) as string);
        }
    }
}
