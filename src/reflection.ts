import u from './utilities';
import Assert from './assert';
import { Dictionary } from './collections';

class LanguageConstruct {
    public get name(): string { throw Assert.notImplemented(); }
    public get isPublic(): boolean { throw Assert.notImplemented(); }
    public get isPrivate(): boolean { throw Assert.notImplemented(); }
    public get isStatic(): boolean { throw Assert.notImplemented(); }
    public get isInstance(): boolean { throw Assert.notImplemented(); }
    public get environment(): Environment { return environment; }

    constructor(password: number) {
        Assert.isTrue(password === constructorPassword,
            'You do not have permission to create instances of this type.');
    }
}

export class Type extends LanguageConstruct {
    private _ctor: Function;
    private _base: Type = null;
    private _name: string = null;
    private _initialized = false;
    private _properties: PropertyInfo[];
    private _methods: MethodInfo[];
    private _staticProperties: PropertyInfo[];
    private _staticFields: FieldInfo[];
    private _staticMethods: MethodInfo[];
    private _typeConstructor: ConstructorInfo;

    private get _propertiesInherited(): IQueryable<PropertyInfo>  { 
        if (!this._initialized) this._initializeMembers();
        if (!this.baseType || this == typeOf(Object)) 
            return this._properties.query()
        return this._properties.query().concat(this.baseType._propertiesInherited) 
    }

    private get _methodsInherited(): IQueryable<MethodInfo>  { 
        if (!this._initialized) this._initializeMembers();
        if (!this.baseType || this == typeOf(Object)) 
            return this._methods.query()
        return this._methods.query().concat(this.baseType._methodsInherited) 
    }

    get baseType(): Type {
        if (this._base === null) {
            const prototype = Object.getPrototypeOf(this.constructorFunction.prototype);
            if (prototype == null || u.isFunction(!prototype.getType))
                return null;
            this._base = <Type>prototype.getType();
        }
        return this._base;
    }
    get constructorFunction(): Function { return this.constructorValue.functionValue; }
    get constructorValue(): ConstructorInfo { return this._typeConstructor; }
    get isNull() { return false; }
    get isUndefined() { return false; }
    get isAnonymous() { return this.name === "`Anonymous"; }
    get isPublic(): boolean { return !this.isPrivate; }
    get isPrivate(): boolean { return this.name.indexOf('_') === 0 || this.name.indexOf('#') === 0; }
    public get isPrimitive(): boolean { return this === typeOf(Boolean) || this === typeOf(String) || this === typeOf(Number); }
    public get isStatic(): boolean { throw 'isStatic is not valid for a Type.'; }
    public get isInstance(): boolean { throw 'isInstance is not valid for a Type.'; }

    get name(): string {
        if (this._name === null) {
            if (this._ctor !== undefined) this._name = this._ctor.name;
            else this._name = "`Anonymous";
        }
        return this._name;
    }
    
    get prototype(): any { return this._ctor.prototype; }

    constructor(password: number, ctor: Function) {
        super(password);
        this._ctor = ctor;
        this._typeConstructor = new ConstructorInfo(password, this, undefined, ctor);
    }

    equals(other: any): boolean {
        if (u.isNullOrUndefined(other) || !other.is(Type)) return false;
        const otherType = <Type>other;
        return this.constructorFunction === otherType.constructorFunction;
    }
    
    toString(): string { return this.name; }

    create<TInstance>(...args: any[]): TInstance {
        return this.constructorFunction(args);
    }

    getHashCode(): number {
        return (<any>this._ctor).getHashCode();
    }

    getProperties(options?: IMemberOptions): IQueryable<PropertyInfo> {
        if (!this._initialized) this._initializeMembers();
        options = this._initializeMemberOptions(options);
        const properties = options.includeInherited ? this._propertiesInherited : this._properties.query();
        return properties.where(p => this._propertyMatchesOptions(p, options)).distinct();
    }

    getProperty(name: string, options?: IMemberOptions): PropertyInfo {
        Assert.isDefined(name);
        return this.getProperties(options).query().singleOrDefault(f => f.name === name);
    }

