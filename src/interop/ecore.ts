import {
    ensureNodeDefinition,
    ensurePackage,
    getNodeDefinition,
    Node,
    NODE_TYPES,
    PackageDescription,
    registerNodeDefinition,
    registerNodeProperty
} from "../model/model";
import * as Ecore from "ecore/dist/ecore";
import {EClass, EClassifier, EList, EObject, EPackage, EReference, Resource} from "ecore";
import {Point, Position} from "../model/position";
import {Issue, IssueSeverity, IssueType} from "../validation";
import {getEPackage} from "./ecore-basic";
import {
    STARLASU_URI_V2,
    THE_ISSUE_ECLASS,
    THE_ISSUE_SEVERITY_EENUM,
    THE_ISSUE_TYPE_EENUM,
    THE_LOCAL_DATE_ECLASS,
    THE_LOCAL_DATE_TIME_ECLASS,
    THE_LOCAL_TIME_ECLASS,
    THE_NODE_ECLASS, THE_NODE_ORIGIN_ECLASS,
    THE_POINT_ECLASS,
    THE_POSITION_ECLASS,
    THE_RESULT_ECLASS, THE_TEXT_FILE_DESTINATION_ECLASS
} from "./starlasu-v2-metamodel";
import {KOLASU_URI_V1} from "./kolasu-v1-metamodel";
import {EBigDecimal, EBigInteger} from "./ecore-patching";

export const TO_EOBJECT_SYMBOL = Symbol("toEObject");
export const ECLASS_SYMBOL = Symbol("EClass");
export const EPACKAGE_SYMBOL = Symbol("EPackage");
export const SYMBOL_NODE_NAME = Symbol("name");

function registerEPackage(packageName: string, args: { nsPrefix?: string; nsURI?: string }) {
    const packageDef = NODE_TYPES[packageName];
    if (!packageDef) {
        throw new Error("Unknown package: " + packageName);
    }
    const ePackage = getEPackage(packageName, args);
    packageDef[EPACKAGE_SYMBOL] = ePackage;
    return {packageDef, ePackage};
}

function translateType(type) {
    if (type === Number) {
        return Ecore.EDouble;
    } else if (type === String) {
        return Ecore.EString;
    } else if(type.name) {
        //TODO
        return undefined
    }
}

function getEType(property: any) {
    const type = property.type;
    if(!type) {
        return undefined;
    }
    if(type === Array && property.arrayElementType) {
        //TODO
        return undefined;
    }
    return translateType(type);
}

function registerEClass(nodeType: string, packageDef: PackageDescription, ePackage) {
    const constructor = packageDef.nodes[nodeType];
    if (Object.prototype.hasOwnProperty.call(constructor, ECLASS_SYMBOL)) {
        const eClass = constructor[ECLASS_SYMBOL];
        ePackage.get('eClassifiers').add(eClass);
        return eClass;
    }
    const eClass = Ecore.EClass.create({
        name: nodeType
    });
    constructor[ECLASS_SYMBOL] = eClass;
    const proto = Object.getPrototypeOf(constructor);
    const parentNodeDef = getNodeDefinition(proto);
    if(parentNodeDef && parentNodeDef.package && parentNodeDef.name) {
        const {packageDef, ePackage} = registerEPackage(parentNodeDef.package, {});
        const superclass = registerEClass(parentNodeDef.name, packageDef, ePackage);
        eClass.get("eSuperTypes").add(superclass);
    } else {
        eClass.get("eSuperTypes").add(THE_NODE_ECLASS);
    }
    const nodeDef = getNodeDefinition(constructor);
    if (nodeDef) {
        for (const prop in nodeDef.properties) {
            const property = nodeDef.properties[prop];
            if(property.inherited) {
                continue;
            }
            if (property.child) {
                const eRef = Ecore.EReference.create({
                    name: prop,
                    eType: THE_NODE_ECLASS,
                    containment: true
                });
                if(property.multiple) {
                    eRef.set("upperBound", -1);
                }
                eClass.get("eStructuralFeatures").add(eRef);
            } else {
                const eAttr = Ecore.EAttribute.create({
                    name: prop
                });
                if(property.type) {
                    const eType = getEType(property);
                    if(eType) {
                        eAttr.set("eType", eType);
                    }
                }
                eClass.get("eStructuralFeatures").add(eAttr);
            }
        }
    }
    ePackage.get('eClassifiers').add(eClass);
    return eClass;
}

