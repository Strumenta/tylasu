import {
    Classifier,
    Containment, deserializeLanguages,
    EnumerationLiteral,
    Feature,
    Id,
    InstantiationFacade, Language,
    Node as LionwebNode
} from "@lionweb/core";
import {Node} from "..";

export class TylasuNode implements LionwebNode {
    id: Id;
    node: Node;
    parent?: LionwebNode;
    annotations: LionwebNode[];
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
        for (let entry of entries) {
            this.nodeTypes.set(entry[0], entry[1]);
            this.classifiers.set(entry[1], entry[0]);
        }
        return this;
    }
}

export class TylasuInstantiationFacade implements InstantiationFacade<TylasuNode> {

    constructor(public languageMappings: LanguageMapping[] = [STARLASU_LANGUAGE_MAPPING]) {}

    encodingOf(literal: EnumerationLiteral): unknown {
        return undefined;
    }
    nodeFor(parent: TylasuNode | undefined, classifier: Classifier, id: string, propertySettings: {
        [p: string]: unknown
    }): TylasuNode {
        let node: Node | undefined;
        for (let language of this.languageMappings) {
            const nodeType = language.classifiers.get(classifier);
            if (nodeType) {
                node = this.makeNode(nodeType, parent?.node, propertySettings);
                break;
            }
        }
        if (node) {
            return {
                id,
                parent,
                node,
                annotations: []
            };
        } else {
            throw new Error("Unknown classifier: " + classifier.id);
        }
    }
    setFeatureValue(node: TylasuNode, feature: Feature, value: unknown): void {
        if (feature instanceof Containment) {
            node.node.setChild(feature.name, (value as TylasuNode)?.node);
        } else {
            node.node[feature.name] = value;
        }
    }

    protected makeNode(nodeType: any, parent: Node | undefined, propertySettings: {
        [p: string]: unknown
    }): Node {
        const node = new nodeType() as Node;
        Object.keys(propertySettings).forEach(k => {
            node[k] = propertySettings[k]; //TODO protect parent, origin etc.
        })
        return node.withParent(parent);
    }

}

export const STARLASU_LANGUAGE_MAPPING = new LanguageMapping();

export const STARLASU_LANGUAGE = deserializeLanguages({
    "serializationFormatVersion": "2023.1",
    "languages": [
        {
            "key": "LionCore-M3",
            "version": "2023.1"
        },
        {
            "key": "LionCore-builtins",
            "version": "2023.1"
        }
    ],
    "nodes": [
        {
            "id": "com_strumenta_starlasu",
            "classifier": {
                "language": "LionCore-M3",
                "version": "2023.1",
                "key": "Language"
            },
            "properties": [
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "Language-version"
                    },
                    "value": "1"
                },
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "IKeyed-key"
                    },
                    "value": "com_strumenta_starlasu"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "com.strumenta.StarLasu"
                }
            ],
            "containments": [
                {
                    "containment": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "Language-entities"
                    },
                    "children": [
                        "com_strumenta_starlasu_ASTNode",
                        "com_strumenta_starlasu_Char"
                    ]
                }
            ],
            "references": [
                {
                    "reference": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "Language-dependsOn"
                    },
                    "targets": []
                }
            ],
            "annotations": [],
            "parent": null
        },
        {
            "id": "com_strumenta_starlasu_ASTNode",
            "classifier": {
                "language": "LionCore-M3",
                "version": "2023.1",
                "key": "Concept"
            },
            "properties": [
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "Concept-abstract"
                    },
                    "value": "false"
                },
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "Concept-partition"
                    },
                    "value": "false"
                },
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "IKeyed-key"
                    },
                    "value": "com_strumenta_starlasu_ASTNode"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "ASTNode"
                }
            ],
            "containments": [
                {
                    "containment": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "Classifier-features"
                    },
                    "children": []
                }
            ],
            "references": [
                {
                    "reference": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "Concept-extends"
                    },
                    "targets": []
                },
                {
                    "reference": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "Concept-implements"
                    },
                    "targets": []
                }
            ],
            "annotations": [],
            "parent": "com_strumenta_starlasu"
        },
        {
            "id": "com_strumenta_starlasu_Char",
            "classifier": {
                "language": "LionCore-M3",
                "version": "2023.1",
                "key": "PrimitiveType"
            },
            "properties": [
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "IKeyed-key"
                    },
                    "value": "com_strumenta_starlasu_Char"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "Char"
                }
            ],
            "containments": [],
            "references": [],
            "annotations": [],
            "parent": "com_strumenta_starlasu"
        }
    ]
})[0];

export function findClassifier(language: Language, id: string) {
    return language.entities.find(e => e.id == id) as Classifier;
}

export const AST_NODE_CLASSIFIER = findClassifier(STARLASU_LANGUAGE, "com_strumenta_starlasu_ASTNode");
STARLASU_LANGUAGE_MAPPING.register(Node, AST_NODE_CLASSIFIER)
