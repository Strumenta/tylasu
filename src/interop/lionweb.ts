/**
 * Lionweb interoperability module.
 * @module interop/lionweb
 */
import {
    Classifier,
    Concept,
    Containment,
    Feature,
    Id,
    InstantiationFacade,
    Interface,
    Language,
    Node as LionwebNodeInterface
} from "@lionweb/core";
import {NodeAdapter, Issue, Node, NodeDefinition, Position, PropertyDefinition} from "..";
import {STARLASU_LANGUAGE} from "./lionweb-starlasu-language";

export class TylasuNodeWrapper implements LionwebNodeInterface {
    id: Id;
    node: Node;
    parent?: LionwebNodeInterface;
    annotations: LionwebNodeInterface[];
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

function featureToProperty(feature: Feature): PropertyDefinition {
    const def: PropertyDefinition = { name: feature.name };
    if (feature instanceof Containment) {
        def.child = true;
        def.multiple = feature.multiple;
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
    setFeatureValue(node: TylasuNodeWrapper, feature: Feature, value: unknown): void {
        if (feature instanceof Containment) {
            if (feature.multiple) {
                node.node.addChild(feature.name, (value as TylasuNodeWrapper)?.node);
            } else {
                node.node.setChild(feature.name, (value as TylasuNodeWrapper)?.node);
            }
        } else {
            node.node.setAttribute(feature.name, value);
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
    public readonly nodeDefinition: NodeDefinition;

    constructor(
        public readonly classifier: Classifier,
        protected lwnode: LionwebNodeInterface
    ) {
        super();
        const properties = {};
        allFeatures(classifier).forEach(f => {
            properties[f.name] = featureToProperty(f);
        });
        this.nodeDefinition = {
            name: classifier.name,
            properties: properties,
            resolved: true
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    get(...path: string[]): NodeAdapter | undefined {
        return undefined; // TODO
    }

    getAttributes(): { [p: string]: any } {
        return {}; // TODO
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

    getRole(): string | undefined {
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
}