export function registerECoreModel(packageName: string, args: { nsPrefix?: string, nsURI?: string } = {}): EPackage {
    const {packageDef, ePackage} = registerEPackage(packageName, {nsURI: "", ...args});
    for(const nodeType in packageDef.nodes) {
        registerEClass(nodeType, packageDef, ePackage);
    }
    return ePackage;
}

export function ensureECoreModel(packageName = ""): EPackage {
    ensurePackage(packageName);
    if(!NODE_TYPES[packageName][EPACKAGE_SYMBOL]) {
        return registerECoreModel(packageName);
    } else {
        return NODE_TYPES[packageName][EPACKAGE_SYMBOL];
    }
}

function samePropertiesAs(propertyNames: string[], eClass: EClass) {
    const attributes = eClass.get("eAllStructuralFeatures");
    if(propertyNames.length !== attributes.length) {
        return false;
    }
    for(let i = 0; i < propertyNames.length; i++) {
        if(!propertyNames.includes(attributes[i].get("name"))) {
            return false;
        }
    }
    return true;
}

/**
 * Transforms an AST into its Ecore representation.
 * @param obj the root AST node
 * @param owner the EObject which will own the collection (when obj is an array)
 * @param feature the feature that will own the collection (when obj is an array)
 */
export function toEObject(obj: ASTElement | any, owner?: EObject, feature?: EObject): EObject | any {
    if(Array.isArray(obj)) {
        const eList = new Ecore.EList(owner!, feature!);
        obj.forEach(o => {
            eList.add(toEObject(o));
        });
        return eList;
    } else {
        if (obj && (typeof obj[TO_EOBJECT_SYMBOL] === "function")) {
            return obj[TO_EOBJECT_SYMBOL]();
        } else if(obj) {
            const propertyNames = Object.getOwnPropertyNames(obj);
            if(samePropertiesAs(propertyNames, THE_RESULT_ECLASS) &&
                obj.root instanceof Node &&
                Array.isArray(obj.issues)) {
                return THE_RESULT_ECLASS.create({
                    root: toEObject(obj.root),
                    issues: obj.issues.map(toEObject)
                });
            } else if(samePropertiesAs(propertyNames, THE_LOCAL_DATE_ECLASS)) {
                return THE_LOCAL_DATE_ECLASS.create(obj);
            } else if(samePropertiesAs(propertyNames, THE_LOCAL_TIME_ECLASS)) {
                return THE_LOCAL_TIME_ECLASS.create(obj);
            } else if(samePropertiesAs(propertyNames, THE_LOCAL_DATE_TIME_ECLASS)) {
                return THE_LOCAL_DATE_TIME_ECLASS.create({
                    date: toEObject(obj.date),
                    time: toEObject(obj.time)
                });
            } else if(samePropertiesAs(propertyNames, THE_ISSUE_ECLASS)) {
                return THE_ISSUE_ECLASS.create({
                    type: IssueType[obj.type],
                    message: obj.message,
                    severity: obj.severity !== undefined ? IssueSeverity[obj.severity] : undefined,
                    position: obj.position ? toEObject(obj.position) : undefined
                });
            } else {
                return obj;
            }
        } else {
            return obj;
        }
    }
}

export interface LocalDate {
    year: number;
    month: number;
    dayOfMonth: number;
}

export interface LocalTime {
    hour: number;
    minute: number;
    second: number;
    nanosecond: number;
}

export interface LocalDateTime {
    date: LocalDate;
    time: LocalTime;
}

