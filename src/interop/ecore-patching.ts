import * as Ecore from "ecore/dist/ecore";

// Given the Ecore implementation we have from the ecore.js is not 100% complete and it is unmaintained
// we apply corrections here

export const EBigDecimal = Ecore.create(Ecore.EObject);
EBigDecimal.eClass = Ecore.EDataType;
EBigDecimal.set({ name: 'EBigDecimal' });

export const EBigInteger = Ecore.create(Ecore.EObject);
EBigInteger.eClass = Ecore.EDataType;
EBigInteger.set({ name: 'EBigInteger' });

export const EChar = Ecore.create(Ecore.EObject);
EChar.eClass = Ecore.EDataType;
EChar.set({ name: 'EChar' });

function ensureEcoreContainsDataType(typeName: string, type) {
    const eChar = Ecore.EcorePackage.get('eClassifiers').find((e) => e.get("name") === typeName)
    if (eChar == null) {
        Ecore.EcorePackage.get('eClassifiers').add(type);
    }
}

export function ensureEcoreContainsAllDataTypes() : void {
    ensureEcoreContainsDataType("EBigDecimal", EBigDecimal);
    ensureEcoreContainsDataType("EBigInteger", EBigInteger);
    ensureEcoreContainsDataType("EChar", EChar);
}

ensureEcoreContainsAllDataTypes();