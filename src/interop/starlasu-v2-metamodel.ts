import ECore from "ecore";
import {IssueSeverity, IssueType} from "../validation";
import {addLiteral, getEPackage} from "./ecore-basic";

// Starlasu model definition

export const STARLASU_URI_V2 = "https://strumenta.com/starlasu/v2";

export const THE_AST_RESOURCE = ECore.ResourceSet.create().create({ uri: STARLASU_URI_V2 });
export const THE_AST_EPACKAGE = getEPackage("StrumentaLanguageSupport", { nsURI: STARLASU_URI_V2 });
THE_AST_RESOURCE.get("contents").add(THE_AST_EPACKAGE);
export const THE_ORIGIN_ECLASS = ECore.EClass.create({
    name: "Origin",
    abstract: true
});
export const THE_DESTINATION_INTERFACE = ECore.EClass.create({
    name: "Destination",
    interface: true
});
export const THE_NODE_ECLASS = ECore.EClass.create({
    name: "ASTNode",
    abstract: true,
});
THE_NODE_ECLASS.get("eSuperTypes").add(THE_ORIGIN_ECLASS);
THE_NODE_ECLASS.get("eSuperTypes").add(THE_DESTINATION_INTERFACE);
export const THE_NODE_ORIGIN_ECLASS = ECore.EClass.create({
    name: "NodeOrigin"
});
THE_NODE_ORIGIN_ECLASS.get("eSuperTypes").add(THE_ORIGIN_ECLASS);
THE_NODE_ORIGIN_ECLASS.get("eStructuralFeatures").add(ECore.EReference.create({
    name: "node",
    eType: THE_NODE_ECLASS,
    containment: false,
    lowerBound: 1
}));

export const THE_POINT_ECLASS = ECore.EClass.create({
    name: "Point"
});
THE_POINT_ECLASS.get("eStructuralFeatures").add(ECore.EAttribute.create({
    name: "line",
    eType: ECore.EInt,
    lowerBound: 1
}));
THE_POINT_ECLASS.get("eStructuralFeatures").add(ECore.EAttribute.create({
    name: "column",
    eType: ECore.EInt,
    lowerBound: 1
}));
export const THE_POSITION_ECLASS = ECore.EClass.create({
    name: "Position"
});
THE_POSITION_ECLASS.get("eStructuralFeatures").add(ECore.EReference.create({
    name: "start",
    eType: THE_POINT_ECLASS,
    containment: true,
    lowerBound: 1
}));
THE_POSITION_ECLASS.get("eStructuralFeatures").add(ECore.EReference.create({
    name: "end",
    eType: THE_POINT_ECLASS,
    containment: true,
    lowerBound: 1
}));
THE_ORIGIN_ECLASS.get("eStructuralFeatures").add(ECore.EReference.create({
    name: "position",
    eType: THE_POSITION_ECLASS,
    containment: true
}));
export const THE_SIMPLE_ORIGIN_ECLASS = ECore.EClass.create({
    name: "SimpleOrigin"
});
THE_SIMPLE_ORIGIN_ECLASS.get("eSuperTypes").add(THE_ORIGIN_ECLASS);
THE_SIMPLE_ORIGIN_ECLASS.get("eStructuralFeatures").add(ECore.EAttribute.create({
    name: "sourceText",
    eType: ECore.EString,
    lowerBound: 0
}));
THE_SIMPLE_ORIGIN_ECLASS.get("eStructuralFeatures").add(ECore.EReference.create({
    name: "position",
    eType: THE_POSITION_ECLASS,
    lowerBound: 0,
    containment: true
}));
THE_NODE_ECLASS.get("eStructuralFeatures").add(ECore.EReference.create({
    name: "destination",
    eType: THE_DESTINATION_INTERFACE,
    containment: true,
    lowerBound: 0
}));
THE_NODE_ECLASS.get("eStructuralFeatures").add(ECore.EReference.create({
    name: "origin",
    eType: THE_ORIGIN_ECLASS,
    containment: true,
    lowerBound: 0
}));