export interface Result {
    root: Node | undefined;
    issues: Issue[];
}

export type ASTElement = Node | Position | Issue | LocalDate | LocalTime | LocalDateTime | Result | ASTElement[];

function decodeEnumLiteral(eType, literalName: string) {
    if(!literalName) {
        return undefined;
    }
    if(typeof literalName === "string") {
        const literal = eType.get("eLiterals").find(l => l.get("name") === literalName);
        if (literal) {
            return literal.get("value") || 0;
        } else {
            throw new Error(`Unknown enum literal: ${literalName} of ${eType.get("name")}`);
        }
    } else if(typeof literalName === "number") {
        const literal = eType.get("eLiterals").at(literalName);
        if (literal) {
            return literal.get("value") || literalName;
        } else {
            throw new Error(`Unknown enum literal: ${literalName} of ${eType.get("name")}`)
        }
    } else {
        throw new Error(`Invalid enum literal: ${literalName} of ${eType.get("name")}`)
    }
}

export function fromEObject(obj: EObject | any, parent?: Node): ASTElement | undefined {
    if(!obj) {
        return undefined;
    }
    if(Object.getPrototypeOf(obj) == Ecore.EList.prototype) {
        return (obj as EList).map(o => fromEObject(o, parent));
    }
    const eClass = obj.eClass;
    if(!eClass) {
        return obj;
    }
    if(isBuiltInClass(eClass, THE_POSITION_ECLASS)) {
        return new Position(
            new Point(obj.get("start")?.get("line") || 1, obj.get("start")?.get("column") || 0),
            new Point(obj.get("end")?.get("line") || 1, obj.get("end")?.get("column") || 0));
    }
    if(isBuiltInClass(eClass, THE_LOCAL_DATE_ECLASS)) {
        return { year: obj.get("year"), month: obj.get("month"), dayOfMonth: obj.get("dayOfMonth") };
    }
    if(isBuiltInClass(eClass, THE_LOCAL_TIME_ECLASS)) {
        return {
            hour: obj.get("hour"),
            minute: obj.get("minute"),
            second: obj.get("second"),
            nanosecond: obj.get("nanosecond")
        };
    }
    if(isBuiltInClass(eClass, THE_LOCAL_DATE_TIME_ECLASS)) {
        return { date: fromEObject(obj.get("date")) as LocalDate, time: fromEObject(obj.get("time")) as LocalTime };
    }
    if(isBuiltInClass(eClass, THE_ISSUE_ECLASS)) {
        return new Issue(
            decodeEnumLiteral(THE_ISSUE_TYPE_EENUM, obj.get("type")),
            obj.get("message"),
            decodeEnumLiteral(THE_ISSUE_SEVERITY_EENUM, obj.get("severity")),
            fromEObject(obj.get("position")) as Position);
    }
    if(isBuiltInClass(eClass, THE_RESULT_ECLASS)) {
        return {
            root: fromEObject(obj.get("root")) as Node,
            issues: (obj.get("issues") as EList)?.map(fromEObject) as Issue[] || []
        };
    }
    if(isBuiltInClass(eClass, THE_NODE_ORIGIN_ECLASS)) {
        return fromEObject(obj.get("node")) as Node;
    }
    if(isBuiltInClass(eClass, THE_TEXT_FILE_DESTINATION_ECLASS)) {
        return fromEObject(obj.get("position")) as Position;
    }
    const ePackage = eClass.eContainer as EPackage;
    const constructor = NODE_TYPES[ePackage.get("name")]?.nodes[eClass.get("name")];
    if(constructor) {
        const node = new constructor();
        node.parent = parent;
        eClass.get("eAllStructuralFeatures").forEach(ft => {
            const name = ft.get("name");
            const value = obj.get(name);
            const eType = ft.get("eType");
            if(Array.isArray(value)) {
                node[name] = value.map(e => {
                    if(e.eClass === "http://www.eclipse.org/emf/2002/Ecore#//EEnumLiteral") {
                        if(e.$ref) {
                            const literalName = e.$ref.substring(e.$ref.lastIndexOf("/") + 1);
                            return decodeEnumLiteral(eType, literalName);
                        }
                    }
                    return fromEObject(e, node);
                });
            } else if(ft.isTypeOf("EReference")) {
                node[name] = fromEObject(value, node);
            } else if(value !== undefined && value !== null && eType && eType.isTypeOf("EEnum")) {
                node[name] = decodeEnumLiteral(eType, value);
            } else {
                node[name] = value;
            }
        });
        return node;
    } else {
        throw new Error("Unknown node definition: " + ePackage.get("name") + "." + eClass.get("name"));
    }
}

