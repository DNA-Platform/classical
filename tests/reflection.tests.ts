import '../src/classical';

class TestClass {
    public publicField: string = "publicField";
    public _privateField: number = 42;
    public get publicProperty(): string { return this.publicField; }
    public set publicProperty(value: string) { this.publicField = value; }
    public get _privateProperty(): number { return this._privateField; }
    public set _privateProperty(value: number) { this._privateField = value; }
    public publicMethod(param1: string, param2: number): string { return `${param1}${param2}`; }
    public _privateMethod(): number { return this._privateField; }

    static staticField: string = "staticField";
    static _staticPrivateField: number = 24;
    static get staticProperty(): string { return this.staticField; }
    static set staticProperty(value: string) { this.staticField = value; }
    static get _staticPrivateProperty(): number { return this._staticPrivateField; }
    static set _staticPrivateProperty(value: number) { this._staticPrivateField = value; }
    static staticMethod(param: string): string { return `static-${param}`; }
    static _staticPrivateMethod(): number { return this._staticPrivateField; }
}

class DerivedTestClass extends TestClass {
    public derivedPublicField: string = "derivedPublicField";
    public _derivedPrivateField: number = 84;
    public get derivedPublicProperty(): string { return this.derivedPublicField; }
    public set derivedPublicProperty(value: string) { this.derivedPublicField = value; }
    public get _derivedPrivateProperty(): number { return this._derivedPrivateField; }
    public set _derivedPrivateProperty(value: number) { this._derivedPrivateField = value; }
    public derivedPublicMethod(): string { return "derivedPublicMethod"; }
    public _derivedPrivateMethod(): string { return "derivedPrivateMethod"; }
}

