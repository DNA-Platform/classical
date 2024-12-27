/// <reference path="./classical.d.ts" />
import { mustBe, instanceIs, Lazy } from './util';
import { Dictionary } from './collections';

class LanguageConstruct {
    public get name(): string { throw mustBe.notImplemented(); }
    public get isPublic(): boolean { throw mustBe.notImplemented(); }
    public get isPrivate(): boolean { throw mustBe.notImplemented(); }
    public get isStatic(): boolean { throw mustBe.notImplemented(); }
    public get isInstance(): boolean { throw mustBe.notImplemented(); }
    public get environment(): Environment { return environment; }

    constructor(password: number) {
        try {
        mustBe.true(password === constructorPassword,
            'You do not have permission to create instances of this type.');
        } catch {
            var x = 5;
        }
    }
}

export class Type extends LanguageConstruct {
    private _ctor: Constructor;
    private _base: Type | undefined;
    private _name: string = "";
    private _initialized = false;
    private _properties: PropertyInfo[] = undefined as any;
    private _methods: MethodInfo[] = undefined as any;
    private _staticProperties: PropertyInfo[] = undefined as any;
    private _staticFields: FieldInfo[] = undefined as any;
    private _staticMethods: MethodInfo[] = undefined as any;
    private _typeConstructor: ConstructorInfo;

    private get _propertiesInherited(): IQueryable<PropertyInfo>  { 
        if (!this._initialized) this._initializeMembers();
        if (!this.baseType || this == Type.typeOf(Object)) 
            return this._properties.query()
        return this._properties.query().concat(this.baseType._propertiesInherited) 
    }

    private get _methodsInherited(): IQueryable<MethodInfo>  { 
        if (!this._initialized) this._initializeMembers();
        if (!this.baseType || this == Type.typeOf(Object)) 
            return this._methods.query()
        return this._methods.query().concat(this.baseType._methodsInherited) 
    }

    get baseType(): Type {
        if (this._base === undefined) {
            const prototype = Object.getPrototypeOf(this.constructorFunction.prototype);
            if (prototype == undefined || instanceIs.function(!prototype.getType))
                return undefined as any;
            this._base = <Type>prototype.type;
        }
        return this._base;
    }
    get constructorFunction(): Function { return this.constructorValue.functionValue; }
    get constructorValue(): ConstructorInfo { return this._typeConstructor; }
    get isNull() { return false; }
    get isUndefined() { return false; }
    get isVoid() { return false; }
    get isAnonymous() { return this.name === "`Anonymous"; }
    get isPublic(): boolean { return !this.isPrivate; }
    get isPrivate(): boolean { return this.name.indexOf('_') === 0 || this.name.indexOf('#') === 0; }
    public get isPrimitive(): boolean { return this === Type.typeOf(Boolean) || this === Type.typeOf(String) || this === Type.typeOf(Number); }
    public get isStatic(): boolean { throw 'isStatic is not valid for a Type.'; }
    public get isInstance(): boolean { throw 'isInstance is not valid for a Type.'; }

    get name(): string {
        if (this._name === undefined) {
            if (this._ctor !== undefined) this._name = this._ctor.name;
            else this._name = "`Anonymous";
        }
        return this._name;
    }
    
    get prototype(): any { return this._ctor.prototype; }

    constructor(password: number, ctor: Constructor) {
        super(password);
        this._ctor = ctor;
        this._typeConstructor = new ConstructorInfo(password, this, undefined, ctor);
    }

    equals(other: any): boolean {
        if (instanceIs.unspecified(other) || !other.is(Type)) return false;
        const otherType = <Type>other;
        return this.constructorFunction === otherType.constructorFunction;
    }
    
    toString(): string { return this.name; }

    create<TInstance>(...args: any[]): TInstance {
        return (this.constructorFunction as any)(...args);
    }

    // get hashCode(): number {
    //     return this._ctor.hashCode;
    // }

    getProperties(options?: IMemberOptions): IQueryable<PropertyInfo> {
        if (!this._initialized) this._initializeMembers();
        options = this._initializeMemberOptions(options);
        const properties = options.includeInherited ? this._propertiesInherited : this._properties.query();
        return properties.where(p => this._propertyMatchesOptions(p, options as any)).distinct();
    }

    getProperty(name: string, options?: IMemberOptions): PropertyInfo {
        return this.getProperties(options).query().singleOrDefault(f => f.name === name) as any;
    }