export class EObjectGenerator {
    toEObject(node: Node): EObject {
        return toEObject(node);
    }
    fromEObject(eObject: EObject): ASTElement | undefined {
        return fromEObject(eObject);
    }
}

Node.prototype[TO_EOBJECT_SYMBOL] = function(): EObject {
    const def = ensureNodeDefinition(this);
    const ePackage = ensureECoreModel(def.package);
    const eClass = ePackage.get("eClassifiers").find(c => c.get("name") == def.name);
    if(!eClass) {
        throw new Error("Unknown class " + def.name + " in package " + def.package);
    }
    const result = eClass.create();
    eClass.get("eAllStructuralFeatures").forEach(a => {
        if(a.isTypeOf('EAttribute')) {
            const name = a.get("name");
            const value = this[name];
            if(value !== undefined && value !== null && a.get("eType") && a.get("eType").isTypeOf("EEnum")) {
                const literal = a.get("eType").get("eLiterals").find(l => l.get("value") === value);
                if(literal) {
                    result.set(name, literal.get("name"));
                } else {
                    throw new Error(`No literal has value ${value} in enum ${a.get("eType").get("name")}`)
                }
            } else {
                result.set(name, value);
            }
        } else if(a.isTypeOf('EReference')) {
            const name = a.get("name");
            result.set(name, toEObject(this[name], result, a));
        }
    });
    return result;
}

Position.prototype[TO_EOBJECT_SYMBOL] = function(): EObject {
    const pos = THE_POSITION_ECLASS.create();
    pos.set("start", THE_POINT_ECLASS.create({
        line: this.start.line, column: this.start.column
    }));
    pos.set("end", THE_POINT_ECLASS.create({
        line: this.end.line, column: this.end.column
    }));
    return pos;
}

export const SYMBOL_CLASS_DEFINITION = Symbol("class definition");

function defineProperty(classDef, name) {
    const internalPropertySymbol = Symbol(name);
    Object.defineProperty(classDef, name, {
        enumerable: true,
        get(): any {
            return this[internalPropertySymbol];
        },
        set(v: any) {
            this[internalPropertySymbol] = v;
        }
    });
}

function isBuiltInClass(eClass: EClass, refClass: EClass): boolean {
    const nsURI = eClass?.eContainer?.get("nsURI");
    return (nsURI == KOLASU_URI_V1 || nsURI == STARLASU_URI_V2) && eClass.get("name") == refClass.get("name");
}

