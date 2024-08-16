import Assert from './assert';

const toString = Object.prototype.toString;
const slice = Array.prototype.slice;

export default class Utilities {
    static areEqual(first: any, second: any): boolean {
        if (this.isDefined(first) && this.isDefined(first.equals)) return <boolean>first.equals(second);
        if (this.isDefined(second) && this.isDefined(second.equals)) return <boolean>second.equals(first);

        return first === second;
    }

    static argumentsToArray<T>(args: IArguments): Array<T> {
        return Array.prototype.slice.call(args, 0);
    }

    static coalesce<T>(value: T | null | undefined, alternative: T): T {
        return value === null || value === undefined ? alternative : value;
    }

    static extend(destination: any, source: any): any {
        Assert.isDefined(destination);
        Assert.isDefined(source);

        for (let property in source) {
            destination[property] = source[property];
        }
        return destination;
    }

    static format(template: string, ...inputs: any[]): string {
        Assert.isDefined(template, 'The template is not defined.');
        let result = '',
            current: string,
            lookAhead: string,
            startIndex = 0,
            endIndex: number,
            inTemplate = false,
            length = template.length,
            maxIndex = length - 1,
            inputIndex: number,
            inputValue: any;

        for (let i = 0, length = template.length; i < length; i++) {
            current = template[i];
            if (!inTemplate && current === '{') {
                lookAhead = i <= maxIndex ? template[i + 1] : '';
                if (lookAhead === '{') {
                    endIndex = i;
                    result += template.substr(startIndex, endIndex - startIndex + 1);
                    startIndex = i + 2;
                    i++;
                } else {
                    inTemplate = true;
                    endIndex = i - 1;
                    result += template.substr(startIndex, endIndex - startIndex + 1);
                    startIndex = i + 1;
                }
            } else if (inTemplate && current === '}') {
                inTemplate = false;
                endIndex = i - 1;

                inputIndex = +template.substr(startIndex, endIndex - startIndex + 1);
                Assert.isFalse(isNaN(inputIndex), 'The template is not formatted correctly.');
                Assert.isFalse(inputIndex > maxIndex, 'The template contains an index that is out of bounds.');

                inputValue = inputs[inputIndex];
                result += this.isDefined(inputValue) ? inputValue.toString() : '';
                startIndex = i + 1;
            } else if (!inTemplate && current === '}') {
                lookAhead = i <= maxIndex ? template[i + 1] : '';
                Assert.isTrue(lookAhead === '}', 'The template contains a closing bracket without an opening bracket.');

                endIndex = i;
                result += template.substr(startIndex, endIndex - startIndex + 1);
                startIndex = i + 2;
                i++;
            }
        }

        Assert.isFalse(inTemplate, 'The template contains an opening bracket without a closing bracket.');

        if (!inTemplate && startIndex <= maxIndex) {
            endIndex = maxIndex;
            result += template.substr(startIndex, endIndex - startIndex + 1);
        }

        return result;
    }

    static titleCase(title: string, ...exclude: Array<string>): string {
        if (!title) return title;
        title = title.trim();

        const hasPeriod = title[title.length - 1] === '.';
        if (hasPeriod) title = title.substr(0, title.length - 1);

        const words = title.split(' ').filter(w => w.length > 0);
        const excludedWords = new Set(exclude);
        const formattedTitle = words
            .map((word, index) => {
                if (index === 0 || !excludedWords.has(word)) return this.properCaseWord(word);
                return word;
            })
            .join(' ');

        return hasPeriod ? formattedTitle + '.' : formattedTitle;
    }

    static sentenceCase(sentence: string, ...ignore: Array<string>): string {
        if (!sentence) return sentence;
        sentence = sentence.trim();

        const hasPeriod = sentence[sentence.length - 1] === '.';
        if (hasPeriod) sentence = sentence.substr(0, sentence.length - 1);

        const words = sentence.split(' ').filter(w => w.length > 0);
        const excludedWords = new Set(ignore);
        const formattedSentence = words
            .map((word, index) => {
                if (index === 0) return this.properCaseWord(word);
                return excludedWords.has(word) ? word : word.toLowerCase();
            })
            .join(' ');

        return formattedSentence + '.';
    }

    static getPropertyNames(value: any): Array<string> {
        if (this.isNullOrUndefined(value)) return [];
        if (!this.isObject(value)) value = value.constructor.prototype;

        const properties: any[] = [];
        while (value) {
            properties.push(...Object.getOwnPropertyNames(value));
            value = Object.getPrototypeOf(value);
        }

        return Array.from(new Set(properties));
    }

    static isNull(value: any): boolean {
        return value === null;
    }

    static isUndefined(value: any): boolean {
        return value === undefined;
    }

    static isNullOrUndefined(value: any): boolean {
        return value === null || value === undefined;
    }

    static isDefined(value: any): boolean {
        return value !== null && value !== undefined;
    }

    static isNumber(value: any): boolean {
        return typeof value === 'number' || toString.call(value) === '[object Number]';
    }

    static isNaN(value: any): boolean {
        return Number.isNaN(value);
    }

    static isInfinity(value: any): boolean {
        return value === Infinity || value === -Infinity;
    }

    static isInteger(value: any): boolean {
        return Number.isInteger(value);
    }

    static isString(value: any): boolean {
        return typeof value === 'string' || toString.call(value) === '[object String]';
    }

    static isBoolean(value: any): boolean {
        return typeof value === 'boolean' || toString.call(value) === '[object Boolean]';
    }

    static isTrue(value: any): boolean {
        return value === true;
    }

    static isTruthy(value: any): boolean {
        return !!value;
    }

    static isFalse(value: any): boolean {
        return value === false;
    }

    static isFalsy(value: any): boolean {
        return !value;
    }

    static isObject(value: any): boolean {
        return value !== null && typeof value === 'object';
    }

    static isEmptyObject(value: any): boolean {
        return this.isObject(value) && toString.call(value) === '[object Object]' && !this.hasAdditionalProperties(value);
    }

    static properCaseWord(word: string): string {
        return word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();
    }

    static hasAdditionalProperties(value: any): boolean {
        if (!this.objectProperties) this.objectProperties = this.getPropertyNames({});

        while (value !== Object.prototype) {
            const currentProperties = Object.getOwnPropertyNames(value);
            for (let property of currentProperties) {
                if (this.objectProperties.indexOf(property) < 0) return true;
            }

            value = Object.getPrototypeOf(value);
        }

        return false;
    }

    static objectToString = {}.toString;
    static objectToStringValue = '[object Object]';
    static objectProperties: string[] | null = null;

    static isArray(value: any): boolean {
        return toString.call(value) === '[object Array]';
    }

    static isFunction(value: any): boolean {
        return typeof value === 'function';
    }
}
