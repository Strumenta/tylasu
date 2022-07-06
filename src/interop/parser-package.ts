import * as Ecore from "ecore/dist/ecore";
import {
    getEPackage,
} from "./ecore-basic";
import {THE_NODE_ECLASS} from "./kolasu-v2-metamodel";

export const KOLASU_PARSER_URI_V1 = "https://strumenta.com/kolasu/parser/v1";
export const PARSER_RESOURCE = Ecore.ResourceSet.create().create({ uri: KOLASU_PARSER_URI_V1 });
export const PARSER_EPACKAGE = getEPackage("StrumentaLanguageSupportParsing", { nsURI: KOLASU_PARSER_URI_V1 });
PARSER_RESOURCE.get("contents").add(PARSER_EPACKAGE);


export const PARSER_TRACE_ECLASS = Ecore.EClass.create({
    name: "ParserTrace",
    abstract: false
});
PARSER_EPACKAGE.get('eClassifiers').add(PARSER_TRACE_ECLASS);

PARSER_TRACE_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "name",
    eType: Ecore.EString,
    upperBound: 1
}));
PARSER_TRACE_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "code",
    eType: Ecore.EString,
    upperBound: 1
}));
PARSER_TRACE_ECLASS.get("eStructuralFeatures").add(Ecore.EReference.create({
    name: "ast",
    containment: true,
    eType: THE_NODE_ECLASS
}));
PARSER_TRACE_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "astBuildingTime",
    eType: Ecore.ELong,
    upperBound: 1
}));