function generateASTClass(eClass, pkg: PackageDescription) {
    if(isBuiltInClass(eClass, THE_NODE_ECLASS)) {
        return Node;
    }
    const className = eClass.get("name");
    if (pkg.nodes[className]) {
        return pkg.nodes[className];
    }
    const supertypes: EClass[] = eClass.get("eSuperTypes").filter(t => t.isTypeOf("EClass"));
    const superclasses = supertypes.filter(t => !t.get("interface"));
    let nodeSuperclass;
    if(superclasses.length > 1) {
        throw new Error("A class can have at most one superclass");
    } else if(superclasses.length == 1) {
        const eSuperClass = superclasses[0];
        nodeSuperclass = generateASTClass(eSuperClass, ensurePackage(eSuperClass.eContainer.get("name")));
    }
    if(nodeSuperclass) {
        //TODO check it actually derives from node!
        const superclass: typeof Node = nodeSuperclass;
        const classDef = class GeneratedNodeClass extends superclass {};
        classDef[SYMBOL_NODE_NAME] = className;
        //TODO include decorator that records where the class has been loaded from?
        const superClassName = nodeSuperclass == Node ? "Node" : nodeSuperclass[SYMBOL_NODE_NAME];
        // TODO we don't generate interfaces yet
        // const implementsClause = interfaces.length > 0 ? ` implements ${interfaces.map(i => i.get("name")).join(", ")}` : "";
        classDef[SYMBOL_CLASS_DEFINITION] =
            `@ASTNode("${pkg.name}", "${className}")
export class ${className} extends ${superClassName} {`;
        registerNodeDefinition(classDef as any, pkg.name, className);

        eClass.get("eStructuralFeatures").each(a => {
            const name = a.get("name");
            defineProperty(classDef, name);
            const prop = registerNodeProperty(classDef as any, name);
            prop.child = a.isTypeOf('EReference');
            const annotation = prop.child ? (prop.multiple ? "@Children()" : "@Child()") : "@Property()"
            classDef[SYMBOL_CLASS_DEFINITION] += `\n\t${annotation}\n\t${name};`;
        });
        classDef[SYMBOL_CLASS_DEFINITION] += "\n}";
        pkg.nodes[className] = classDef as any;
        return classDef;
    } else {
        const classDef = class GeneratedClass {};
        eClass.get("eStructuralFeatures").each(a => {
            const name = a.get("name");
            defineProperty(classDef, name);
        });
        return classDef;
    }
}

export function generateASTModel(model: EPackage[]): PackageDescription[] {
    return model.map(generateASTClasses);
}