    getFields(instance: any, options?: IMemberOptions): IQueryable<FieldInfo> {
        if (notDefined(instance) || !instance.type.isAssignableTo(this))
            throw Error("The instance passed in is not assignable to type " + this.name);
        if (notDefined(options))
            options = this._initializeMemberOptions(options);

        const fields: FieldInfo[] = [];    
        while (instance) {
            const instanceMembers = Object.getOwnPropertyNames(instance);
    
            for (let i = 0; i < instanceMembers.length; i++) {
                const property = instanceMembers[i];
                const descriptor = Object.getOwnPropertyDescriptor(instance, property);
    
                if (descriptor && !instanceIs.function(descriptor.value) && !instanceIs.specified(descriptor.get) && !instanceIs.specified(descriptor.set)) {
                    fields.push(new FieldInfo(constructorPassword, property, Type.typeOf(instance.constructor), false));
                }
            }
    
            if (!options?.includeInherited) break;
    
            instance = Object.getPrototypeOf(instance);
        }
    
        return fields.query().where(f => this._propertyMatchesOptions(f, options as any)).distinct();
    }

    getField(instance: any, name: string, options?: IMemberOptions): FieldInfo {
        return this.getFields(instance, options).query().singleOrDefault(f => f.name === name) as any;
    }

    getMethods(options?: IMemberOptions): IQueryable<MethodInfo> {
        if (!this._initialized) this._initializeMembers();
        options = this._initializeMemberOptions(options);
        const methods = options.includeInherited ? this._methodsInherited : this._methods.query();
        return methods.where(p => this._propertyMatchesOptions(p, options as any)).distinct();
    }

    getMethod(name: string, options?: IMemberOptions): MethodInfo {
        return this.getMethods(options).query().singleOrDefault(f => f.name === name) as any;
    }

    getStaticFields(options?: IMemberOptions): IQueryable<FieldInfo> {
        if (!this._initialized) this._initializeMembers();
        options = this._initializeMemberOptions(options);
        return this._staticFields.toArray().query().where(f => this._propertyMatchesOptions(f, options as any)).distinct();
    }

    getStaticField(name: string, options?: IMemberOptions): FieldInfo {
        return this.getStaticFields(options).query().singleOrDefault(f => f.name === name) as any;
    }

    getStaticProperties(options?: IMemberOptions): IQueryable<PropertyInfo> {
        if (!this._initialized) this._initializeMembers();
        options = this._initializeMemberOptions(options);
        return this._staticProperties.toArray().query().where(p => this._propertyMatchesOptions(p, options as any)).distinct();
    }

    getStaticProperty(name: string, options?: IMemberOptions): PropertyInfo {
        return this.getStaticProperties(options).query().singleOrDefault(f => f.name === name) as any;
    }

    getStaticMethods(options?: IMemberOptions): IQueryable<MethodInfo> {
        if (!this._initialized) this._initializeMembers();
        options = this._initializeMemberOptions(options);
        return this._staticMethods.toArray().query().where(p => this._propertyMatchesOptions(p, options as any)).distinct();
    }

    getStaticMethod(name: string, options?: IMemberOptions): MethodInfo {
        return this.getStaticMethods(options).query().singleOrDefault(f => f.name === name) as any;
    }
    
    isAssignableTo(other: Type): boolean {
        if (instanceIs.unspecified(other)) return false;

        let ctor: Function | undefined = this.constructorFunction;
        let otherCtor = other.constructorFunction;
        let prototype = undefined;

        while (instanceIs.specified(ctor)) {
            if (ctor === otherCtor) return true;
            prototype = Object.getPrototypeOf(ctor?.prototype);
            if (instanceIs.specified(prototype)) ctor = prototype['constructor'];
            else ctor = undefined;
        }
        return false;
    }
    
