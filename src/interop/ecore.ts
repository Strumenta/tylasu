import {
    ensureNodeDefinition, ensurePackage,
    getNodeDefinition,
    Node,
    NODE_TYPES,
    PackageDescription,
    registerNodeDefinition, registerNodeProperty
} from "../ast";
import * as Ecore from "ecore/dist/ecore";
import {EClass, EClassifier, EList, EObject, EPackage, Resource} from "ecore";
import {Point, Position} from "../position";
import {Parser} from "../parsing";
import {Parser as ANTLRParser, ParserRuleContext} from "antlr4ts";
import {Issue, IssueSeverity, IssueType} from "../validation";

// Kolasu model definition

export const TO_EOBJECT_SYMBOL = Symbol("toEObject");
export const ECLASS_SYMBOL = Symbol("EClass");
export const EPACKAGE_SYMBOL = Symbol("EPackage");
export const SYMBOL_NODE_NAME = Symbol("name");

export const KOLASU_URI_V1 = "https://strumenta.com/kolasu/v1";
export const KOLASU_URI_V2 = "https://strumenta.com/kolasu/v2";
export const THE_AST_RESOURCE = Ecore.ResourceSet.create().create({ uri: KOLASU_URI_V2 });
export const THE_AST_EPACKAGE = getEPackage("com.strumenta.kolasu.v2", { nsURI: KOLASU_URI_V2 });
THE_AST_RESOURCE.get("contents").add(THE_AST_EPACKAGE);
export const THE_ORIGIN_ECLASS = Ecore.EClass.create({
    name: "Origin",
    abstract: true
});
export const THE_NODE_ECLASS = Ecore.EClass.create({
    name: "ASTNode",
    abstract: true,
});
THE_NODE_ECLASS.get("eSuperTypes").add(THE_ORIGIN_ECLASS);
export const THE_POINT_ECLASS = Ecore.EClass.create({
    name: "Point"
});
THE_POINT_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "line",
    eType: Ecore.EInt,
    lowerBound: 1
}));
THE_POINT_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "column",
    eType: Ecore.EInt,
    lowerBound: 1
}));
export const THE_POSITION_ECLASS = Ecore.EClass.create({
    name: "Position"
});
THE_POSITION_ECLASS.get("eStructuralFeatures").add(Ecore.EReference.create({
    name: "start",
    eType: THE_POINT_ECLASS,
    containment: true,
    lowerBound: 1
}));
THE_POSITION_ECLASS.get("eStructuralFeatures").add(Ecore.EReference.create({
    name: "end",
    eType: THE_POINT_ECLASS,
    containment: true,
    lowerBound: 1
}));
THE_NODE_ECLASS.get("eStructuralFeatures").add(Ecore.EReference.create({
    name: "position",
    eType: THE_POSITION_ECLASS,
    containment: true
}));
THE_NODE_ECLASS.get("eStructuralFeatures").add(Ecore.EReference.create({
    name: "destination",
    eType: THE_POSITION_ECLASS,
    containment: true
}));
THE_NODE_ECLASS.get("eStructuralFeatures").add(Ecore.EReference.create({
    name: "origin",
    eType: THE_ORIGIN_ECLASS,
    containment: false
}));

export const THE_POSSIBLY_NAMED_INTERFACE = Ecore.EClass.create({
    name: "PossiblyNamed",
    interface: true
});
THE_POSSIBLY_NAMED_INTERFACE.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "name",
    eType: Ecore.EString,
    lowerBound: 0
}));
export const THE_NAMED_INTERFACE = Ecore.EClass.create({
    name: "Named",
    interface: true
});
THE_NAMED_INTERFACE.get("eSuperTypes").add(THE_POSSIBLY_NAMED_INTERFACE);
THE_NAMED_INTERFACE.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "name",
    eType: Ecore.EString,
    lowerBound: 1
}));
export const THE_REFERENCE_BY_NAME_ECLASS = Ecore.EClass.create({
    name: "ReferenceByName"
});
THE_REFERENCE_BY_NAME_ECLASS.get("eSuperTypes").add(THE_NAMED_INTERFACE);
THE_REFERENCE_BY_NAME_ECLASS.get("eTypeParameters").add(Ecore.ETypeParameter.create({
    name: "N"
}));
THE_REFERENCE_BY_NAME_ECLASS.get("eTypeParameters").at(0).get("eBounds").add(Ecore.EGenericType.create({
    eClassifier: THE_POSSIBLY_NAMED_INTERFACE
}));
THE_REFERENCE_BY_NAME_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "name",
    eType: Ecore.EString,
    lowerBound: 1
}));
THE_REFERENCE_BY_NAME_ECLASS.get("eStructuralFeatures").add(Ecore.EReference.create({
    name: "referenced",
    containment: true
}));
THE_REFERENCE_BY_NAME_ECLASS.get("eStructuralFeatures").at(1).set("eGenericType", Ecore.EGenericType.create({
    eTypeParameter: THE_REFERENCE_BY_NAME_ECLASS.get("eTypeParameters").at(0)
}));

