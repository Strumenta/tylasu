/**
 * Lionweb interoperability module.
 * @module interop/lionweb
 */
import {
    Classifier,
    Concept,
    Containment, Datatype, DefaultPrimitiveTypeDeserializer, deserializeSerializationChunk,
    Feature as LWFeature,
    Id,
    InstantiationFacade,
    Interface,
    Language,
    Node as LWNodeInterface,
    SerializationChunk
} from "@lionweb/core";
import {
    NodeAdapter,
    Issue,
    Node,
    NodeDefinition,
    Position,
    Feature,
    Point,
    TraceNode,
    getNodeDefinition
} from "..";
import {STARLASU_LANGUAGE} from "./lionweb-starlasu-language";
export {STARLASU_LANGUAGE} from "./lionweb-starlasu-language";

export const ASTNode = STARLASU_LANGUAGE.entities.find(e => e.name == "ASTNode")! as Concept;
export const PositionFeature = ASTNode.features.find(f => f.name == "position")! as Containment;
export const PositionClassifier = PositionFeature.type!;
export const PointClassifier = STARLASU_LANGUAGE.entities.find(e => e.name == "Point")! as Datatype;

export class TylasuWrapper implements LWNodeInterface {
    constructor(
        public readonly id: Id,
        public readonly parent: LWNodeInterface | undefined,
        public readonly annotations: LWNodeInterface[]) {}
}

export class TylasuNodeWrapper extends TylasuWrapper {

    constructor(public readonly node: Node, id: Id, parent: LWNodeInterface | undefined, annotations: LWNodeInterface[]) {
        super(id, parent, annotations);
        node.withParent((parent instanceof TylasuNodeWrapper) ? parent.node : undefined)
    }
}

export class LanguageMapping {
    readonly nodeTypes = new Map<any, Classifier>();
    readonly classifiers = new Map<Classifier, any>();

    register(nodeType: any, classifier: Classifier) {
        if (!classifier) {
            throw new Error(`Can't register ${getNodeDefinition(nodeType)?.name}: not a classifier: ${classifier}`);
        }
        this.nodeTypes.set(nodeType, classifier);
        this.classifiers.set(classifier, nodeType);
    }

    extend(languageMapping: LanguageMapping): this {
        const entries = languageMapping.nodeTypes.entries();
        for (const entry of entries) {
            this.nodeTypes.set(entry[0], entry[1]);
            this.classifiers.set(entry[1], entry[0]);
        }
        return this;
    }
}

function importFeature(feature: LWFeature): Feature | undefined {
    if (feature.parent == AST_NODE_CLASSIFIER) {
        return undefined;
    }
    const def: Feature = { name: feature.name };
    if (feature instanceof Containment) {
        def.child = true;
        def.multiple = feature.multiple;
    }
    return def;
}

function importConcept(concept: NodeDefinition | undefined, classifier: Classifier) {
    concept = {
        name: classifier.name,
        features: {},
        resolved: true
    };
    allFeatures(classifier).forEach(f => {
        const feature = importFeature(f);
        if (feature) {
            concept!.features[f.name] = feature;
        }
    });
    return concept;
}

export class TylasuInstantiationFacade implements InstantiationFacade<TylasuWrapper> {

    protected readonly concepts = new Map<Classifier, NodeDefinition>();

    constructor(public languageMappings: LanguageMapping[] = [STARLASU_LANGUAGE_MAPPING]) {}

    encodingOf(): unknown {
        return undefined;
    }
    nodeFor(parent: TylasuWrapper | undefined, classifier: Classifier, id: string): TylasuWrapper {
        return this.instantiateNode(classifier, id, parent);
    }

    private instantiateNode(classifier: Classifier, id: string, parent: TylasuWrapper | undefined | TylasuNodeWrapper) {
        let node: Node | undefined;
        for (const language of this.languageMappings) {
            const nodeType = language.classifiers.get(classifier);
            if (nodeType) {
                node = new nodeType() as Node;
            }
        }
        if (!node) {
            let concept = this.concepts.get(classifier);
            if (!concept) {
                concept = importConcept(concept, classifier);
                this.concepts.set(classifier, concept);
            }
            node = new LionwebNode(concept, classifier, {
                id,
                parent,
                annotations: []
            });
        }
        return new TylasuNodeWrapper(node, id, parent, []);
    }

    setFeatureValue(node: TylasuWrapper, feature: LWFeature, value: unknown): void {
        if (node instanceof TylasuNodeWrapper) {
            if (feature.parent == AST_NODE_CLASSIFIER) {
                if (feature.name == "position") {
                    node.node.position = value as Position;
                }
            } else if (feature instanceof Containment) {
                if (feature.multiple) {
                    node.node.addChild(feature.name, (value as TylasuNodeWrapper)?.node);
                } else {
                    node.node.setChild(feature.name, (value as TylasuNodeWrapper)?.node);
                }
            } else {
                node.node.setAttributeValue(feature.name, value);
            }
        } else {
            throw new Error("Unsupported node: " + node);
        }
    }
}