    isAssignableFrom(other: Type): boolean {
        if (instanceIs.unspecified(other)) return false;
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
                if (instanceIs.function(descriptor.value)) {
                    this._staticMethods.push(new MethodInfo(constructorPassword, property, Type.typeOf(this._ctor), descriptor, descriptor.writable ?? false, <Function>descriptor.value, true));
                    console.log(this._staticMethods[this._staticMethods.length-1].name); //REMOVE
                } else if (!instanceIs.specified(descriptor.get) && !instanceIs.specified(descriptor.set)) {
                    this._staticFields.push(new FieldInfo(constructorPassword, property, Type.typeOf(this._ctor), true));
                    console.log(this._staticFields[this._staticFields.length-1].name); //REMOVE
                } else {
                    this._staticProperties.push(new PropertyInfo(constructorPassword, property, Type.typeOf(this._ctor), descriptor, instanceIs.specified(descriptor.get), instanceIs.specified(descriptor.set), false, false, true));
                    console.log(this._staticProperties[this._staticProperties.length-1].name); //REMOVE
                }
            }
        }
        
        const instanceMembers = Object.getOwnPropertyNames(instance);
        for (let i = 0; i < instanceMembers.length; i++) {
            const property = instanceMembers[i];
            const descriptor = Object.getOwnPropertyDescriptor(instance, property);
    
            if (descriptor) {
                if (instanceIs.function(descriptor.value)) {
                    this._methods.push(new MethodInfo(constructorPassword, property, Type.typeOf(instance.constructor), descriptor, descriptor.writable ?? false, <Function>descriptor.value, false));
                } else {
                    this._properties.push(new PropertyInfo(constructorPassword, property, Type.typeOf(instance.constructor), descriptor, instanceIs.specified(descriptor.get), instanceIs.specified(descriptor.set), false, false, false));
                }
            }
        }
    
        this._initialized = true;
    }
    
    private _initializeMemberOptions(options: IMemberOptions | undefined): IMemberOptions {
        if (!options) options = {};
        if (instanceIs.unspecified(options.includePublic) && instanceIs.unspecified(options.includePrivate)) options.includePublic = true;
        if (instanceIs.unspecified(options.includeInherited)) options.includeInherited = true;
        return options;
    }

    private _propertyMatchesOptions(property: PropertyInfo, options: IMemberOptions): boolean {  
        if (options.includePublic && property.isPublic) return true;
        else if (options.includePrivate && property.isPrivate) return true;
        else return false;
    }

    static typeOf(constructor: Constructor): Type {  
        if (!instanceIs.function(constructor)) return Type.undefined;  
        //if (!isTypeInternal(constructor)) return Type.undefined;
        let type = types.getValue(constructor);  
        if (!type) {  
            type = new Type(constructorPassword, constructor);  
            types.add(constructor, type);  
        }  
        return type;  
    }

    static instanceOf(instance: any) {
        if (instance === undefined || !instance.constructor) return Type.undefined;
        if (instance === null) return Type.null;
        return Type.typeOf(instance.constructor);
    }
    
    static isEnum(enumCandidate: any): boolean { 
        if (notDefined(enumCandidate)) return false;
        if (!enumCandidate.is.object()) return false;
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

    private static _undefined = new Lazy<UndefinedType>(() => new UndefinedType(constructorPassword, { isUndefined: true }));
    public static get undefined(): UndefinedType { return this._undefined.value; }

    private static _null = new Lazy<UndefinedType>(() => new UndefinedType(constructorPassword, { isNull: true }));
    public static get null(): UndefinedType { return this._null.value; }

    private static _void = new Lazy<UndefinedType>(() => new UndefinedType(constructorPassword, { isVoid: true }));
    public static get void(): UndefinedType { return this._void.value; }
}

class NullConstructor {
    constructor() { return null as any;  }
}

class UndefinedConstructor {
    constructor() { return undefined as any;  }
}

export class UndefinedType extends Type {
    private _isNull: boolean;
    private _isUndefined: boolean;
    private _isVoid: boolean;
    get isNull() { return this._isNull; }
    get isUndefined() { return this._isUndefined; }
    get isVoid() { return this._isVoid; }
    get name() { return this.isUndefined ? "undefined" : this.isNull ? "null" : "void"; }

    constructor(password: number, config: { isNull?: boolean, isUndefined?: boolean, isVoid?: boolean }) {
        super(password, !!config.isNull ? NullConstructor: UndefinedConstructor);
        this._isNull = !!config.isNull;
        this._isUndefined = !!config.isUndefined;
        this._isVoid = !!config.isVoid;
    }

    get baseType(): Type {
        return Type.undefined;
    }
}