export const THE_LOCAL_DATE_ECLASS  = Ecore.EClass.create({
    name: "LocalDate"
});
THE_LOCAL_DATE_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "year",
    eType: Ecore.EInt,
    lowerBound: 1
}));
THE_LOCAL_DATE_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "month",
    eType: Ecore.EInt,
    lowerBound: 1
}));
THE_LOCAL_DATE_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "dayOfMonth",
    eType: Ecore.EInt,
    lowerBound: 1
}));

export const THE_LOCAL_TIME_ECLASS  = Ecore.EClass.create({
    name: "LocalTime"
});
THE_LOCAL_TIME_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "hour",
    eType: Ecore.EInt,
    lowerBound: 1
}));
THE_LOCAL_TIME_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "minute",
    eType: Ecore.EInt,
    lowerBound: 1
}));
THE_LOCAL_TIME_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "second",
    eType: Ecore.EInt,
    lowerBound: 1
}));
THE_LOCAL_TIME_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "nanosecond",
    eType: Ecore.EInt,
    lowerBound: 1
}));

export const THE_LOCAL_DATE_TIME_ECLASS  = Ecore.EClass.create({
    name: "LocalDateTime"
});
THE_LOCAL_DATE_TIME_ECLASS.get("eStructuralFeatures").add(Ecore.EReference.create({
    name: "date",
    eType: THE_LOCAL_DATE_ECLASS,
    lowerBound: 1,
    containment: true
}));
THE_LOCAL_DATE_TIME_ECLASS.get("eStructuralFeatures").add(Ecore.EReference.create({
    name: "time",
    eType: THE_LOCAL_TIME_ECLASS,
    lowerBound: 1,
    containment: true
}));


function addLiteral(eenum: Ecore.EEnum, name: string, value: number) {
    const literal = Ecore.EEnumLiteral.create({
        name, value
    });
    eenum.get("eLiterals").add(literal);
    return literal;
}

export const THE_ISSUE_TYPE_EENUM = Ecore.EEnum.create({
    name: "IssueType"
});
addLiteral(THE_ISSUE_TYPE_EENUM, IssueType[IssueType.LEXICAL], IssueType.LEXICAL);
addLiteral(THE_ISSUE_TYPE_EENUM, IssueType[IssueType.SYNTACTIC], IssueType.SYNTACTIC);
addLiteral(THE_ISSUE_TYPE_EENUM, IssueType[IssueType.SEMANTIC], IssueType.SEMANTIC);

export const THE_ISSUE_SEVERITY_EENUM = Ecore.EEnum.create({
    name: "IssueSeverity"
});
addLiteral(THE_ISSUE_SEVERITY_EENUM, IssueSeverity[IssueSeverity.INFO], IssueSeverity.INFO);
addLiteral(THE_ISSUE_SEVERITY_EENUM, IssueSeverity[IssueSeverity.WARNING], IssueSeverity.WARNING);
addLiteral(THE_ISSUE_SEVERITY_EENUM, IssueSeverity[IssueSeverity.ERROR], IssueSeverity.ERROR);

export const THE_ISSUE_ECLASS = Ecore.EClass.create({
    name: "Issue"
});
THE_ISSUE_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "type",
    eType: THE_ISSUE_TYPE_EENUM,
    lowerBound: 1
}));
THE_ISSUE_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "message",
    eType: Ecore.EString,
    lowerBound: 1
}));
THE_ISSUE_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "severity",
    eType: THE_ISSUE_SEVERITY_EENUM
}));
THE_ISSUE_ECLASS.get("eStructuralFeatures").add(Ecore.EReference.create({
    name: "position",
    eType: THE_POSITION_ECLASS,
    containment: true
}));

