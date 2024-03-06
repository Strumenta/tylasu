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