export class Environment extends LanguageConstruct {
    private _name: string;
    private _scope: any;
    private _types: IEnumerable<Type> = undefined as any;
    private _functions: IEnumerable<FunctionInfo> = undefined as any;
    private _variables: IEnumerable<VariableInfo> = undefined as any;

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
        return (<IQueryable<FunctionInfo>>this.getFunctions.apply(this)).query().singleOrDefault(p => p.name === name) as any;
    }

    getVariables(): IQueryable<VariableInfo> {
        if (!this._variables) this._variables = this._initializeVariables();
        return this._variables.toArray().query();
    }

    getVariable(name: string): VariableInfo {
        return (<IQueryable<VariableInfo>>this.getVariables.apply(this)).query().singleOrDefault(p => p.name === name) as any;
    }

    private _initializeTypes(): IEnumerable<Type> {
        const initializedTypes = [];
        const scopeProperties = Object.getOwnPropertyNames(environment.scope);

        for (let i = 0; i < scopeProperties.length; i++) {
            const propertyName = scopeProperties[i];
            if (propertyName == 'constructor' || propertyName.indexOf('_') === 0) continue;
            const property = this._scope[propertyName];
            if (isTypeInternal(property)) {
                let ctor = <Constructor>property;
                let type = types.getValue(ctor);
                if (type === undefined) {
                    type = new Type(constructorPassword, ctor);
                    types.add(ctor, type);
                }
                initializedTypes.push(type);
            }
        }

        return initializedTypes as any;
    }

    private _initializeFunctions(): IEnumerable<FunctionInfo> {
        const initializedFunctions = [];
        const scopeProperties = Object.getOwnPropertyNames(this._scope);

        for (let i = 0; i < scopeProperties.length; i++) {
            const propertyName = scopeProperties[i];
            const property = this._scope[propertyName];
            if (!isTypeInternal(property) && instanceIs.function(property)) {
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
            if (!instanceIs.function(property)) {
                const variable = new VariableInfo(constructorPassword, propertyName, property);
                initializedVariables.push(variable);
            }
        }

        return initializedVariables;
    }
}

function isTypeInternal(typeCandidate: any): boolean {
    return typeCandidate === Object || 
        (instanceIs.function(typeCandidate) && 
         defined(typeCandidate.prototype) && 
         !instanceIs.emptyObject(typeCandidate.prototype));
}

class PropertyInfo extends LanguageConstruct {

    private _name: string;
    private _declaringType: Type;
    private _isStatic: boolean;
    private _canWrite: boolean;
    private _canRead: boolean;
    private _isMethod: boolean;
    private _isField: boolean;
    private _propertyDescriptor: PropertyDescriptor | undefined;

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

    constructor(password: number, name: string, declaringType: Type, propertyDescriptor: PropertyDescriptor | undefined, canRead: boolean, canWrite: boolean, isMethod: boolean, isField: boolean, isStatic: boolean) {
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
        mustBe(instance);
        if (!this.canRead) throw new Error('The property cannot be read.');
        if (this.isStatic) return (this.declaringType.constructorFunction as any)[this.name];
        const type = Type.typeOf(instance.constructor);
        const property = type.getProperty(this.name);
        if (instanceIs.unspecified(property)) throw `The property does not exist on type ${type.name}.`;
        const instanceType = <Type>instance.type;
        if (instanceType && instanceType.constructorFunction !== instance.constructor) {
            let prototype = instanceType.prototype;
            while (prototype) {
                if (instanceType.constructorFunction === prototype.constructor) return prototype[this.name];
                const prototypeType = <Type>prototype.type;
                prototype = prototypeType ? prototypeType.prototype : undefined;
            }
        }
        return instance[this.name];
    }

    setValue(instance: any, value: any): void {
        mustBe(instance);
        if (this.isStatic) {
            (this.declaringType.constructorFunction as any)[this.name] = value;
            return;
        }
        const type = Type.typeOf(instance.constructor);
        const property = type.getProperty(this.name);
        if (instanceIs.unspecified(property)) throw `The property does not exist on type ${type.name}.`;
        else if (!this.canWrite) throw 'The property cannot be written to.';
        instance[this.name] = value;
    }

    toString(): string { return this.name; }