export const THE_RESULT_ECLASS = Ecore.EClass.create({
    name: "Result"
});
const resultTypeParameter = Ecore.ETypeParameter.create({ name: "CU" });
(resultTypeParameter.get("eBounds") as EList).add(Ecore.EGenericType.create({
    eClassifier: THE_NODE_ECLASS
}));
THE_RESULT_ECLASS.get("eTypeParameters").add(resultTypeParameter);
THE_RESULT_ECLASS.get("eStructuralFeatures").add(Ecore.EReference.create({
    name: "root",
    eGenericType: Ecore.EGenericType.create({ eTypeParameter: resultTypeParameter }),
    containment: true
}));
THE_RESULT_ECLASS.get("eStructuralFeatures").add(Ecore.EReference.create({
    name: "issues",
    eGenericType: THE_ISSUE_ECLASS,
    containment: true,
    upperBound: -1
}));

THE_AST_EPACKAGE.get('eClassifiers').add(THE_ORIGIN_ECLASS);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_NODE_ECLASS);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_POINT_ECLASS);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_POSITION_ECLASS);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_POSSIBLY_NAMED_INTERFACE);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_NAMED_INTERFACE);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_REFERENCE_BY_NAME_ECLASS);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_LOCAL_DATE_ECLASS);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_LOCAL_TIME_ECLASS);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_LOCAL_DATE_TIME_ECLASS);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_ISSUE_SEVERITY_EENUM);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_ISSUE_TYPE_EENUM);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_RESULT_ECLASS);

