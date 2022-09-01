import * as Ecore from "ecore/dist/ecore";
import {IssueSeverity, IssueType} from "../validation";
import {EList} from "ecore";
import {addLiteral, getEPackage} from "./ecore-basic";

// Kolasu model definition

export const KOLASU_URI_V2 = "https://strumenta.com/kolasu/v2";

export const THE_AST_RESOURCE = Ecore.ResourceSet.create().create({ uri: KOLASU_URI_V2 });
export const THE_AST_EPACKAGE = getEPackage("com.strumenta.kolasu.v2", { nsURI: KOLASU_URI_V2 });
THE_AST_RESOURCE.get("contents").add(THE_AST_EPACKAGE);
export const THE_ORIGIN_ECLASS = Ecore.EClass.create({
    name: "Origin",
    abstract: true
});
export const THE_NODE_ECLASS = Ecore.EClass.create({
    name: "ASTNode",
    abstract: true,
});
THE_NODE_ECLASS.get("eSuperTypes").add(THE_ORIGIN_ECLASS);
export const THE_POINT_ECLASS = Ecore.EClass.create({
    name: "Point"
});
THE_POINT_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "line",
    eType: Ecore.EInt,
    lowerBound: 1
}));
THE_POINT_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "column",
    eType: Ecore.EInt,
    lowerBound: 1
}));
export const THE_POSITION_ECLASS = Ecore.EClass.create({
    name: "Position"
});
THE_POSITION_ECLASS.get("eStructuralFeatures").add(Ecore.EReference.create({
    name: "start",
    eType: THE_POINT_ECLASS,
    containment: true,
    lowerBound: 1
}));
THE_POSITION_ECLASS.get("eStructuralFeatures").add(Ecore.EReference.create({
    name: "end",
    eType: THE_POINT_ECLASS,
    containment: true,
    lowerBound: 1
}));
THE_ORIGIN_ECLASS.get("eStructuralFeatures").add(Ecore.EReference.create({
    name: "position",
    eType: THE_POSITION_ECLASS,
    containment: true
}));
THE_NODE_ECLASS.get("eStructuralFeatures").add(Ecore.EReference.create({
    name: "destination",
    eType: THE_POSITION_ECLASS,
    containment: true,
    lowerBound: 0
}));
THE_NODE_ECLASS.get("eStructuralFeatures").add(Ecore.EReference.create({
    name: "origin",
    eType: THE_ORIGIN_ECLASS,
    containment: false,
    lowerBound: 0
}));

export const THE_POSSIBLY_NAMED_INTERFACE = Ecore.EClass.create({
    name: "PossiblyNamed",
    interface: true
});
THE_POSSIBLY_NAMED_INTERFACE.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "name",
    eType: Ecore.EString,
    lowerBound: 0
}));
export const THE_NAMED_INTERFACE = Ecore.EClass.create({
    name: "Named",
    interface: true
});
THE_NAMED_INTERFACE.get("eSuperTypes").add(THE_POSSIBLY_NAMED_INTERFACE);
THE_NAMED_INTERFACE.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "name",
    eType: Ecore.EString,
    lowerBound: 1
}));
export const THE_REFERENCE_BY_NAME_ECLASS = Ecore.EClass.create({
    name: "ReferenceByName"
});
THE_REFERENCE_BY_NAME_ECLASS.get("eSuperTypes").add(THE_NAMED_INTERFACE);
THE_REFERENCE_BY_NAME_ECLASS.get("eTypeParameters").add(Ecore.ETypeParameter.create({
    name: "N"
}));
THE_REFERENCE_BY_NAME_ECLASS.get("eTypeParameters").at(0).get("eBounds").add(Ecore.EGenericType.create({
    eClassifier: THE_POSSIBLY_NAMED_INTERFACE
}));
THE_REFERENCE_BY_NAME_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "name",
    eType: Ecore.EString,
    lowerBound: 1
}));
THE_REFERENCE_BY_NAME_ECLASS.get("eStructuralFeatures").add(Ecore.EReference.create({
    name: "referenced",
    containment: true
}));
THE_REFERENCE_BY_NAME_ECLASS.get("eStructuralFeatures").at(1).set("eGenericType", Ecore.EGenericType.create({
    eTypeParameter: THE_REFERENCE_BY_NAME_ECLASS.get("eTypeParameters").at(0)
}));

export const THE_LOCAL_DATE_ECLASS  = Ecore.EClass.create({
    name: "LocalDate"
});
THE_LOCAL_DATE_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "year",
    eType: Ecore.EInt,
    lowerBound: 1
}));
THE_LOCAL_DATE_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "month",
    eType: Ecore.EInt,
    lowerBound: 1
}));
THE_LOCAL_DATE_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "dayOfMonth",
    eType: Ecore.EInt,
    lowerBound: 1
}));

