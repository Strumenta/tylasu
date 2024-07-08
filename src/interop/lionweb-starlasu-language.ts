import {deserializeLanguages} from "@lionweb/core";

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
            "id": "com-strumenta-StarLasu",
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
                        "com-strumenta-StarLasu-Char-id",
                        "com-strumenta-StarLasu-Point-id",
                        "com-strumenta-StarLasu-Position-id",
                        "com-strumenta-StarLasu-ASTNode-id",
                        "com-strumenta-StarLasu-PlaceholderNode-id",
                        "com-strumenta-StarLasu-CommonElement-id",
                        "com-strumenta-StarLasu-BehaviorDeclaration-id",
                        "com-strumenta-StarLasu-Documentation-id",
                        "com-strumenta-StarLasu-EntityDeclaration-id",
                        "com-strumenta-StarLasu-EntityGroupDeclaration-id",
                        "com-strumenta-StarLasu-Expression-id",
                        "com-strumenta-StarLasu-Parameter-id",
                        "com-strumenta-StarLasu-PlaceholderElement-id",
                        "com-strumenta-StarLasu-Statement-id",
                        "com-strumenta-StarLasu-TypeAnnotation-id"
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
            "id": "com-strumenta-StarLasu-Char-id",
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
                    "value": "com_strumenta_starlasu-Char-key"
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
            "parent": "com-strumenta-StarLasu"
        },
        {
            "id": "com-strumenta-StarLasu-Point-id",
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
                    "value": "com_strumenta_starlasu-Point-key"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "Point"
                }
            ],
            "containments": [],
            "references": [],
            "annotations": [],
            "parent": "com-strumenta-StarLasu"
        },
        {
            "id": "com-strumenta-StarLasu-Position-id",
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
                    "value": "com_strumenta_starlasu-Position-key"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "Position"
                }
            ],
            "containments": [],
            "references": [],
            "annotations": [],
            "parent": "com-strumenta-StarLasu"
        },
        {
            "id": "com-strumenta-StarLasu-ASTNode-id",
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
                    "value": "com_strumenta_starlasu-ASTNode-key"
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
                    "children": [
                        "com-strumenta-StarLasu-ASTNode-position-id",
                        "com-strumenta-StarLasu-ASTNode-originalNode-id",
                        "com-strumenta-StarLasu-ASTNode-transpiledNode-id"
                    ]
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
            "parent": "com-strumenta-StarLasu"
        },
        {
            "id": "com-strumenta-StarLasu-ASTNode-position-id",
            "classifier": {
                "language": "LionCore-M3",
                "version": "2023.1",
                "key": "Property"
            },
            "properties": [
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "Feature-optional"
                    },
                    "value": "true"
                },
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "IKeyed-key"
                    },
                    "value": "com_strumenta_starlasu-ASTNode-position-key"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "position"
                }
            ],
            "containments": [],
            "references": [
                {
                    "reference": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "Property-type"
                    },
                    "targets": [
                        {
                            "resolveInfo": "Position",
                            "reference": "com-strumenta-StarLasu-Position-id"
                        }
                    ]
                }
            ],
            "annotations": [],
            "parent": "com-strumenta-StarLasu-ASTNode-id"
        },
        {
            "id": "com-strumenta-StarLasu-ASTNode-originalNode-id",
            "classifier": {
                "language": "LionCore-M3",
                "version": "2023.1",
                "key": "Reference"
            },
            "properties": [
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "Link-multiple"
                    },
                    "value": "false"
                },
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "Feature-optional"
                    },
                    "value": "true"
                },
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "IKeyed-key"
                    },
                    "value": "com_strumenta_starlasu-ASTNode-originalNode-key"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "originalNode"
                }
            ],
            "containments": [],
            "references": [
                {
                    "reference": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "Link-type"
                    },
                    "targets": [
                        {
                            "resolveInfo": "ASTNode",
                            "reference": "com-strumenta-StarLasu-ASTNode-id"
                        }
                    ]
                }
            ],
            "annotations": [],
            "parent": "com-strumenta-StarLasu-ASTNode-id"
        },
        {
            "id": "com-strumenta-StarLasu-ASTNode-transpiledNode-id",
            "classifier": {
                "language": "LionCore-M3",
                "version": "2023.1",
                "key": "Reference"
            },
            "properties": [
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "Link-multiple"
                    },
                    "value": "true"
                },
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "Feature-optional"
                    },
                    "value": "true"
                },
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "IKeyed-key"
                    },
                    "value": "com_strumenta_starlasu-ASTNode-transpiledNode-key"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "transpiledNode"
                }
            ],
            "containments": [],
            "references": [
                {
                    "reference": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "Link-type"
                    },
                    "targets": [
                        {
                            "resolveInfo": "ASTNode",
                            "reference": "com-strumenta-StarLasu-ASTNode-id"
                        }
                    ]
                }
            ],
            "annotations": [],
            "parent": "com-strumenta-StarLasu-ASTNode-id"
        },
        {
            "id": "com-strumenta-StarLasu-PlaceholderNode-id",
            "classifier": {
                "language": "LionCore-M3",
                "version": "2023.1",
                "key": "Annotation"
            },
            "properties": [
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "IKeyed-key"
                    },
                    "value": "com_strumenta_starlasu-PlaceholderNode-key"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "PlaceholderNode"
                }
            ],
            "containments": [
                {
                    "containment": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "Classifier-features"
                    },
                    "children": [
                        "com-strumenta-StarLasu-PlaceholderNode-originalNode-id"
                    ]
                }
            ],
            "references": [
                {
                    "reference": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "Annotation-annotates"
                    },
                    "targets": []
                },
                {
                    "reference": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "Annotation-extends"
                    },
                    "targets": []
                },
                {
                    "reference": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "Annotation-implements"
                    },
                    "targets": []
                }
            ],
            "annotations": [],
            "parent": "com-strumenta-StarLasu"
        },
        {
            "id": "com-strumenta-StarLasu-PlaceholderNode-originalNode-id",
            "classifier": {
                "language": "LionCore-M3",
                "version": "2023.1",
                "key": "Reference"
            },
            "properties": [
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "Link-multiple"
                    },
                    "value": "false"
                },
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "Feature-optional"
                    },
                    "value": "true"
                },
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "IKeyed-key"
                    },
                    "value": "com_strumenta_starlasu-PlaceholderNode-originalNode-key"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "originalNode"
                }
            ],
            "containments": [],
            "references": [
                {
                    "reference": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "Link-type"
                    },
                    "targets": [
                        {
                            "resolveInfo": "ASTNode",
                            "reference": "com-strumenta-StarLasu-ASTNode-id"
                        }
                    ]
                }
            ],
            "annotations": [],
            "parent": "com-strumenta-StarLasu-PlaceholderNode-id"
        },
        {
            "id": "com-strumenta-StarLasu-CommonElement-id",
            "classifier": {
                "language": "LionCore-M3",
                "version": "2023.1",
                "key": "Interface"
            },
            "properties": [
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "IKeyed-key"
                    },
                    "value": "com_strumenta_starlasu-CommonElement-key"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "CommonElement"
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
                        "key": "Interface-extends"
                    },
                    "targets": []
                }
            ],
            "annotations": [],
            "parent": "com-strumenta-StarLasu"
        },
        {
            "id": "com-strumenta-StarLasu-BehaviorDeclaration-id",
            "classifier": {
                "language": "LionCore-M3",
                "version": "2023.1",
                "key": "Interface"
            },
            "properties": [
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "IKeyed-key"
                    },
                    "value": "com_strumenta_starlasu-BehaviorDeclaration-key"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "BehaviorDeclaration"
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
                        "key": "Interface-extends"
                    },
                    "targets": [
                        {
                            "resolveInfo": "CommonElement",
                            "reference": "com-strumenta-StarLasu-CommonElement-id"
                        }
                    ]
                }
            ],
            "annotations": [],
            "parent": "com-strumenta-StarLasu"
        },
        {
            "id": "com-strumenta-StarLasu-Documentation-id",
            "classifier": {
                "language": "LionCore-M3",
                "version": "2023.1",
                "key": "Interface"
            },
            "properties": [
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "IKeyed-key"
                    },
                    "value": "com_strumenta_starlasu-Documentation-key"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "Documentation"
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
                        "key": "Interface-extends"
                    },
                    "targets": [
                        {
                            "resolveInfo": "CommonElement",
                            "reference": "com-strumenta-StarLasu-CommonElement-id"
                        }
                    ]
                }
            ],
            "annotations": [],
            "parent": "com-strumenta-StarLasu"
        },
        {
            "id": "com-strumenta-StarLasu-EntityDeclaration-id",
            "classifier": {
                "language": "LionCore-M3",
                "version": "2023.1",
                "key": "Interface"
            },
            "properties": [
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "IKeyed-key"
                    },
                    "value": "com_strumenta_starlasu-EntityDeclaration-key"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "EntityDeclaration"
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
                        "key": "Interface-extends"
                    },
                    "targets": [
                        {
                            "resolveInfo": "CommonElement",
                            "reference": "com-strumenta-StarLasu-CommonElement-id"
                        }
                    ]
                }
            ],
            "annotations": [],
            "parent": "com-strumenta-StarLasu"
        },
        {
            "id": "com-strumenta-StarLasu-EntityGroupDeclaration-id",
            "classifier": {
                "language": "LionCore-M3",
                "version": "2023.1",
                "key": "Interface"
            },
            "properties": [
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "IKeyed-key"
                    },
                    "value": "com_strumenta_starlasu-EntityGroupDeclaration-key"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "EntityGroupDeclaration"
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
                        "key": "Interface-extends"
                    },
                    "targets": [
                        {
                            "resolveInfo": "CommonElement",
                            "reference": "com-strumenta-StarLasu-CommonElement-id"
                        }
                    ]
                }
            ],
            "annotations": [],
            "parent": "com-strumenta-StarLasu"
        },
        {
            "id": "com-strumenta-StarLasu-Expression-id",
            "classifier": {
                "language": "LionCore-M3",
                "version": "2023.1",
                "key": "Interface"
            },
            "properties": [
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "IKeyed-key"
                    },
                    "value": "com_strumenta_starlasu-Expression-key"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "Expression"
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
                        "key": "Interface-extends"
                    },
                    "targets": [
                        {
                            "resolveInfo": "CommonElement",
                            "reference": "com-strumenta-StarLasu-CommonElement-id"
                        }
                    ]
                }
            ],
            "annotations": [],
            "parent": "com-strumenta-StarLasu"
        },
        {
            "id": "com-strumenta-StarLasu-Parameter-id",
            "classifier": {
                "language": "LionCore-M3",
                "version": "2023.1",
                "key": "Interface"
            },
            "properties": [
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "IKeyed-key"
                    },
                    "value": "com_strumenta_starlasu-Parameter-key"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "Parameter"
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
                        "key": "Interface-extends"
                    },
                    "targets": [
                        {
                            "resolveInfo": "CommonElement",
                            "reference": "com-strumenta-StarLasu-CommonElement-id"
                        }
                    ]
                }
            ],
            "annotations": [],
            "parent": "com-strumenta-StarLasu"
        },
        {
            "id": "com-strumenta-StarLasu-PlaceholderElement-id",
            "classifier": {
                "language": "LionCore-M3",
                "version": "2023.1",
                "key": "Interface"
            },
            "properties": [
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "IKeyed-key"
                    },
                    "value": "com_strumenta_starlasu-PlaceholderElement-key"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "PlaceholderElement"
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
                        "key": "Interface-extends"
                    },
                    "targets": [
                        {
                            "resolveInfo": "CommonElement",
                            "reference": "com-strumenta-StarLasu-CommonElement-id"
                        }
                    ]
                }
            ],
            "annotations": [],
            "parent": "com-strumenta-StarLasu"
        },
        {
            "id": "com-strumenta-StarLasu-Statement-id",
            "classifier": {
                "language": "LionCore-M3",
                "version": "2023.1",
                "key": "Interface"
            },
            "properties": [
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "IKeyed-key"
                    },
                    "value": "com_strumenta_starlasu-Statement-key"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "Statement"
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
                        "key": "Interface-extends"
                    },
                    "targets": [
                        {
                            "resolveInfo": "CommonElement",
                            "reference": "com-strumenta-StarLasu-CommonElement-id"
                        }
                    ]
                }
            ],
            "annotations": [],
            "parent": "com-strumenta-StarLasu"
        },
        {
            "id": "com-strumenta-StarLasu-TypeAnnotation-id",
            "classifier": {
                "language": "LionCore-M3",
                "version": "2023.1",
                "key": "Interface"
            },
            "properties": [
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "IKeyed-key"
                    },
                    "value": "com_strumenta_starlasu-TypeAnnotation-key"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "TypeAnnotation"
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
                        "key": "Interface-extends"
                    },
                    "targets": [
                        {
                            "resolveInfo": "CommonElement",
                            "reference": "com-strumenta-StarLasu-CommonElement-id"
                        }
                    ]
                }
            ],
            "annotations": [],
            "parent": "com-strumenta-StarLasu"
        }
    ]
})[0];