describe('Type System Tests', () => {

    it('should get public fields', () => {
        const testType = typeOf(TestClass);
        const instance = new TestClass();
        const field = testType.getField(instance, 'publicField');
        expect(field.name).toBe('publicField');
        expect(field.isPublic).toBe(true);
    });

    it('should get private fields', () => {
        const testType = typeOf(TestClass);
        const instance = new TestClass();
        const field = testType.getField(instance, '_privateField', { includePrivate: true });
        expect(field.name).toBe('_privateField');
        expect(field.isPrivate).toBe(true);
    });

    it('should get static fields', () => {
        const testType = typeOf(TestClass);
        const staticField = testType.getStaticField('staticField');
        expect(staticField.name).toBe('staticField');
        expect(staticField.isPublic).toBe(true);
    });

    it('should get static private fields', () => {
        const testType = typeOf(TestClass);
        const staticPrivateField = testType.getStaticField('_staticPrivateField', { includePrivate: true });
        expect(staticPrivateField.name).toBe('_staticPrivateField');
        expect(staticPrivateField.isPrivate).toBe(true);
    });

    it('should get public properties', () => {
        const testType = typeOf(TestClass);
        const prop = testType.getProperty('publicProperty');
        expect(prop.name).toBe('publicProperty');
        expect(prop.isPublic).toBe(true);
    });

    it('should get private properties', () => {
        const testType = typeOf(TestClass);
        const prop = testType.getProperty('_privateProperty', { includePrivate: true });
        expect(prop.name).toBe('_privateProperty');
        expect(prop.isPrivate).toBe(true);
    });

    it('should get static properties', () => {
        const testType = typeOf(TestClass);
        const staticProp = testType.getStaticProperty('staticProperty');
        expect(staticProp.name).toBe('staticProperty');
        expect(staticProp.isPublic).toBe(true);
    });

    it('should get static private properties', () => {
        const testType = typeOf(TestClass);
        const staticPrivateProp = testType.getStaticProperty('_staticPrivateProperty', { includePrivate: true });
        expect(staticPrivateProp.name).toBe('_staticPrivateProperty');
        expect(staticPrivateProp.isPrivate).toBe(true);
    });

    it('should get public methods', () => {
        const testType = typeOf(TestClass);
        const method = testType.getMethod('publicMethod');
        expect(method.name).toBe('publicMethod');
        expect(method.isPublic).toBe(true);
    });

    it('should get private methods', () => {
        const testType = typeOf(TestClass);
        const method = testType.getMethod('_privateMethod', { includePrivate: true });
        expect(method.name).toBe('_privateMethod');
        expect(method.isPrivate).toBe(true);
    });

    it('should get static methods', () => {
        const testType = typeOf(TestClass);
        const staticMethod = testType.getStaticMethod('staticMethod');
        expect(staticMethod.name).toBe('staticMethod');
        expect(staticMethod.isPublic).toBe(true);
    });

    it('should get static private methods', () => {
        const testType = typeOf(TestClass);
        const staticPrivateMethod = testType.getStaticMethod('_staticPrivateMethod', { includePrivate: true });
        expect(staticPrivateMethod.name).toBe('_staticPrivateMethod');
        expect(staticPrivateMethod.isPrivate).toBe(true);
    });

    it('should get derived public fields', () => {
        const derivedType = typeOf(DerivedTestClass);
        const instance = new DerivedTestClass();
        const field = derivedType.getField(instance, 'derivedPublicField');
        expect(field.name).toBe('derivedPublicField');
        expect(field.isPublic).toBe(true);
    });

    it('should get derived private fields', () => {
        const derivedType = typeOf(DerivedTestClass);
        const instance = new DerivedTestClass();
        const field = derivedType.getField(instance, '_derivedPrivateField', { includePrivate: true });
        expect(field.name).toBe('_derivedPrivateField');
        expect(field.isPrivate).toBe(true);
    });

    it('should get derived public properties', () => {
        const derivedType = typeOf(DerivedTestClass);
        const prop = derivedType.getProperty('derivedPublicProperty');
        expect(prop.name).toBe('derivedPublicProperty');
        expect(prop.isPublic).toBe(true);
    });

    it('should get derived private properties', () => {
        const derivedType = typeOf(DerivedTestClass);
        const prop = derivedType.getProperty('_derivedPrivateProperty', { includePrivate: true });
        expect(prop.name).toBe('_derivedPrivateProperty');
        expect(prop.isPrivate).toBe(true);
    });

    it('should get derived public methods', () => {
        const derivedType = typeOf(DerivedTestClass);
        const method = derivedType.getMethod('derivedPublicMethod');
        expect(method.name).toBe('derivedPublicMethod');
        expect(method.isPublic).toBe(true);
    });

    it('should get derived private methods', () => {
        const derivedType = typeOf(DerivedTestClass);
        const method = derivedType.getMethod('_derivedPrivateMethod', { includePrivate: true });
        expect(method.name).toBe('_derivedPrivateMethod');
        expect(method.isPrivate).toBe(true);
    });

    it('should verify method parameters', () => {
        const testType = typeOf(TestClass);
        const method = testType.getMethod('publicMethod');
        const parameters = method.getParameters().toArray();
        expect(parameters.length).toBe(2);
        expect(parameters[0].name).toBe('param1');
        expect(parameters[1].name).toBe('param2');
    });

    it('should verify method invocation', () => {
        const testType = typeOf(TestClass);
        const method = testType.getMethod('publicMethod');
        const instance = new TestClass();
        const result = method.invoke(instance, 'test', 123);
        expect(result).toBe('test123');
    });

    it('should verify static method invocation', () => {
        const testType = typeOf(TestClass);
        const staticMethod = testType.getStaticMethod('staticMethod');
        const result = staticMethod.invoke(null, 'staticTest');
        expect(result).toBe('static-staticTest');
    });

    it('should verify method from derived class', () => {
        const derivedType = typeOf(DerivedTestClass);
        const method = derivedType.getMethod('derivedPublicMethod');
        const instance = new DerivedTestClass();
        const result = method.invoke(instance);
        expect(result).toBe('derivedPublicMethod');
    });

    it('should verify that derived class inherits base class members', () => {
        const derivedType = typeOf(DerivedTestClass);
        const derivedInstance = new DerivedTestClass();
        const basePublicField = derivedType.getField(derivedInstance, 'publicField');
        const basePublicMethod = derivedType.getMethod('publicMethod');
        expect(basePublicField).not.toBeNull();
        expect(basePublicMethod).not.toBeNull();
    });
});
