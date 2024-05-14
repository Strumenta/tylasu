/**
 * Lionweb interoperability module.
 * @module interop/lionweb
 */
import {
    Classifier,
    Concept,
    Containment, deserializeChunk,
    Feature as LWFeature,
    Id,
    InstantiationFacade,
    Interface,
    Language,
    Node as LWNodeInterface,
    SerializationChunk
} from "@lionweb/core";
import {NodeAdapter, Issue, Node, NodeDefinition, Position, Feature, Point, pos, TraceNode} from "..";
import {STARLASU_LANGUAGE} from "./lionweb-starlasu-language";
export {STARLASU_LANGUAGE} from "./lionweb-starlasu-language";

export const ASTNode = STARLASU_LANGUAGE.entities.find(e => e.name == "ASTNode")! as Concept;
export const PositionFeature = ASTNode.features.find(f => f.name == "position")! as Containment;
export const PositionClassifier = PositionFeature.type!;
export const PositionStartFeature = PositionClassifier.features.find(f => f.name == "start")! as Containment;
export const PositionEndFeature = PositionClassifier.features.find(f => f.name == "end")! as Containment;
export const PointClassifier = PositionStartFeature.type!;
export const PointLineFeature = PointClassifier.features.find(f => f.name == "line")! as Containment;
export const PointColumnFeature = PointClassifier.features.find(f => f.name == "column")! as Containment;

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

export class TylasuPointWrapper extends TylasuWrapper {

    point = new Point(1, 0);
    constructor(id: Id, parent?: LWNodeInterface) {
        super(id, parent, []);
    }
}

export class TylasuPositionWrapper extends TylasuWrapper {

    position = pos(1, 0, 1, 0);

    constructor(id: Id, parent?: LWNodeInterface) {
        super(id, parent, []);
    }
}

export class LanguageMapping {
    readonly nodeTypes = new Map<any, Classifier>();
    readonly classifiers = new Map<Classifier, any>();

    register(nodeType: any, classifier: Classifier) {
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

function isSpecialConcept(classifier: Classifier | null) {
    return classifier?.key == PositionClassifier.key;
}

function importFeature(feature: LWFeature): Feature | undefined {
    const def: Feature = { name: feature.name };
    if (feature instanceof Containment) {
        if (!isSpecialConcept(feature.type)) {
            def.child = true;
            def.multiple = feature.multiple;
        } else {
            // We don't import the containment because we handle it specially
            return undefined;
        }
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
        if (classifier.key == PositionClassifier.key) {
            return new TylasuPositionWrapper(id, parent);
        } else if (classifier.key == PointClassifier.key) {
            return new TylasuPointWrapper(id, parent);
        } else {
            return this.instantiateNode(classifier, id, parent);
        }
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
            node = new LionwebNode(concept, {
                id,
                parent,
                annotations: []
            });
        }
        return new TylasuNodeWrapper(node, id, parent, []);
    }

    setFeatureValue(node: TylasuWrapper, feature: LWFeature, value: unknown): void {
        if (node instanceof TylasuNodeWrapper) {
            if (feature instanceof Containment) {
                if (feature.key == PositionFeature.key) {
                    node.node.position = (value as TylasuPositionWrapper)?.position;
                } else if (feature.multiple) {
                    node.node.addChild(feature.name, (value as TylasuNodeWrapper)?.node);
                } else {
                    node.node.setChild(feature.name, (value as TylasuNodeWrapper)?.node);
                }
            } else {
                node.node.setAttributeValue(feature.name, value);
            }
        } else if (node instanceof TylasuPositionWrapper) {
            if (feature.key == PositionStartFeature.key) {
                node.position = new Position((value as TylasuPointWrapper).point, node.position.end);
            } else if (feature.key == PositionEndFeature.key) {
                node.position = new Position(node.position.start, (value as TylasuPointWrapper).point);
            }
        }  else if (node instanceof TylasuPointWrapper) {
            if (feature.key == PointLineFeature.key) {
                node.point = new Point(value as number, node.point.column);
            } else if (feature.key == PositionEndFeature.key) {
                node.point = new Point(node.point.line, value as number);
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

export const AST_NODE_CLASSIFIER = findClassifier(STARLASU_LANGUAGE, "com_strumenta_starlasu_ASTNode");
STARLASU_LANGUAGE_MAPPING.register(Node, AST_NODE_CLASSIFIER)

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
        return false;
    }

    isExpression(): boolean {
        return false;
    }

    isStatement(): boolean {
        return false;
    }

    equals(other: NodeAdapter | undefined): boolean {
        return other instanceof LionwebNode && other.lwnode == this.lwnode;
    }
}

export function deserializeToTylasuNodes(
    chunk: SerializationChunk,
    languages: Language[],
    languageMappings: LanguageMapping[] = [STARLASU_LANGUAGE_MAPPING],
    dependentNodes: LWNodeInterface[] = []
): Node[] {
    return deserializeChunk(
        chunk, new TylasuInstantiationFacade(languageMappings), [STARLASU_LANGUAGE, ...languages], dependentNodes
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