    getFields(instance: any, options?: IMemberOptions): IQueryable<FieldInfo> {
        if (!u.isDefined(instance) || !instance.getType().isAssignableTo(this))
            throw Error("The instance passed in is not assignable to type " + this.name);

        options = options = this._initializeMemberOptions(options);
        const fields: FieldInfo[] = [];    
        while (instance) {
            const instanceMembers = Object.getOwnPropertyNames(instance);
    
            for (let i = 0; i < instanceMembers.length; i++) {
                const property = instanceMembers[i];
                const descriptor = Object.getOwnPropertyDescriptor(instance, property);
    
                if (descriptor && !u.isFunction(descriptor.value) && !u.isDefined(descriptor.get) && !u.isDefined(descriptor.set)) {
                    fields.push(new FieldInfo(constructorPassword, property, typeOf(instance.constructor), false));
                }
            }
    
            if (!options.includeInherited) break;
    
            instance = Object.getPrototypeOf(instance);
        }
    
        return fields.query().where(f => this._propertyMatchesOptions(f, options)).distinct();
    }

    getField(instance: any, name: string, options?: IMemberOptions): FieldInfo {
        Assert.isDefined(name);
        return this.getFields(instance, options).query().singleOrDefault(f => f.name === name);
    }

    getMethods(options?: IMemberOptions): IQueryable<MethodInfo> {
        if (!this._initialized) this._initializeMembers();
        options = this._initializeMemberOptions(options);
        const methods = options.includeInherited ? this._methodsInherited : this._methods.query();
        return methods.where(p => this._propertyMatchesOptions(p, options)).distinct();
    }

    getMethod(name: string, options?: IMemberOptions): MethodInfo {
        Assert.isDefined(name);
        return this.getMethods(options).query().singleOrDefault(f => f.name === name);
    }

    getStaticFields(options?: IMemberOptions): IQueryable<FieldInfo> {
        if (!this._initialized) this._initializeMembers();
        options = this._initializeMemberOptions(options);
        return this._staticFields.toArray().query().where(f => this._propertyMatchesOptions(f, options)).distinct();
    }

    getStaticField(name: string, options?: IMemberOptions): FieldInfo {
        Assert.isDefined(name);
        return this.getStaticFields(options).query().singleOrDefault(f => f.name === name);
    }

    getStaticProperties(options?: IMemberOptions): IQueryable<PropertyInfo> {
        if (!this._initialized) this._initializeMembers();
        options = this._initializeMemberOptions(options);
        return this._staticProperties.toArray().query().where(p => this._propertyMatchesOptions(p, options)).distinct();
    }

    getStaticProperty(name: string, options?: IMemberOptions): PropertyInfo {
        Assert.isDefined(name);
        return this.getStaticProperties(options).query().singleOrDefault(f => f.name === name);
    }

    getStaticMethods(options?: IMemberOptions): IQueryable<MethodInfo> {
        if (!this._initialized) this._initializeMembers();
        options = this._initializeMemberOptions(options);
        return this._staticMethods.toArray().query().where(p => this._propertyMatchesOptions(p, options)).distinct();
    }

    getStaticMethod(name: string, options?: IMemberOptions): MethodInfo {
        Assert.isDefined(name);
        return this.getStaticMethods(options).query().singleOrDefault(f => f.name === name);
    }
    
    isAssignableTo(other: Type): boolean {
        if (u.isNullOrUndefined(other)) return false;

        let ctor = this.constructorFunction, otherCtor = other.constructorFunction, prototype = null;

        while (u.isDefined(ctor)) {
            if (ctor === otherCtor) return true;
            prototype = Object.getPrototypeOf(ctor.prototype);
            if (u.isDefined(prototype)) ctor = prototype['constructor'];
            else ctor = null;
        }
        return false;
    }
    
    isAssignableFrom(other: Type): boolean {
        if (u.isNullOrUndefined(other)) return false;
        return other.isAssignableTo(this);
    }