export const STARLASU_LANGUAGE_MAPPING = new LanguageMapping();

export function findClassifier(language: Language, id: string) {
    return language.entities.find(e => e.id == id) as Classifier;
}

export const AST_NODE_CLASSIFIER = findClassifier(STARLASU_LANGUAGE, "com-strumenta-StarLasu-ASTNode-id");
STARLASU_LANGUAGE_MAPPING.register(Node, AST_NODE_CLASSIFIER);

function allFeatures(classifier: Classifier) {
    const features = [...classifier.features];
    if (classifier instanceof Concept) {
        const superConcept = classifier.extends;
        if (superConcept) {
            features.push(...allFeatures(superConcept));
        }
        classifier.implements?.forEach(i => {
           features.push(...allFeatures(i));
        });
    } else if (classifier instanceof Interface) {
        classifier.extends?.forEach(i => {
            features.push(...allFeatures(i));
        });
    }
    // TODO remove duplicates, sorting?
    return features;
}

export class LionwebNode extends NodeAdapter {

    parent: LionwebNode;

    get nodeDefinition() {
        return this._nodeDefinition;
    }

    constructor(
        protected readonly _nodeDefinition: NodeDefinition,
        protected readonly classifier: Classifier,
        protected lwnode: LWNodeInterface
    ) {
        super();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    get(...path: string[]): LionwebNode | undefined {
        let result: LionwebNode | undefined = undefined;
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let parent: LionwebNode = this;
        for (const element of path) {
            result = parent.getChild(element) as LionwebNode;
            if (result) {
                parent = result;
            } else {
                return undefined;
            }
        }
        return result;
    }

    getAttributes(): { [p: string]: any } {
        const attributes = {};
        for (const p in this.nodeDefinition.features) {
            if (!this.nodeDefinition.features[p].child) {
                attributes[p] = this.getAttributeValue(p);
            }
        }
        return attributes;
    }

    getId(): string {
        return this.lwnode.id;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getIssues(property?: string): Issue[] | undefined {
        return undefined;
    }

    getPosition(property = "position"): Position | undefined {
        if (!property || property == "position") {
            return super.position;
        }
    }

    isDeclaration(): boolean {
        return this.isOfKnownType("EntityDeclaration");
    }

    isExpression(): boolean {
        return this.isOfKnownType("Expression");
    }

    isStatement(): boolean {
        return this.isOfKnownType("Statement");
    }

    isOfKnownType(name: string): boolean {
        return this.classifier instanceof Concept && conceptImplements(this.classifier, name);
    }

    equals(other: NodeAdapter | undefined): boolean {
        return other instanceof LionwebNode && other.lwnode == this.lwnode;
    }
}

function conceptImplements(concept: Concept, interfaceName: string) {
    const directlyImplements = !!concept.implements.find(intf => intf.name == interfaceName);
    return directlyImplements || !!(concept.extends && conceptImplements(concept.extends, interfaceName));
}

function deserializePoint(value: string) {
    const parts = value.split(":");
    return new Point(Number(parts[0].substring(1)), Number(parts[1]));
}

export function deserializeToTylasuNodes(
    chunk: SerializationChunk,
    languages: Language[],
    languageMappings: LanguageMapping[] = [STARLASU_LANGUAGE_MAPPING],
    dependentNodes: LWNodeInterface[] = []
): Node[] {
    const primitiveTypeDeserializer = new DefaultPrimitiveTypeDeserializer();
    primitiveTypeDeserializer.registerDeserializer(PointClassifier, deserializePoint);
    primitiveTypeDeserializer.registerDeserializer(PositionClassifier, (value) => {
        const parts = value.split("to");
        return new Position(deserializePoint(parts[0].trim()), deserializePoint(parts[1].trim()));
    });

    return deserializeSerializationChunk(
        chunk, new TylasuInstantiationFacade(languageMappings), [STARLASU_LANGUAGE, ...languages],
        dependentNodes, primitiveTypeDeserializer
    )
        .filter(n => n instanceof TylasuNodeWrapper)
        .map(n => (n as TylasuNodeWrapper).node);
}

export function deserializeToTraceNodes(
    chunk: SerializationChunk,
    languages: Language[],
    dependentNodes: LWNodeInterface[] = []
): TraceNode[] {
    return deserializeToTylasuNodes(chunk, languages, [], dependentNodes).map(
        n => new TraceNode(n as LionwebNode));
}
