/**
 * Lionweb interoperability module.
 * @module interop/lionweb
 */
import {
    Classifier,
    Containment, deserializeLanguages,
    Feature,
    Id,
    InstantiationFacade, Language,
    Node as LionwebNode
} from "@lionweb/core";
import {Node, NodeDefinition, PropertyDefinition} from "..";

export class TylasuNodeWrapper implements LionwebNode {
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

export class DynamicNode extends Node {

    protected readonly _nodeDefinition: NodeDefinition;

    constructor(public readonly classifier: Classifier) {
        super();
        const properties = {};
        classifier.features.forEach(f => {
            properties[f.name] = featureToProperty(f);
        });
        this._nodeDefinition = {
            name: classifier.name,
            properties: properties,
            resolved: true
        };
    }

    public get nodeDefinition(): NodeDefinition {
        return this._nodeDefinition;
    }
}

export class TylasuInstantiationFacade implements InstantiationFacade<TylasuNodeWrapper> {

    constructor(public languageMappings: LanguageMapping[] = [STARLASU_LANGUAGE_MAPPING]) {}

    encodingOf(): unknown {
        return undefined;
    }
    nodeFor(parent: TylasuNodeWrapper | undefined, classifier: Classifier, id: string, propertySettings: {
        [p: string]: unknown
    }): TylasuNodeWrapper {
        let node: Node | undefined;
        for (const language of this.languageMappings) {
            const nodeType = language.classifiers.get(classifier);
            if (nodeType) {
                node = new nodeType() as Node;
            }
        }
        if (!node) {
            node = new DynamicNode(classifier);
        }
        return {
            id,
            parent,
            node: this.setupNode(node, parent?.node, propertySettings),
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
            node.node[feature.name] = value;
        }
    }

    protected setupNode(node: Node, parent: Node | undefined, propertySettings: {
        [p: string]: unknown
    }): Node {
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