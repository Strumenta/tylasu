import ECore from "ecore/dist/ecore";
import {
    getEPackage,
} from "./ecore-basic";
import {THE_ISSUE_ECLASS, THE_NODE_ECLASS} from "./starlasu-v2-metamodel";

export const KOLASU_PARSER_URI_V1 = "https://strumenta.com/kolasu/parser/v1";
export const PARSER_RESOURCE = ECore.ResourceSet.create().create({ uri: KOLASU_PARSER_URI_V1 });
export const PARSER_EPACKAGE = getEPackage("StrumentaLanguageSupportParsing", { nsURI: KOLASU_PARSER_URI_V1 });
PARSER_RESOURCE.get("contents").add(PARSER_EPACKAGE);


export const PARSER_TRACE_ECLASS = ECore.EClass.create({
    name: "ParserTrace",
    abstract: false
});
PARSER_EPACKAGE.get('eClassifiers').add(PARSER_TRACE_ECLASS);

PARSER_TRACE_ECLASS.get("eStructuralFeatures").add(ECore.EAttribute.create({
    name: "name",
    eType: ECore.EString,
    upperBound: 1
}));
PARSER_TRACE_ECLASS.get("eStructuralFeatures").add(ECore.EAttribute.create({
    name: "code",
    eType: ECore.EString,
    upperBound: 1
}));
PARSER_TRACE_ECLASS.get("eStructuralFeatures").add(ECore.EReference.create({
    name: "ast",
    containment: true,
    eType: THE_NODE_ECLASS
}));
PARSER_TRACE_ECLASS.get("eStructuralFeatures").add(ECore.EAttribute.create({
    name: "astBuildingTime",
    eType: ECore.ELong,
    upperBound: 1
}));
PARSER_TRACE_ECLASS.get("eStructuralFeatures").add(ECore.EAttribute.create({
    name: "parsingTime",
    eType: ECore.ELong,
    upperBound: 1
}));
PARSER_TRACE_ECLASS.get("eStructuralFeatures").add(ECore.EReference.create({
    name: "issues",
    eGenericType: ECore.EGenericType.create({ eClassifier: THE_ISSUE_ECLASS }),
    containment: true,
    upperBound: -1
}));
