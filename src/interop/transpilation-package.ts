import * as Ecore from "ecore/dist/ecore";
import {getEPackage} from "./ecore-basic";
import {THE_ISSUE_ECLASS, THE_RESULT_ECLASS} from "./starlasu-v2-metamodel";

export const STARLASU_TRANSPILATION_URI_V2 = "https://strumenta.com/starlasu/transpilation/v2";
export const TRANSPILATION_RESOURCE = Ecore.ResourceSet.create().create({ uri: STARLASU_TRANSPILATION_URI_V2 });
export const TRANSPILATION_EPACKAGE = getEPackage("StrumentaLanguageSupportTranspilation", { nsURI: STARLASU_TRANSPILATION_URI_V2 });
TRANSPILATION_RESOURCE.get("contents").add(TRANSPILATION_EPACKAGE);

///
/// TranspilationTrace
///

export const THE_TRANSPILATION_TRACE_ECLASS = Ecore.EClass.create({
    name: "TranspilationTrace",
    abstract: false
});
TRANSPILATION_EPACKAGE.get('eClassifiers').add(THE_TRANSPILATION_TRACE_ECLASS);

// The transpilation trace per-se has no name, but we store the name of the file in this attribute
THE_TRANSPILATION_TRACE_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "name",
    eType: Ecore.EString,
    upperBound: 1
}));
THE_TRANSPILATION_TRACE_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "originalCode",
    eType: Ecore.EString,
    upperBound: 1
}));
THE_TRANSPILATION_TRACE_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "generatedCode",
    eType: Ecore.EString,
    upperBound: 1
}));
THE_TRANSPILATION_TRACE_ECLASS.get("eStructuralFeatures").add(Ecore.EReference.create({
    name: "sourceResult",
    containment: true,
    eType: THE_RESULT_ECLASS
}));
THE_TRANSPILATION_TRACE_ECLASS.get("eStructuralFeatures").add(Ecore.EReference.create({
    name: "targetResult",
    containment: true,
    eType: THE_RESULT_ECLASS
}));
THE_TRANSPILATION_TRACE_ECLASS.get("eStructuralFeatures").add(Ecore.EReference.create({
    name: "issues",
    eGenericType: Ecore.EGenericType.create({ eClassifier: THE_ISSUE_ECLASS }),
    containment: true,
    upperBound: -1
}));

///
/// WorkspaceFile
///

export const THE_WORKSPACE_FILE_ECLASS = Ecore.EClass.create({
    name: "WorkspaceFile",
    abstract: false
});
TRANSPILATION_EPACKAGE.get('eClassifiers').add(THE_WORKSPACE_FILE_ECLASS);

// The transpilation trace per-se has no name, but we store the name of the file in this attribute
THE_WORKSPACE_FILE_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "path",
    eType: Ecore.EString,
    upperBound: 1
}));
THE_WORKSPACE_FILE_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "code",
    eType: Ecore.EString,
    upperBound: 1
}));
THE_WORKSPACE_FILE_ECLASS.get("eStructuralFeatures").add(Ecore.EReference.create({
    name: "result",
    containment: true,
    upperBound: 1,
    eType: THE_RESULT_ECLASS
}));

///
/// WorkspaceTranspilationTrace
///

export const THE_WORKSPACE_TRANSPILATION_TRACE_ECLASS = Ecore.EClass.create({
    name: "WorkspaceTranspilationTrace",
    abstract: false
});
TRANSPILATION_EPACKAGE.get('eClassifiers').add(THE_WORKSPACE_TRANSPILATION_TRACE_ECLASS);

// The workspace transpilation trace per-se has no name, but we store the name of the file in this attribute
THE_WORKSPACE_TRANSPILATION_TRACE_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "name",
    eType: Ecore.EString,
    upperBound: 1
}));
THE_WORKSPACE_TRANSPILATION_TRACE_ECLASS.get("eStructuralFeatures").add(Ecore.EReference.create({
    name: "originalFiles",
    containment: true,
    eType: THE_WORKSPACE_FILE_ECLASS,
    upperBound: -1
}));
THE_WORKSPACE_TRANSPILATION_TRACE_ECLASS.get("eStructuralFeatures").add(Ecore.EReference.create({
    name: "generatedFiles",
    containment: true,
    eType: THE_WORKSPACE_FILE_ECLASS,
    upperBound: -1
}));
THE_WORKSPACE_TRANSPILATION_TRACE_ECLASS.get("eStructuralFeatures").add(Ecore.EReference.create({
    name: "issues",
    eGenericType: Ecore.EGenericType.create({ eClassifier: THE_ISSUE_ECLASS }),
    containment: true,
    upperBound: -1
}));