    static exists<TInstance, TProperty>(instance: TInstance, selector: (instance: TInstance) => TProperty): boolean {
        const propertyName = Expression.getProperty(selector);
        if ((instance as any).getType) {
            const instanceType: Type = (instance as any).type;
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
        super(password, name, declaringType, undefined, true, true, false, true, isStatic);
    }

    getValue(instance: any): any {
        mustBe(instance);
        if (this.isStatic) return (this.declaringType.constructorFunction as any)[this.name];
        const type = Type.typeOf(instance.constructor);
        const property = type.getProperty(this.name);
        if (instanceIs.unspecified(property)) throw `The property does not exist on type ${type.name}.`;
        else if (!property.canRead) throw 'The property cannot be read.';
        const instanceType = <Type>instance.type;
        if (instanceType && instanceType.constructorFunction !== instance.constructor) {
            let prototype = instanceType.prototype;
            while (prototype) {
                if (instanceType.constructorFunction === prototype.constructor) return prototype[this.name];
                const prototypeType = <Type>prototype.type;
                prototype = prototypeType ? prototypeType.prototype : undefined;
            }
        }
        return instance[this.name];
    }

    setValue(instance: any, value: any): void {
        mustBe(instance);
        if (this.isStatic) {
            (this.declaringType.constructorFunction as any)[this.name] = value;
            return;
        }
        const type = Type.typeOf(instance.constructor);
        const property = type.getProperty(this.name);
        if (instanceIs.unspecified(property)) throw `The property does not exist on type ${type.name}`;
        else if (!this.canWrite) throw 'The property cannot be written to.';
        instance[this.name] = value;
    }
}

class VariableInfo extends PropertyInfo {

    private _value: any;

    get environment(): Environment { return environment; }
    get variableValue(): any { return this._value; }

    constructor(password: number, name: string, value: any) {
        super(password, name, undefined as any, undefined, true, true, false, false, true);
        this._value = value;
    }
}

class MethodInfo extends PropertyInfo {

    private _underlyingFunction: Function;
    private _parameters: IEnumerable<ParameterInfo> = undefined as any;

    get functionValue(): Function { return this._underlyingFunction; }

    constructor(password: number, name: string, declaringType: Type, propertyDescriptor: PropertyDescriptor | undefined, canWrite: boolean, underlyingFunction: Function, isStatic: boolean) {
        super(password, name, declaringType, propertyDescriptor, true, canWrite, true, false, isStatic);
        this._underlyingFunction = underlyingFunction;
    }

    invoke(instance: any, ...args: any[]): any {
        if (this.isStatic) {
            const ctor = this.declaringType.constructorFunction;
            return (ctor as any)[this.name].apply(ctor, args);
        }

        mustBe(instance);
        const type = Type.typeOf(instance.constructor);
        const method = type.getMethod(this.name);

        if (instanceIs.unspecified(method)) throw `The method does not exist on type ${type.name}`;
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
    constructor(password: number, declaringType: Type, propertyDescriptor: PropertyDescriptor | undefined, underlyingFunction: Function) {
        super(password, 'constructor', declaringType, propertyDescriptor, false, underlyingFunction, false);
    }
}

class FunctionInfo extends MethodInfo {

    constructor(password: number, name: string, canWrite: boolean, underlyingFunction: Function) {
        super(password, name, undefined as any, undefined, canWrite, underlyingFunction, true);
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
        mustBe.true(password === constructorPassword, 'You do not have permission to create instances of this type.');
        mustBe(declaringMethod);

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

        mustBe(matches, 'The property selector was not properly defined.');
        const matchesTyped: RegExpExecArray = matches as any;
        
        const property = matchesTyped[1] || matchesTyped[2];
        mustBe(property, 'The property selector was not properly defined.');

        return property;
    }

    static getArguments(func: Function): Array<string> {
        mustBe(func, 'The function was not specified.');

        const functionString = func.toString().replace(/\s+/g, ' ').trim();

        const functionPattern = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
        const arrowFunctionPattern = /^\(?\s*([^\)]*)\)?\s*=>/m;
        const methodPattern = /^[a-zA-Z_]\w*\s*\(\s*([^\)]*)\)/m;

        const match = functionPattern.exec(functionString)
            || arrowFunctionPattern.exec(functionString)
            || methodPattern.exec(functionString);

        mustBe(match, 'The function arguments could not be parsed.');
        const matchTyped: RegExpExecArray = match as any;

        const argumentString = matchTyped[1].trim();
        if (argumentString.length === 0) return [];

        return argumentString.split(/\s*,\s*/).map(arg => arg.trim());
    }

    static getElementByClass(elementName: string, ...classes: string[]): NodeList {
        mustBe(elementName);

        const selectors = classes
            .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
            .map(className => `${elementName}.${className}`)
            .join(', ');

        return document.querySelectorAll(selectors);
    }
}

const constructorPassword = Math.random();
export const environment = new Environment(constructorPassword, 'Global', globalThis);
const types = new Dictionary<Function, Type>(5000);