    private _initializeMembers(): void {
        if (this._initialized) return;
    
        this._properties = [];
        this._methods = [];
        this._staticProperties = [];
        this._staticFields = [];
        this._staticMethods = [];
    
        const instance = this._ctor.prototype;
        const staticMembers = Object.getOwnPropertyNames(this._ctor);
    
        for (let i = 0; i < staticMembers.length; i++) {
            const property = staticMembers[i];
            const descriptor = Object.getOwnPropertyDescriptor(this._ctor, property);
        
            if (descriptor) {
                if (u.isFunction(descriptor.value)) {
                    this._staticMethods.push(new MethodInfo(constructorPassword, property, typeOf(this._ctor), descriptor, descriptor.writable, <Function>descriptor.value, true));
                } else if (!u.isDefined(descriptor.get) && !u.isDefined(descriptor.set)) {
                    this._staticFields.push(new FieldInfo(constructorPassword, property, typeOf(this._ctor), true));
                } else {
                    this._staticProperties.push(new PropertyInfo(constructorPassword, property, typeOf(this._ctor), descriptor, u.isDefined(descriptor.get), u.isDefined(descriptor.set), false, false, true));
                }
            }
        }
        
    
        const instanceMembers = Object.getOwnPropertyNames(instance);
        for (let i = 0; i < instanceMembers.length; i++) {
            const property = instanceMembers[i];
            const descriptor = Object.getOwnPropertyDescriptor(instance, property);
    
            if (descriptor) {
                if (u.isFunction(descriptor.value)) {
                    this._methods.push(new MethodInfo(constructorPassword, property, typeOf(instance.constructor), descriptor, descriptor.writable, <Function>descriptor.value, false));
                } else {
                    this._properties.push(new PropertyInfo(constructorPassword, property, typeOf(instance.constructor), descriptor, u.isDefined(descriptor.get), u.isDefined(descriptor.set), false, false, false));
                }
            }
        }
    
        this._initialized = true;
    }
    
    private _initializeMemberOptions(options: IMemberOptions): IMemberOptions {
        if (!options) options = {};
        if (!u.isDefined(options.includePublic) && !u.isDefined(options.includePrivate)) options.includePublic = true;
        if (!u.isDefined(options.includeInherited)) options.includeInherited = true;
        return options;
    }

    private _propertyMatchesOptions(property: PropertyInfo, options: IMemberOptions): boolean {  
        Assert.isDefined(property);
        if (options.includePublic && property.isPublic) return true;
        else if (options.includePrivate && property.isPrivate) return true;
        else return false;
    }
    
    public static get undefined(): Type { return undefinedType; } 

    static getType(ctor: Function): Type {  
        if (!u.isFunction(ctor)) return Type.undefined;  
        if (!isType(ctor)) return Type.undefined;  
        let type = types.getValue(ctor);  
        if (!type) {  
            type = new Type(constructorPassword, ctor);  
            types.add(ctor, type);  
        }  
        return type;  
    }
    
    static isEnum(enumCandidate: any): boolean {  
        if (!u.isObject(enumCandidate)) return false;  
        const propertyNames = Object.getOwnPropertyNames(enumCandidate);  
        const numberProperties = propertyNames.query().where(p => /^[0-9]+$/.test(p)).result();  
        const numberPropertiesCount = numberProperties.count();  
        if (numberPropertiesCount === 0 || (numberPropertiesCount * 2 !== propertyNames.length)) {  
            return false;  
        }  
        for (const n of numberProperties) {  
            if (enumCandidate[n] === undefined) return false;  
        }  
        return true;  
    }
}

class UndefinedType extends Type {
    get isUndefined() { return true; }
    get name() { return "`Undefined"; }

    constructor(password: number) {
        super(password, undefined);
    }
}

class Environment extends LanguageConstruct {

    private _name: string;
    private _scope: any;
    private _types: IEnumerable<Type>;
    private _functions: IEnumerable<FunctionInfo>;
    private _variables: IEnumerable<VariableInfo>;

    get name(): string { return this._name; }
    get isPublic(): boolean { return true; }
    get isPrivate(): boolean { return false; }
    get isStatic(): boolean { throw 'isStatic is not valid for a Type.'; }
    get isInstance(): boolean { throw 'isInstance is not valid for a Type.'; }
    get scope(): any { return this._scope; }

    constructor(password: number, name: string, scope: any) {
        super(password);
        this._name = name;
        this._scope = scope;
    }

    getTypes(): IQueryable<Type> {
        if (!this._types) this._types = this._initializeTypes();
        return this._types.toArray().query();
    }

    getFunctions(): IQueryable<FunctionInfo> {
        if (!this._functions) this._functions = this._initializeFunctions();
        return this._functions.toArray().query();
    }

