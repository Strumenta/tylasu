/**
 * Lionweb interoperability module.
 * @module interop/lionweb
 */
import {
    Classifier,
    Concept,
    Containment,
    Feature as LWFeature,
    Id,
    InstantiationFacade,
    Interface,
    Language,
    Node as LWNodeInterface
} from "@lionweb/core";
import {NodeAdapter, Issue, Node, NodeDefinition, Position, Feature} from "..";
import {STARLASU_LANGUAGE} from "./lionweb-starlasu-language";
export {STARLASU_LANGUAGE} from "./lionweb-starlasu-language";

export const ASTNode = STARLASU_LANGUAGE.entities.find(e => e.name == "ASTNode")!;

export class TylasuNodeWrapper implements LWNodeInterface {
    id: Id;
    node: Node;
    parent?: LWNodeInterface;
    annotations: LWNodeInterface[];
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

function isASTNode(classifier: Classifier) {
    return (classifier instanceof Concept) &&
        (classifier.key == ASTNode.key || (classifier.extends && isASTNode(classifier.extends)));
}

function importFeature(feature: LWFeature): Feature | undefined {
    const def: Feature = { name: feature.name };
    if (feature instanceof Containment) {
        if (isASTNode(feature.classifier)) {
            def.child = true;
            def.multiple = feature.multiple;
        } else {
            // TODO we assume that:
            //  1) we're importing a StarLasu AST
            //  2) containments in a StarLasu AST are either AST nodes or internal StarLasu objects like the position
            return undefined;
        }
    }
    return def
}

export class TylasuInstantiationFacade implements InstantiationFacade<TylasuNodeWrapper> {

    constructor(public languageMappings: LanguageMapping[] = [STARLASU_LANGUAGE_MAPPING]) {}

    encodingOf(): unknown {
        return undefined;
    }
    nodeFor(parent: TylasuNodeWrapper | undefined, classifier: Classifier, id: string): TylasuNodeWrapper {
        let node: Node | undefined;
        for (const language of this.languageMappings) {
            const nodeType = language.classifiers.get(classifier);
            if (nodeType) {
                node = new nodeType() as Node;
            }
        }
        if (!node) {
            node = new LionwebNode(classifier, {
                id,
                parent,
                annotations: []
            });
        }
        return {
            id,
            parent,
            node: node.withParent(parent?.node),
            annotations: []
        };
    }
    setFeatureValue(node: TylasuNodeWrapper, feature: LWFeature, value: unknown): void {
        if (feature instanceof Containment) {
            if (feature.multiple) {
                node.node.addChild(feature.name, (value as TylasuNodeWrapper)?.node);
            } else {
                node.node.setChild(feature.name, (value as TylasuNodeWrapper)?.node);
            }
        } else {
            node.node.setAttributeValue(feature.name, value);
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
    private _nodeDefinition?: NodeDefinition;
    public get nodeDefinition(): NodeDefinition {
        return this._nodeDefinition!;
    }

    constructor(
        public readonly classifier: Classifier,
        protected lwnode: LWNodeInterface
    ) {
        super();
        const features = {};
        allFeatures(classifier).forEach(f => {
            const feature = importFeature(f);
            if (feature) {
                features[f.name] = feature;
            }
        });
        this._nodeDefinition = {
            name: classifier.name,
            features,
            resolved: true
        };
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getPosition(property?: string): Position | undefined {
        return undefined;
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