export function generateASTClasses(model: EPackage): PackageDescription {
    const packageName = model.get("name");
    const pkg = ensurePackage(packageName);
    model.get("eClassifiers").filter(c => c.isTypeOf("EClass") && !c.get("interface")).forEach(
        eClass => generateASTClass(eClass, pkg));
    return pkg;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function loadEPackages(data: any, resource: Resource): EPackage[] {
    if(typeof data === "string") {
        data = JSON.parse(data);
    }
    const referencesTracker = new ReferencesTracker(resource);
    if (Array.isArray(data)) {
        for (const pkg of data) {
            const result = importJsonObject(pkg, resource, undefined, true, referencesTracker);
            resource.add(result);
        }
    } else {
        const result = importJsonObject(data, resource, undefined, true, referencesTracker);
        resource.add(result);
    }
    referencesTracker.resolveAllReferences();
    return registerPackages(resource);
}

interface PostponedReference {
    eObject: EObject, feature: any, refValue: any
}

/**
 * Used to track references to resolve once the whole model is loaded.
 */
class ReferencesTracker {
    private postponedReferences : PostponedReference[] = [];

    constructor(public resource: Resource) {
    }

    trackReference(eObject: EObject, feature: any, refValue: any) : void {
        this.postponedReferences.push({eObject, feature, refValue});
    }

    resolveAllReferences() : void {
        this.postponedReferences.forEach((pr)=>{
            this.resolveReference(pr);
        });
        this.postponedReferences = [];
    }

    resolveReference(pr: PostponedReference) {
        if (pr.feature.get('upperBound') !== 1) {
            const list = pr.eObject.get(pr.feature);
            pr.refValue.forEach(ref => {
                list.add(this.getReferredObject(ref.$ref));
            });
        } else {
            pr.eObject.set(pr.feature, this.getReferredObject(pr.refValue["$ref"]));
        }
    }

    getReferredObject(uri: string) {
        if (uri === undefined) {
            return undefined;
        }
        let eClass;
        try {
            eClass = findEClass(uri, this.resource);
        } catch (e) {
            //Not an eclass
        }
        if (eClass) {
            return eClass;
        } else if (uri.indexOf("#") != -1) {
            const parts = uri.split("#");
            if (parts.length != 2) {
                throw new Error(`Unexpected URI: ${uri}. It was expected to have a single # symbol`);
            }
            const packageURI = parts[0];
            const ePackage = Ecore.EPackage.Registry.getEPackage(packageURI);
            if (ePackage == null) {
                throw new Error(`Could not find EPackage with URI ${packageURI}`)
            }
            throw new Error("Not supported: " + uri);
        } else {
            let referred: any = this.resource.getEObject(uri);
            if (!referred) {
                if (uri.startsWith("/")) {
                    const components = uri.substring(1).split("/");
                    referred = this.resource.getEObject("/").eContents();
                    for (const fragment of components) {
                        if (Array.isArray(referred)) {
                            referred = referred[parseInt(fragment)];
                        } else {
                            referred = referred.get(fragment);
                        }
                    }
                }
                if (!referred) {
                    throw new Error(`Unresolved reference ${uri} in resource ${this.resource.get("uri")}`);
                }
            }
            return referred;
        }
    }
}

/**
 * Interprets a string or JSON object as an EObject.
 * @param data the input string or object.
 * @param resource where to look for to resolve references to types.
 * @param eClass the class of the object, if not specified in the `data`.
 */
export function loadEObject(data: unknown, resource: Resource, eClass?: EClass): EObject {
    if(typeof data === "string") {
        data = JSON.parse(data);
    }
    const referencesTracker = new ReferencesTracker(resource);
    const result = importJsonObject(data, resource, eClass, true, referencesTracker);
    resource.add(result);
    referencesTracker.resolveAllReferences();
    return result;
}

export function findEClass(name: string, resource: Resource): EClass | undefined {
    const index = name.lastIndexOf("#");
    if (index > 0) {
        const packageName = name.substring(0, index);
        const ePackage = EPackage.Registry.getEPackage(packageName);
        if(!ePackage) {
            throw new Error("Package not found: " + packageName+ " while loading for class " + name);
        }
        const className = name.substring(name.lastIndexOf("/") + 1);
        if (ePackage.get("nsURI") == KOLASU_URI_V1) {
            // Possibly handle Kolasu v1 data types
            if (className == "BigDecimal") {
                return EBigDecimal;
            } else if (className == "BigInteger") {
                return EBigInteger;
            } else if (className == "boolean") {
                return Ecore.EBoolean;
            } else if (className == "int") {
                return Ecore.EInt;
            } else if (className == "string") {
                return Ecore.EString;
            }
        }
        return ePackage.get("eClassifiers").find((c: EClassifier) => c.get("name") == className);
    } else {
        const parts = name.substring(1).split("/").filter(s => s.length > 0);
        const packages = resource.eContents().filter(value => value.isTypeOf("EPackage"));
        if(parts.length == 2) {
            const ePackage = packages[parseInt(parts[0])];
            if (ePackage == null) {
                throw new Error("Package not found while looking for EClass " + name)
            }
            return ePackage.get("eClassifiers").find((c: EClassifier) => c.get("name") == parts[1]);
        } else if(packages.length == 1) {
            return packages[0].get("eClassifiers").find((c: EClassifier) => c.get("name") == parts[0]);
        } else {
            throw new Error("Unsupported class name: " + name);
        }
    }
}

/**
 * Interprets a JSON object as an EObject.
 * @param obj the input object.
 * @param resource where to look for to resolve references to types.
 * @param eClass if the object does not specify an EClass, this method will use this parameter, if provided.
 * @param strict if true (the default), unknown attributes are an error, otherwise they're ignored.
 * @param referencesTracker references tracker used to read references and solve them later (after loading all nodes)
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function importJsonObject(
    obj: any, resource: Resource, eClass?: EClass,
    strict = true, referencesTracker: ReferencesTracker = new ReferencesTracker(resource)): EObject {
    if (obj.eClass) {
        eClass = findEClass(obj.eClass, resource);
        if(!eClass) {
            throw new Error(`Unknown EClass: ${obj.eClass}`);
        }
    }
    if(!eClass) {
        const propertyNames = Object.getOwnPropertyNames(obj);
        if(samePropertiesAs(propertyNames, THE_RESULT_ECLASS) &&
            Array.isArray(obj.issues)) {
            eClass = THE_RESULT_ECLASS;
        } else if(samePropertiesAs(propertyNames, THE_LOCAL_DATE_ECLASS)) {
            eClass = THE_LOCAL_DATE_ECLASS;
        } else if(samePropertiesAs(propertyNames, THE_LOCAL_TIME_ECLASS)) {
            eClass = THE_LOCAL_TIME_ECLASS;
        } else if(samePropertiesAs(propertyNames, THE_LOCAL_DATE_TIME_ECLASS)) {
            eClass = THE_LOCAL_TIME_ECLASS;
        } else if(samePropertiesAs(propertyNames, THE_ISSUE_ECLASS)) {
            return THE_ISSUE_ECLASS.create({
                type: IssueType[obj.type],
                message: obj.message,
                severity: obj.severity !== undefined ? IssueSeverity[obj.severity] : undefined,
                position: obj.position ? importJsonObject(obj.position, resource, undefined, strict, referencesTracker) : undefined
            });
        } else if(samePropertiesAs(propertyNames, THE_POINT_ECLASS)) {
            eClass = THE_POINT_ECLASS;
        } else if(samePropertiesAs(propertyNames, THE_POSITION_ECLASS)) {
            eClass = THE_POSITION_ECLASS;
        }

        if (!eClass) {
            throw new Error(`EClass is not specified and not present in the object. Property names: ${propertyNames}`);
        }
    }
    const eObject = eClass.create({});
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && key != "eClass") {
            const feature = eClass.getEStructuralFeature(key);
            if (feature) {
                if (feature.isTypeOf('EAttribute')) {
                    eObject.set(key, obj[key]);
                } else if (feature.isTypeOf('EReference')) {
                    let eType = feature.get("eType");
                    if (!eType) {
                        const eGenericType = feature.get("eGenericType");
                        if (eGenericType) {
                            eType = eGenericType.get("eClassifier");
                        }
                    }
                    if (feature.get("containment") === true) {
                        if (feature.get("many")) {
                            if (obj[key]) {
                                obj[key].forEach((v: any) => eObject.get(key).add(
                                    importJsonObject(v, resource, eType, strict, referencesTracker)));
                            }
                        } else {
                            let value;
                            if (Array.isArray(obj[key])) {
                                if (obj[key].length == 1) {
                                    value = obj[key][0];
                                } else if (obj[key].length > 1) {
                                    throw new Error("Unexpected array: " + key + " of " + eClass.fragment);
                                }
                            } else {
                                value = obj[key];
                            }
                            if (value) {
                                eObject.set(key, importJsonObject(value, resource, eType, strict, referencesTracker));
                            }
                        }
                    } else if (feature.isKindOf(EReference)) {
                        const refValue = obj[key];
                        referencesTracker.trackReference(eObject, feature, refValue);
                    } else {
                        throw new Error("The feature is neither a containment or a reference");
                    }
                } else if (strict) {
                    throw new Error("Not a feature: " + key + " of " + eClass.fragment());
                }
            } else if (strict) {
                throw new Error("Not a feature: " + key + " of " + eClass.fragment());
            }
        }
    }
    return eObject;
}

export function registerPackages(resource: Resource): EPackage[] {
    return resource.get("contents")
        .filter((p: EObject) =>
            p.isKindOf("EPackage") &&
            p.get("name") != "javax.xml.datatype")
        .map((p: EPackage) => {
            EPackage.Registry.register(p);
            return p;
        });
}

export interface EcoreMetamodelSupport {
    /**
     * Generates the metamodel. The standard Kolasu metamodel [EPackage][org.eclipse.emf.ecore.EPackage] is included.
     */
    generateMetamodel(resource: Resource, includingKolasuMetamodel: boolean): void;
}