export const THE_POSSIBLY_NAMED_INTERFACE = ECore.EClass.create({
    name: "PossiblyNamed",
    interface: true
});
THE_POSSIBLY_NAMED_INTERFACE.get("eStructuralFeatures").add(ECore.EAttribute.create({
    name: "name",
    eType: ECore.EString,
    lowerBound: 0
}));
export const THE_NAMED_INTERFACE = ECore.EClass.create({
    name: "Named",
    interface: true
});
THE_NAMED_INTERFACE.get("eSuperTypes").add(THE_POSSIBLY_NAMED_INTERFACE);
THE_NAMED_INTERFACE.get("eStructuralFeatures").add(ECore.EAttribute.create({
    name: "name",
    eType: ECore.EString,
    lowerBound: 1
}));
export const THE_REFERENCE_BY_NAME_ECLASS = ECore.EClass.create({
    name: "ReferenceByName"
});
THE_REFERENCE_BY_NAME_ECLASS.get("eSuperTypes").add(THE_NAMED_INTERFACE);
THE_REFERENCE_BY_NAME_ECLASS.get("eTypeParameters").add(ECore.ETypeParameter.create({
    name: "N"
}));
THE_REFERENCE_BY_NAME_ECLASS.get("eTypeParameters").at(0).get("eBounds").add(ECore.EGenericType.create({
    eClassifier: THE_POSSIBLY_NAMED_INTERFACE
}));
THE_REFERENCE_BY_NAME_ECLASS.get("eStructuralFeatures").add(ECore.EAttribute.create({
    name: "name",
    eType: ECore.EString,
    lowerBound: 1
}));
THE_REFERENCE_BY_NAME_ECLASS.get("eStructuralFeatures").add(ECore.EReference.create({
    name: "referenced",
    containment: true
}));
THE_REFERENCE_BY_NAME_ECLASS.get("eStructuralFeatures").at(1).set("eGenericType", ECore.EGenericType.create({
    eTypeParameter: THE_REFERENCE_BY_NAME_ECLASS.get("eTypeParameters").at(0)
}));

export const THE_ERROR_NODE_INTERFACE = ECore.EClass.create({
    name: "ErrorNode",
    interface: true
});
THE_ERROR_NODE_INTERFACE.get("eStructuralFeatures").add(ECore.EAttribute.create({
    name: "message",
    eType: ECore.EString,
    lowerBound: 1
}));

export const THE_LOCAL_DATE_ECLASS  = ECore.EClass.create({
    name: "LocalDate"
});
THE_LOCAL_DATE_ECLASS.get("eStructuralFeatures").add(ECore.EAttribute.create({
    name: "year",
    eType: ECore.EInt,
    lowerBound: 1
}));
THE_LOCAL_DATE_ECLASS.get("eStructuralFeatures").add(ECore.EAttribute.create({
    name: "month",
    eType: ECore.EInt,
    lowerBound: 1
}));
THE_LOCAL_DATE_ECLASS.get("eStructuralFeatures").add(ECore.EAttribute.create({
    name: "dayOfMonth",
    eType: ECore.EInt,
    lowerBound: 1
}));

export const THE_LOCAL_TIME_ECLASS  = ECore.EClass.create({
    name: "LocalTime"
});
THE_LOCAL_TIME_ECLASS.get("eStructuralFeatures").add(ECore.EAttribute.create({
    name: "hour",
    eType: ECore.EInt,
    lowerBound: 1
}));
THE_LOCAL_TIME_ECLASS.get("eStructuralFeatures").add(ECore.EAttribute.create({
    name: "minute",
    eType: ECore.EInt,
    lowerBound: 1
}));
THE_LOCAL_TIME_ECLASS.get("eStructuralFeatures").add(ECore.EAttribute.create({
    name: "second",
    eType: ECore.EInt,
    lowerBound: 1
}));
THE_LOCAL_TIME_ECLASS.get("eStructuralFeatures").add(ECore.EAttribute.create({
    name: "nanosecond",
    eType: ECore.EInt,
    lowerBound: 1
}));

export const THE_LOCAL_DATE_TIME_ECLASS  = ECore.EClass.create({
    name: "LocalDateTime"
});
THE_LOCAL_DATE_TIME_ECLASS.get("eStructuralFeatures").add(ECore.EReference.create({
    name: "date",
    eType: THE_LOCAL_DATE_ECLASS,
    lowerBound: 1,
    containment: true
}));
THE_LOCAL_DATE_TIME_ECLASS.get("eStructuralFeatures").add(ECore.EReference.create({
    name: "time",
    eType: THE_LOCAL_TIME_ECLASS,
    lowerBound: 1,
    containment: true
}));


export const THE_ISSUE_TYPE_EENUM = ECore.EEnum.create({
    name: "IssueType"
});
addLiteral(THE_ISSUE_TYPE_EENUM, IssueType[IssueType.LEXICAL], IssueType.LEXICAL);
addLiteral(THE_ISSUE_TYPE_EENUM, IssueType[IssueType.SYNTACTIC], IssueType.SYNTACTIC);
addLiteral(THE_ISSUE_TYPE_EENUM, IssueType[IssueType.SEMANTIC], IssueType.SEMANTIC);