export function getEPackage(packageName: string, args: { nsPrefix?: string; nsURI?: string }) {
    const ePackage = Ecore.EPackage.Registry.ePackages().find(p => p.get("name") == packageName);
    if(ePackage) {
        if(args.nsURI && ePackage.get("nsURI") !== args.nsURI) {
            throw new Error("Package " + packageName + " already exists with different nsUri: " + ePackage.get("nsURI"));
        } else if(args.nsPrefix && ePackage.get("nsPrefix") !== args.nsPrefix) {
            throw new Error("Package " + packageName + " already exists with different nsPrefix: " + ePackage.get("nsPrefix"));
        } else {
            return ePackage;
        }
    } else {
        const newPackage = Ecore.EPackage.create({
            name: packageName,
            ...args
        });
        Ecore.EPackage.Registry.register(newPackage);
        return newPackage;
    }
}

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
    if(parentNodeDef) {
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

export function ensureECoreModel(packageName: string): EPackage {
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
    root: Node;
    issues: Issue[];
}

export type ASTElement = Node | Position | LocalDate | LocalTime | LocalDateTime | Result | ASTElement[];

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

export function fromEObject(obj: EObject | any, parent?: Node): ASTElement {
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
    if(eClass == THE_POSITION_ECLASS) {
        return new Position(
            new Point(obj.get("start")?.get("line") || 1, obj.get("start")?.get("column") || 0),
            new Point(obj.get("end")?.get("line") || 1, obj.get("end")?.get("column") || 0));
    }
    if(eClass == THE_LOCAL_DATE_ECLASS) {
        return { year: obj.get("year"), month: obj.get("month"), dayOfMonth: obj.get("dayOfMonth") };
    }
    if(eClass == THE_LOCAL_TIME_ECLASS) {
        return {
            hour: obj.get("hour"),
            minute: obj.get("minute"),
            second: obj.get("second"),
            nanosecond: obj.get("nanosecond")
        };
    }
    if(eClass == THE_LOCAL_DATE_TIME_ECLASS) {
        return { date: fromEObject(obj.get("date")) as LocalDate, time: fromEObject(obj.get("time")) as LocalTime };
    }
    if(eClass == THE_RESULT_ECLASS) {
        return {
            root: fromEObject(obj.get("root")) as Node,
            issues: (obj.get("issues") as EList)?.map(
                i => new Issue(
                    decodeEnumLiteral(THE_ISSUE_TYPE_EENUM, i.get("type")),
                    i.get("message"),
                    decodeEnumLiteral(THE_ISSUE_SEVERITY_EENUM, i.get("severity")),
                    fromEObject(i.get("position")) as Position)) as Issue[] || []
        };
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
    fromEObject(eObject: EObject): ASTElement {
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

function isTheNodeClass(eClass) {
    return eClass.eContainer && eClass.eContainer.get("nsURI") == KOLASU_URI_V1 && eClass.get("name") == "ASTNode";
}

function generateASTClass(eClass, pkg: PackageDescription) {
    if(isTheNodeClass(eClass)) {
        return Node;
    }
    const className = eClass.get("name");
    if (pkg.nodes[className]) {
        return pkg.nodes[className];
    }
    const supertypes: EClass[] = eClass.get("eSuperTypes").filter(t => t.isTypeOf("EClass"));
    const superclasses = supertypes.filter(t => !t.get("interface"));
    //const interfaces = supertypes.filter(t => t.get("interface"));
    let nodeSuperclass = undefined;
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
    resource.parse(data);
    return registerPackages(resource);
}

/**
 * Used to track references to resolve once the whole model is loaded.
 */
class ReferencesTracker {
    trackReference() : void {
        const a = 1;
    }
    resolveAllReferences(root: EObject | undefined) : void {
        const a = 1;
    }
}

/**
 * Interprets a string or JSON object as an EObject.
 * @param data the input string or object.
 * @param resource where to look for to resolve references to types.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function loadEObject(data: any, resource: Resource): EObject | undefined {
    if(typeof data === "string") {
        data = JSON.parse(data);
    }
    const referencesTracker = new ReferencesTracker();
    const result = importJsonObject(data, resource, null, true, referencesTracker);
    referencesTracker.resolveAllReferences(result);
    return result;
}

export function findEClass(name: string, resource: Resource): EClass | undefined {
    const index = name.lastIndexOf("#");
    if (index > 0) {
        const packageName = name.substring(0, index);
        const ePackage = EPackage.Registry.getEPackage(packageName);
        if(!ePackage) {
            throw new Error("Package not found: " + packageName);
        }
        return ePackage.get("eClassifiers").find((c: EClassifier) =>
            c.get("name") == name.substring(name.lastIndexOf("/") + 1));
    } else {
        const parts = name.substring(1).split("/").filter(s => s.length > 0);
        const packages = resource.eContents().filter(value => value.isTypeOf("EPackage"));
        if(parts.length == 2) {
            const ePackage = packages[parseInt(parts[0])];
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
 * @param pathsToEObjectsMap paths to ID map to be used to solve references
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function importJsonObject(obj: any, resource: Resource, eClass?: EClass,
                          strict = true, referencesTracker: ReferencesTracker = new ReferencesTracker()): EObject {
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
                position: obj.position ? importJsonObject(obj.position, resource, null, strict, referencesTracker) : undefined
            });
        } else if(samePropertiesAs(propertyNames, THE_POINT_ECLASS)) {
            eClass = THE_POINT_ECLASS;
        } else if(samePropertiesAs(propertyNames, THE_POSITION_ECLASS)) {
            eClass = THE_POSITION_ECLASS;
        } else {
            throw new Error("EClass is not specified and not present in the object");
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
                    const eType = feature.get("eType");
                    if (feature.get("containment") === true) {
                        if (feature.get("many")) {
                            if (obj[key]) {
                                obj[key].forEach((v: any) => eObject.get(key).add(importJsonObject(v, resource, eType, strict, referencesTracker)));
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
                    } else if (feature.get("containment") === false) {
                        const refValue = obj[key];
                        throw new Error(`References are not supported yet. Value: ${JSON.stringify(refValue)}`);
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

/**
 * A parser that supports exporting AST's to EMF/Ecore.
 * In particular, this parser can generate the metamodel. We can then use toEObject(node) to translate a tree
 * into its EMF representation.
 */
export abstract class EMFEnabledParser<R extends Node, P extends ANTLRParser, C extends ParserRuleContext>
    extends Parser<R, P, C> {

    /**
     * Generates the metamodel. The standard Kolasu metamodel [EPackage][org.eclipse.emf.ecore.EPackage] is included.
     */
    generateMetamodel(resource: Resource, includingKolasuMetamodel = true): void {
        if (includingKolasuMetamodel) {
            resource.get("contents").add(THE_AST_EPACKAGE);
        }
        this.doGenerateMetamodel(resource);
    }

    /**
     * Implement this method to tell the parser how to generate the metamodel. See [MetamodelBuilder].
     */
    protected abstract doGenerateMetamodel(resource: Resource): void;
}