    getFunction(name: string): FunctionInfo {
        Assert.isDefined(name);
        return (<IQueryable<FunctionInfo>>this.getFunctions.apply(this)).query().singleOrDefault(p => p.name === name);
    }

    getVariables(): IQueryable<VariableInfo> {
        if (!this._variables) this._variables = this._initializeVariables();
        return this._variables.toArray().query();
    }

    getVariable(name: string): VariableInfo {
        Assert.isDefined(name);
        return (<IQueryable<VariableInfo>>this.getVariables.apply(this)).query().singleOrDefault(p => p.name === name);
    }

    private _initializeTypes(): IEnumerable<Type> {
        const initializedTypes = [];
        const scopeProperties = Object.getOwnPropertyNames(environment.scope);

        for (let i = 0; i < scopeProperties.length; i++) {
            const propertyName = scopeProperties[i];
            if (propertyName == 'constructor' || propertyName.indexOf('_') === 0) continue;
            const property = this._scope[propertyName];
            if (isType(property)) {
                let ctor = <Function>property;
                let type = types.getValue(ctor);
                if (type === undefined) {
                    type = new Type(constructorPassword, ctor);
                    types.add(ctor, type);
                }
                initializedTypes.push(type);
            }
        }

        return initializedTypes;
    }

    private _initializeFunctions(): IEnumerable<FunctionInfo> {
        const initializedFunctions = [];
        const scopeProperties = Object.getOwnPropertyNames(this._scope);

        for (let i = 0; i < scopeProperties.length; i++) {
            const propertyName = scopeProperties[i];
            const property = this._scope[propertyName];
            if (!isType(property) && u.isFunction(property)) {
                const func = new FunctionInfo(constructorPassword, propertyName, true, <Function>property);
                initializedFunctions.push(func);
            }
        }

        return initializedFunctions;
    }

    private _initializeVariables(): IEnumerable<VariableInfo> {
        const initializedVariables = [];
        const scopeProperties = Object.getOwnPropertyNames(this._scope).query().where(p => p !== '_hashCode').toArray();

        for (let i = 0; i < scopeProperties.length; i++) {
            const propertyName = scopeProperties[i];
            const property = this._scope[propertyName];
            if (!u.isFunction(property)) {
                const variable = new VariableInfo(constructorPassword, propertyName, property);
                initializedVariables.push(variable);
            }
        }

        return initializedVariables;
    }
}

function isType(typeCandidate: any): boolean {
    return typeCandidate === Object ||
        (u.isFunction(typeCandidate) && u.isDefined(typeCandidate.prototype) && !u.isEmptyObject(typeCandidate.prototype));
}

class PropertyInfo extends LanguageConstruct {

    private _name: string;
    private _declaringType: Type;
    private _isStatic: boolean;
    private _canWrite: boolean;
    private _canRead: boolean;
    private _isMethod: boolean;
    private _isField: boolean;
    private _propertyDescriptor: PropertyDescriptor;

    get name(): string { return this._name; }
    get declaringType(): Type { return this._declaringType; }
    get isStatic(): boolean { return this._isStatic; }
    get isPublic(): boolean { return !this.isPrivate; }
    get isPrivate(): boolean { return this.name.indexOf('_') === 0; }
    get canWrite(): boolean { return this._canWrite; }
    get canRead(): boolean { return this._canRead; }
    get enumerable(): boolean { return !!(this._propertyDescriptor && this._propertyDescriptor.enumerable); }
    get configurable(): boolean { return !!(this._propertyDescriptor && this._propertyDescriptor.configurable); }
    public get isMethod(): boolean { return this._isMethod; }
    get isField(): boolean { return this._isField; }

    constructor(password: number, name: string, declaringType: Type, propertyDescriptor: PropertyDescriptor, canRead: boolean, canWrite: boolean, isMethod: boolean, isField: boolean, isStatic: boolean) {
        super(password);
        this._name = name;
        this._declaringType = declaringType;
        this._isStatic = isStatic;
        this._canWrite = canWrite;
        this._canRead = canRead;
        this._isMethod = isMethod;
        this._isField = isField;
        this._propertyDescriptor = propertyDescriptor;
    }