export const THE_ISSUE_SEVERITY_EENUM = ECore.EEnum.create({
    name: "IssueSeverity"
});
addLiteral(THE_ISSUE_SEVERITY_EENUM, IssueSeverity[IssueSeverity.INFO], IssueSeverity.INFO);
addLiteral(THE_ISSUE_SEVERITY_EENUM, IssueSeverity[IssueSeverity.WARNING], IssueSeverity.WARNING);
addLiteral(THE_ISSUE_SEVERITY_EENUM, IssueSeverity[IssueSeverity.ERROR], IssueSeverity.ERROR);

export const THE_ISSUE_ECLASS = ECore.EClass.create({
    name: "Issue"
});
THE_ISSUE_ECLASS.get("eStructuralFeatures").add(ECore.EAttribute.create({
    name: "type",
    eType: THE_ISSUE_TYPE_EENUM,
    lowerBound: 1
}));
THE_ISSUE_ECLASS.get("eStructuralFeatures").add(ECore.EAttribute.create({
    name: "message",
    eType: ECore.EString,
    lowerBound: 1
}));
THE_ISSUE_ECLASS.get("eStructuralFeatures").add(ECore.EAttribute.create({
    name: "severity",
    eType: THE_ISSUE_SEVERITY_EENUM
}));
THE_ISSUE_ECLASS.get("eStructuralFeatures").add(ECore.EReference.create({
    name: "position",
    eType: THE_POSITION_ECLASS,
    containment: true
}));

export const THE_RESULT_ECLASS = ECore.EClass.create({
    name: "Result"
});
const resultTypeParameter = ECore.ETypeParameter.create({ name: "CU" });
(resultTypeParameter.get("eBounds") as ECore.EList).add(ECore.EGenericType.create({
    eClassifier: THE_NODE_ECLASS
}));
THE_RESULT_ECLASS.get("eTypeParameters").add(resultTypeParameter);
THE_RESULT_ECLASS.get("eStructuralFeatures").add(ECore.EReference.create({
    name: "root",
    eGenericType: ECore.EGenericType.create({ eTypeParameter: resultTypeParameter }),
    containment: true
}));
THE_RESULT_ECLASS.get("eStructuralFeatures").add(ECore.EReference.create({
    name: "issues",
    eGenericType: ECore.EGenericType.create({ eClassifier: THE_ISSUE_ECLASS }),
    containment: true,
    upperBound: -1
}));

export const THE_PLACEHOLDER_ELEMENT_INTERFACE = ECore.EClass.create({
    name: "PlaceholderElement",
    interface: true
});
THE_PLACEHOLDER_ELEMENT_INTERFACE.get("eStructuralFeatures").add(ECore.EAttribute.create({
    name: "placeholderName",
    eType: ECore.EString
}));

export const THE_TEXT_FILE_DESTINATION_ECLASS = ECore.EClass.create({
    name: "TextFileDestination"
});
THE_TEXT_FILE_DESTINATION_ECLASS.get("eSuperTypes").add(THE_DESTINATION_INTERFACE);
THE_TEXT_FILE_DESTINATION_ECLASS.get("eStructuralFeatures").add(ECore.EReference.create({
    name: "position",
    eType: THE_POSITION_ECLASS,
    containment: true
}));

// Marker interfaces
export const THE_ENTITY_DECLARATION_INTERFACE = ECore.EClass.create({
    name: "EntityDeclaration",
    interface: true
});
export const THE_EXPRESSION_INTERFACE = ECore.EClass.create({
    name: "Expression",
    interface: true
});
export const THE_STATEMENT_INTERFACE = ECore.EClass.create({
    name: "Statement",
    interface: true
});

THE_AST_EPACKAGE.get('eClassifiers').add(THE_ORIGIN_ECLASS);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_DESTINATION_INTERFACE);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_NODE_ECLASS);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_NODE_ORIGIN_ECLASS);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_SIMPLE_ORIGIN_ECLASS);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_POINT_ECLASS);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_POSITION_ECLASS);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_POSSIBLY_NAMED_INTERFACE);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_NAMED_INTERFACE);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_REFERENCE_BY_NAME_ECLASS);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_ERROR_NODE_INTERFACE);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_LOCAL_DATE_ECLASS);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_LOCAL_TIME_ECLASS);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_LOCAL_DATE_TIME_ECLASS);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_ISSUE_SEVERITY_EENUM);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_ISSUE_TYPE_EENUM);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_ISSUE_ECLASS);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_RESULT_ECLASS);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_PLACEHOLDER_ELEMENT_INTERFACE);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_TEXT_FILE_DESTINATION_ECLASS);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_ENTITY_DECLARATION_INTERFACE);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_EXPRESSION_INTERFACE);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_STATEMENT_INTERFACE);