export const THE_LOCAL_TIME_ECLASS  = Ecore.EClass.create({
    name: "LocalTime"
});
THE_LOCAL_TIME_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "hour",
    eType: Ecore.EInt,
    lowerBound: 1
}));
THE_LOCAL_TIME_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "minute",
    eType: Ecore.EInt,
    lowerBound: 1
}));
THE_LOCAL_TIME_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "second",
    eType: Ecore.EInt,
    lowerBound: 1
}));
THE_LOCAL_TIME_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "nanosecond",
    eType: Ecore.EInt,
    lowerBound: 1
}));

export const THE_LOCAL_DATE_TIME_ECLASS  = Ecore.EClass.create({
    name: "LocalDateTime"
});
THE_LOCAL_DATE_TIME_ECLASS.get("eStructuralFeatures").add(Ecore.EReference.create({
    name: "date",
    eType: THE_LOCAL_DATE_ECLASS,
    lowerBound: 1,
    containment: true
}));
THE_LOCAL_DATE_TIME_ECLASS.get("eStructuralFeatures").add(Ecore.EReference.create({
    name: "time",
    eType: THE_LOCAL_TIME_ECLASS,
    lowerBound: 1,
    containment: true
}));


export const THE_ISSUE_TYPE_EENUM = Ecore.EEnum.create({
    name: "IssueType"
});
addLiteral(THE_ISSUE_TYPE_EENUM, IssueType[IssueType.LEXICAL], IssueType.LEXICAL);
addLiteral(THE_ISSUE_TYPE_EENUM, IssueType[IssueType.SYNTACTIC], IssueType.SYNTACTIC);
addLiteral(THE_ISSUE_TYPE_EENUM, IssueType[IssueType.SEMANTIC], IssueType.SEMANTIC);

export const THE_ISSUE_SEVERITY_EENUM = Ecore.EEnum.create({
    name: "IssueSeverity"
});
addLiteral(THE_ISSUE_SEVERITY_EENUM, IssueSeverity[IssueSeverity.INFO], IssueSeverity.INFO);
addLiteral(THE_ISSUE_SEVERITY_EENUM, IssueSeverity[IssueSeverity.WARNING], IssueSeverity.WARNING);
addLiteral(THE_ISSUE_SEVERITY_EENUM, IssueSeverity[IssueSeverity.ERROR], IssueSeverity.ERROR);

export const THE_ISSUE_ECLASS = Ecore.EClass.create({
    name: "Issue"
});
THE_ISSUE_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "type",
    eType: THE_ISSUE_TYPE_EENUM,
    lowerBound: 1
}));
THE_ISSUE_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "message",
    eType: Ecore.EString,
    lowerBound: 1
}));
THE_ISSUE_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "severity",
    eType: THE_ISSUE_SEVERITY_EENUM
}));
THE_ISSUE_ECLASS.get("eStructuralFeatures").add(Ecore.EReference.create({
    name: "position",
    eType: THE_POSITION_ECLASS,
    containment: true
}));

export const THE_RESULT_ECLASS = Ecore.EClass.create({
    name: "Result"
});
const resultTypeParameter = Ecore.ETypeParameter.create({ name: "CU" });
(resultTypeParameter.get("eBounds") as EList).add(Ecore.EGenericType.create({
    eClassifier: THE_NODE_ECLASS
}));
THE_RESULT_ECLASS.get("eTypeParameters").add(resultTypeParameter);
THE_RESULT_ECLASS.get("eStructuralFeatures").add(Ecore.EReference.create({
    name: "root",
    eGenericType: Ecore.EGenericType.create({ eTypeParameter: resultTypeParameter }),
    containment: true
}));
THE_RESULT_ECLASS.get("eStructuralFeatures").add(Ecore.EReference.create({
    name: "issues",
    eGenericType: Ecore.EGenericType.create({ eClassifier: THE_ISSUE_ECLASS }),
    containment: true,
    upperBound: -1
}));

THE_AST_EPACKAGE.get('eClassifiers').add(THE_ORIGIN_ECLASS);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_NODE_ECLASS);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_POINT_ECLASS);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_POSITION_ECLASS);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_POSSIBLY_NAMED_INTERFACE);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_NAMED_INTERFACE);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_REFERENCE_BY_NAME_ECLASS);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_LOCAL_DATE_ECLASS);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_LOCAL_TIME_ECLASS);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_LOCAL_DATE_TIME_ECLASS);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_ISSUE_SEVERITY_EENUM);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_ISSUE_TYPE_EENUM);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_ISSUE_ECLASS);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_RESULT_ECLASS);
