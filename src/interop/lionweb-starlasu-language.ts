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
                        "com-strumenta-StarLasu-PlaceholderNode-PlaceholderNodeType-id",
                        "com-strumenta-StarLasu-CommonElement-id",
                        "com-strumenta-StarLasu-BehaviorDeclaration-id",
                        "com-strumenta-StarLasu-Documentation-id",
                        "com-strumenta-StarLasu-EntityDeclaration-id",
                        "com-strumenta-StarLasu-EntityGroupDeclaration-id",
                        "com-strumenta-StarLasu-Expression-id",
                        "com-strumenta-StarLasu-Parameter-id",
                        "com-strumenta-StarLasu-PlaceholderElement-id",
                        "com-strumenta-StarLasu-Statement-id",
                        "com-strumenta-StarLasu-TypeAnnotation-id",
                        "com-strumenta-StarLasu-Issue-id",
                        "com-strumenta-StarLasu_IssueType",
                        "com-strumenta-StarLasu_IssueSeverity",
                        "com-strumenta-StarLasu-TokensList-id",
                        "com-strumenta-StarLasu-ParsingResult-id"
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
                        "com-strumenta-StarLasu-ASTNode-transpiledNodes-id"
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
            "id": "com-strumenta-StarLasu-ASTNode-transpiledNodes-id",
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
                    "value": "com_strumenta_starlasu-ASTNode-transpiledNodes-key"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "transpiledNodes"
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
                        "com-strumenta-StarLasu-PlaceholderNode-originalNode-id",
                        "com-strumenta-StarLasu-PlaceholderNode-type-id",
                        "com-strumenta-StarLasu-PlaceholderNode-message-id"
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
                    "targets": [
                        {
                            "resolveInfo": "Concept",
                            "reference": "-id-Concept"
                        }
                    ]
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
            "id": "com-strumenta-StarLasu-PlaceholderNode-type-id",
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
                    "value": "false"
                },
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "IKeyed-key"
                    },
                    "value": "com_strumenta_starlasu-PlaceholderNode-type-key"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "type"
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
                            "resolveInfo": "PlaceholderNodeType",
                            "reference": "com-strumenta-StarLasu-PlaceholderNode-PlaceholderNodeType-id"
                        }
                    ]
                }
            ],
            "annotations": [],
            "parent": "com-strumenta-StarLasu-PlaceholderNode-id"
        },
        {
            "id": "com-strumenta-StarLasu-PlaceholderNode-message-id",
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
                    "value": "false"
                },
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "IKeyed-key"
                    },
                    "value": "com_strumenta_starlasu-PlaceholderNode-message-key"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "message"
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
                            "resolveInfo": "String",
                            "reference": "LionCore-builtins-String"
                        }
                    ]
                }
            ],
            "annotations": [],
            "parent": "com-strumenta-StarLasu-PlaceholderNode-id"
        },
        {
            "id": "com-strumenta-StarLasu-PlaceholderNode-PlaceholderNodeType-id",
            "classifier": {
                "language": "LionCore-M3",
                "version": "2023.1",
                "key": "Enumeration"
            },
            "properties": [
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "IKeyed-key"
                    },
                    "value": "com_strumenta_starlasu-PlaceholderNode-PlaceholderNodeType-key"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "PlaceholderNodeType"
                }
            ],
            "containments": [
                {
                    "containment": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "Enumeration-literals"
                    },
                    "children": [
                        "com-strumenta-StarLasu-PlaceholderNode-PlaceholderNodeType-MissingASTTransformation-id",
                        "com-strumenta-StarLasu-PlaceholderNode-PlaceholderNodeType-FailingASTTransformation-id"
                    ]
                }
            ],
            "references": [],
            "annotations": [],
            "parent": "com-strumenta-StarLasu"
        },
        {
            "id": "com-strumenta-StarLasu-PlaceholderNode-PlaceholderNodeType-MissingASTTransformation-id",
            "classifier": {
                "language": "LionCore-M3",
                "version": "2023.1",
                "key": "EnumerationLiteral"
            },
            "properties": [
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "IKeyed-key"
                    },
                    "value": "com-strumenta-StarLasu-PlaceholderNode-PlaceholderNodeType-id-MissingASTTransformation-key"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "MissingASTTransformation"
                }
            ],
            "containments": [],
            "references": [],
            "annotations": [],
            "parent": "com-strumenta-StarLasu-PlaceholderNode-PlaceholderNodeType-id"
        },
        {
            "id": "com-strumenta-StarLasu-PlaceholderNode-PlaceholderNodeType-FailingASTTransformation-id",
            "classifier": {
                "language": "LionCore-M3",
                "version": "2023.1",
                "key": "EnumerationLiteral"
            },
            "properties": [
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "IKeyed-key"
                    },
                    "value": "com-strumenta-StarLasu-PlaceholderNode-PlaceholderNodeType-id-FailingASTTransformation-key"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "FailingASTTransformation"
                }
            ],
            "containments": [],
            "references": [],
            "annotations": [],
            "parent": "com-strumenta-StarLasu-PlaceholderNode-PlaceholderNodeType-id"
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
        },
        {
            "id": "com-strumenta-StarLasu-Issue-id",
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
                    "value": "com_strumenta_starlasu-Issue-key"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "Issue"
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
                        "com-strumenta-StarLasu-Issue-type-id",
                        "com-strumenta-StarLasu-Issue-message-id",
                        "com-strumenta-StarLasu-Issue-severity-id",
                        "com-strumenta-StarLasu-Issue-position-id"
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
            "id": "com-strumenta-StarLasu-Issue-type-id",
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
                    "value": "false"
                },
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "IKeyed-key"
                    },
                    "value": "com_strumenta_starlasu-Issue-type-key"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "type"
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
                            "resolveInfo": "IssueType",
                            "reference": "com-strumenta-StarLasu_IssueType"
                        }
                    ]
                }
            ],
            "annotations": [],
            "parent": "com-strumenta-StarLasu-Issue-id"
        },
        {
            "id": "com-strumenta-StarLasu-Issue-message-id",
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
                    "value": "false"
                },
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "IKeyed-key"
                    },
                    "value": "com_strumenta_starlasu-Issue-message-key"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "message"
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
                            "resolveInfo": "String",
                            "reference": "LionCore-builtins-String"
                        }
                    ]
                }
            ],
            "annotations": [],
            "parent": "com-strumenta-StarLasu-Issue-id"
        },
        {
            "id": "com-strumenta-StarLasu-Issue-severity-id",
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
                    "value": "false"
                },
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "IKeyed-key"
                    },
                    "value": "com_strumenta_starlasu-Issue-severity-key"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "severity"
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
                            "resolveInfo": "IssueSeverity",
                            "reference": "com-strumenta-StarLasu_IssueSeverity"
                        }
                    ]
                }
            ],
            "annotations": [],
            "parent": "com-strumenta-StarLasu-Issue-id"
        },
        {
            "id": "com-strumenta-StarLasu-Issue-position-id",
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
                    "value": "com_strumenta_starlasu-Issue-position-key"
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
            "parent": "com-strumenta-StarLasu-Issue-id"
        },
        {
            "id": "com-strumenta-StarLasu_IssueType",
            "classifier": {
                "language": "LionCore-M3",
                "version": "2023.1",
                "key": "Enumeration"
            },
            "properties": [
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "IKeyed-key"
                    },
                    "value": "IssueType"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "IssueType"
                }
            ],
            "containments": [
                {
                    "containment": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "Enumeration-literals"
                    },
                    "children": [
                        "com-strumenta-StarLasu_IssueType-LEXICAL",
                        "com-strumenta-StarLasu_IssueType-SYNTACTIC",
                        "com-strumenta-StarLasu_IssueType-SEMANTIC",
                        "com-strumenta-StarLasu_IssueType-TRANSLATION"
                    ]
                }
            ],
            "references": [],
            "annotations": [],
            "parent": "com-strumenta-StarLasu"
        },
        {
            "id": "com-strumenta-StarLasu_IssueType-LEXICAL",
            "classifier": {
                "language": "LionCore-M3",
                "version": "2023.1",
                "key": "EnumerationLiteral"
            },
            "properties": [
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "IKeyed-key"
                    },
                    "value": "IssueType-LEXICAL"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "LEXICAL"
                }
            ],
            "containments": [],
            "references": [],
            "annotations": [],
            "parent": "com-strumenta-StarLasu_IssueType"
        },
        {
            "id": "com-strumenta-StarLasu_IssueType-SYNTACTIC",
            "classifier": {
                "language": "LionCore-M3",
                "version": "2023.1",
                "key": "EnumerationLiteral"
            },
            "properties": [
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "IKeyed-key"
                    },
                    "value": "IssueType-SYNTACTIC"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "SYNTACTIC"
                }
            ],
            "containments": [],
            "references": [],
            "annotations": [],
            "parent": "com-strumenta-StarLasu_IssueType"
        },
        {
            "id": "com-strumenta-StarLasu_IssueType-SEMANTIC",
            "classifier": {
                "language": "LionCore-M3",
                "version": "2023.1",
                "key": "EnumerationLiteral"
            },
            "properties": [
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "IKeyed-key"
                    },
                    "value": "IssueType-SEMANTIC"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "SEMANTIC"
                }
            ],
            "containments": [],
            "references": [],
            "annotations": [],
            "parent": "com-strumenta-StarLasu_IssueType"
        },
        {
            "id": "com-strumenta-StarLasu_IssueType-TRANSLATION",
            "classifier": {
                "language": "LionCore-M3",
                "version": "2023.1",
                "key": "EnumerationLiteral"
            },
            "properties": [
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "IKeyed-key"
                    },
                    "value": "IssueType-TRANSLATION"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "TRANSLATION"
                }
            ],
            "containments": [],
            "references": [],
            "annotations": [],
            "parent": "com-strumenta-StarLasu_IssueType"
        },
        {
            "id": "com-strumenta-StarLasu_IssueSeverity",
            "classifier": {
                "language": "LionCore-M3",
                "version": "2023.1",
                "key": "Enumeration"
            },
            "properties": [
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "IKeyed-key"
                    },
                    "value": "IssueSeverity"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "IssueSeverity"
                }
            ],
            "containments": [
                {
                    "containment": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "Enumeration-literals"
                    },
                    "children": [
                        "com-strumenta-StarLasu_IssueSeverity-ERROR",
                        "com-strumenta-StarLasu_IssueSeverity-WARNING",
                        "com-strumenta-StarLasu_IssueSeverity-INFO"
                    ]
                }
            ],
            "references": [],
            "annotations": [],
            "parent": "com-strumenta-StarLasu"
        },
        {
            "id": "com-strumenta-StarLasu_IssueSeverity-ERROR",
            "classifier": {
                "language": "LionCore-M3",
                "version": "2023.1",
                "key": "EnumerationLiteral"
            },
            "properties": [
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "IKeyed-key"
                    },
                    "value": "IssueSeverity-ERROR"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "ERROR"
                }
            ],
            "containments": [],
            "references": [],
            "annotations": [],
            "parent": "com-strumenta-StarLasu_IssueSeverity"
        },
        {
            "id": "com-strumenta-StarLasu_IssueSeverity-WARNING",
            "classifier": {
                "language": "LionCore-M3",
                "version": "2023.1",
                "key": "EnumerationLiteral"
            },
            "properties": [
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "IKeyed-key"
                    },
                    "value": "IssueSeverity-WARNING"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "WARNING"
                }
            ],
            "containments": [],
            "references": [],
            "annotations": [],
            "parent": "com-strumenta-StarLasu_IssueSeverity"
        },
        {
            "id": "com-strumenta-StarLasu_IssueSeverity-INFO",
            "classifier": {
                "language": "LionCore-M3",
                "version": "2023.1",
                "key": "EnumerationLiteral"
            },
            "properties": [
                {
                    "property": {
                        "language": "LionCore-M3",
                        "version": "2023.1",
                        "key": "IKeyed-key"
                    },
                    "value": "IssueSeverity-INFO"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "INFO"
                }
            ],
            "containments": [],
            "references": [],
            "annotations": [],
            "parent": "com-strumenta-StarLasu_IssueSeverity"
        },
        {
            "id": "com-strumenta-StarLasu-TokensList-id",
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
                    "value": "com_strumenta_starlasu-TokensList-key"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "TokensList"
                }
            ],
            "containments": [],
            "references": [],
            "annotations": [],
            "parent": "com-strumenta-StarLasu"
        },
        {
            "id": "com-strumenta-StarLasu-ParsingResult-id",
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
                    "value": "com_strumenta_starlasu-ParsingResult-key"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "ParsingResult"
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
                        "com-strumenta-StarLasu-ParsingResult-issues-id",
                        "com-strumenta-StarLasu-ParsingResult-root-id",
                        "com-strumenta-StarLasu-ParsingResult-code-id",
                        "com-strumenta-StarLasu-ParsingResult-tokens-id"
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
            "id": "com-strumenta-StarLasu-ParsingResult-issues-id",
            "classifier": {
                "language": "LionCore-M3",
                "version": "2023.1",
                "key": "Containment"
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
                    "value": "com_strumenta_starlasu-ParsingResult-issues-key"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "issues"
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
                            "resolveInfo": "Issue",
                            "reference": "com-strumenta-StarLasu-Issue-id"
                        }
                    ]
                }
            ],
            "annotations": [],
            "parent": "com-strumenta-StarLasu-ParsingResult-id"
        },
        {
            "id": "com-strumenta-StarLasu-ParsingResult-root-id",
            "classifier": {
                "language": "LionCore-M3",
                "version": "2023.1",
                "key": "Containment"
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
                    "value": "com_strumenta_starlasu-ParsingResult-root-key"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "root"
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
            "parent": "com-strumenta-StarLasu-ParsingResult-id"
        },
        {
            "id": "com-strumenta-StarLasu-ParsingResult-code-id",
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
                    "value": "com_strumenta_starlasu-ParsingResult-code-key"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "code"
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
                            "resolveInfo": "String",
                            "reference": "LionCore-builtins-String"
                        }
                    ]
                }
            ],
            "annotations": [],
            "parent": "com-strumenta-StarLasu-ParsingResult-id"
        },
        {
            "id": "com-strumenta-StarLasu-ParsingResult-tokens-id",
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
                    "value": "com_strumenta_starlasu-ParsingResult-tokens-key"
                },
                {
                    "property": {
                        "language": "LionCore-builtins",
                        "version": "2023.1",
                        "key": "LionCore-builtins-INamed-name"
                    },
                    "value": "tokens"
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
                            "resolveInfo": "TokensList",
                            "reference": "com-strumenta-StarLasu-TokensList-id"
                        }
                    ]
                }
            ],
            "annotations": [],
            "parent": "com-strumenta-StarLasu-ParsingResult-id"
        }
    ]
})[0];