    getValue(instance: any): any {
        Assert.isDefined(instance);
        if (!this.canRead) throw new Error('The property cannot be read.');
        if (this.isStatic) return this.declaringType.constructorFunction[this.name];
        const type = typeOf(instance.constructor);
        const property = type.getProperty(this.name);
        if (u.isNullOrUndefined(property)) throw u.format('The property does not exist on type {0}.', type.name);
        const instanceType = <Type>instance.getType();
        if (instanceType && instanceType.constructorFunction !== instance.constructor) {
            let prototype = instanceType.prototype;
            while (prototype) {
                if (instanceType.constructorFunction === prototype.constructor) return prototype[this.name];
                const prototypeType = <Type>prototype.getType();
                prototype = prototypeType ? prototypeType.prototype : undefined;
            }
        }
        return instance[this.name];
    }

    setValue(instance: any, value: any): void {
        Assert.isDefined(instance);
        if (this.isStatic) {
            this.declaringType.constructorFunction[this.name] = value;
            return;
        }
        const type = typeOf(instance.constructor);
        const property = type.getProperty(this.name);
        if (u.isNullOrUndefined(property)) throw u.format('The property does not exist on type {0}.', type.name);
        else if (!this.canWrite) throw 'The property cannot be written to.';
        instance[this.name] = value;
    }

    toString(): string { return this.name; }

    static exists<TInstance, TProperty>(instance: TInstance, selector: (instance: TInstance) => TProperty): boolean {
        Assert.isDefined(instance);
        Assert.isDefined(selector);
        const propertyName = Expression.getProperty(selector);
        if (instance.getType) {
            const instanceType = <Type>instance.getType();
            const property = instanceType.getProperty(propertyName);
            if (property) return true;
        }
        return false;
    }
}

class FieldInfo extends PropertyInfo {

    get isPublic(): boolean { return !this.isPrivate; }
    get isPrivate(): boolean { return this.name.indexOf('_') === 0; }

    constructor(password: number, name: string, declaringType: Type, isStatic: boolean) {
        super(password, name, declaringType, null, true, true, false, true, isStatic);
    }

    getValue(instance: any): any {
        Assert.isDefined(instance);
        if (this.isStatic) return this.declaringType.constructorFunction[this.name];
        const type = typeOf(instance.constructor);
        const property = type.getProperty(this.name);
        if (u.isNullOrUndefined(property)) throw u.format('The property does not exist on type {0}.', type.name);
        else if (!property.canRead) throw 'The property cannot be read.';
        const instanceType = <Type>instance.getType();
        if (instanceType && instanceType.constructorFunction !== instance.constructor) {
            let prototype = instanceType.prototype;
            while (prototype) {
                if (instanceType.constructorFunction === prototype.constructor) return prototype[this.name];
                const prototypeType = <Type>prototype.getType();
                prototype = prototypeType ? prototypeType.prototype : undefined;
            }
        }
        return instance[this.name];
    }

    setValue(instance: any, value: any): void {
        Assert.isDefined(instance);
        if (this.isStatic) {
            this.declaringType.constructorFunction[this.name] = value;
            return;
        }
        const type = typeOf(instance.constructor);
        const property = type.getProperty(this.name);
        if (u.isNullOrUndefined(property)) throw u.format('The property does not exist on type {0}.', type.name);
        else if (!this.canWrite) throw 'The property cannot be written to.';
        instance[this.name] = value;
    }
}

class VariableInfo extends PropertyInfo {

    private _value: any;

    get environment(): Environment { return environment; }
    get variableValue(): any { return this._value; }

    constructor(password: number, name: string, value: any) {
        super(password, name, null, null, true, true, false, false, true);
        this._value = value;
    }
}

class MethodInfo extends PropertyInfo {

    private _underlyingFunction: Function;
    private _parameters: IEnumerable<ParameterInfo>;

    get functionValue(): Function { return this._underlyingFunction; }

    constructor(password: number, name: string, declaringType: Type, propertyDescriptor: PropertyDescriptor, canWrite: boolean, underlyingFunction: Function, isStatic: boolean) {
        super(password, name, declaringType, propertyDescriptor, true, canWrite, true, false, isStatic);
        this._underlyingFunction = underlyingFunction;
    }

    invoke(instance: any, ...args: any[]): any {
        if (this.isStatic) {
            const ctor = this.declaringType.constructorFunction;
            return ctor[this.name].apply(ctor, args);
        }

        Assert.isDefined(instance);
        const type = typeOf(instance.constructor);
        const method = type.getMethod(this.name);

        if (u.isNullOrUndefined(method)) throw u.format('The method does not exist on type {0}.', type.name);
        return instance[this.name].apply(instance, args);
    }

    getParameters(): IQueryable<ParameterInfo> {
        if (!this._parameters) this._parameters = this._initializeParameters();
        return this._parameters.toArray().query();
    }

    private _initializeParameters(): IEnumerable<ParameterInfo> {
        const initializedParameters = [];
        const parameterNames = Expression.getArguments(this._underlyingFunction);

        for (let i = 0; i < parameterNames.length; i++) {
            const parameterName = parameterNames[i];
            const parameter = new ParameterInfo(constructorPassword, parameterName, i, this);
            initializedParameters.push(parameter);
        }

        return initializedParameters;
    }
}

class ConstructorInfo extends MethodInfo {

    constructor(password: number, declaringType: Type, propertyDescriptor: PropertyDescriptor, underlyingFunction: Function) {
        super(password, 'constructor', declaringType, propertyDescriptor, false, underlyingFunction, false);
    }
}

class FunctionInfo extends MethodInfo {

    constructor(password: number, name: string, canWrite: boolean, underlyingFunction: Function) {
        super(password, name, null, null, canWrite, underlyingFunction, true);
    }
}

class ParameterInfo {

    private _name: string;
    private _position: number;
    private _declaringMethod: MethodInfo;

    get name(): string { return this._name; }
    get position(): number { return this._position; }
    get declaringMethod(): MethodInfo { return this._declaringMethod; }

    constructor(password: number, name: string, position: number, declaringMethod: MethodInfo) {
        Assert.isTrue(password === constructorPassword, 'You do not have permission to create instances of this type.');
        Assert.isDefined(declaringMethod);

        this._name = name;
        this._position = position;
        this._declaringMethod = declaringMethod;
    }

    toString(): string { return this.name; }
}

class Expression {

    static getProperty<TInstance>(instance: TInstance, selector: (instance: TInstance) => any): string;
    static getProperty<TInstance>(selector: (instance: TInstance) => any): string;
    static getProperty(arg1: any, arg2?: any): string {
        let selector: Function = arg1;
        if (arguments.length > 1) selector = arg2;

        const selectorString = selector.toString().replace(/\s+/g, ' ').trim();
        const propertyPattern = /(?:[_$a-zA-Z][_$a-zA-Z0-9]*)\.([_$a-zA-Z][_$a-zA-Z0-9]*)|[_$a-zA-Z][_$a-zA-Z0-9]*\[['"]([^'"]+)['"]\]/;
        const matches = propertyPattern.exec(selectorString);

        Assert.isDefined(matches, 'The property selector was not properly defined.');
        
        const property = matches[1] || matches[2];
        Assert.isDefined(property, 'The property selector was not properly defined.');

        return property;
    }

    static getArguments(func: Function): Array<string> {
        Assert.isDefined(func, 'The function was not specified.');

        const functionString = func.toString().replace(/\s+/g, ' ').trim();

        const functionPattern = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
        const arrowFunctionPattern = /^\(?\s*([^\)]*)\)?\s*=>/m;
        const methodPattern = /^[a-zA-Z_]\w*\s*\(\s*([^\)]*)\)/m;

        const match = functionPattern.exec(functionString)
            || arrowFunctionPattern.exec(functionString)
            || methodPattern.exec(functionString);

        Assert.isDefined(match, 'The function arguments could not be parsed.');

        const argumentString = match[1].trim();
        if (argumentString.length === 0) return [];

        return argumentString.split(/\s*,\s*/).map(arg => arg.trim());
    }

    static getElementByClass(elementName: string, ...classes: string[]): NodeList {
        Assert.isDefined(elementName);

        const selectors = classes
            .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
            .map(className => `${elementName}.${className}`)
            .join(', ');

        return document.querySelectorAll(selectors);
    }
}

const constructorPassword = Math.random();
export const environment = new Environment(constructorPassword, 'Global', globalThis);
const undefinedType = new UndefinedType(constructorPassword);
const types = new Dictionary<Function, Type>(5000);