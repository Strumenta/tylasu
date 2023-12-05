import * as ECore from "ecore/dist/ecore";

// Given the Ecore implementation we have from the ecore.js is not 100% complete and it is unmaintained
// we apply corrections here

export const EBigDecimal = ECore.create(ECore.EObject);
EBigDecimal.eClass = ECore.EDataType;
EBigDecimal.set({ name: 'EBigDecimal' });

export const EBigInteger = ECore.create(ECore.EObject);
EBigInteger.eClass = ECore.EDataType;
EBigInteger.set({ name: 'EBigInteger' });

export const EChar = ECore.create(ECore.EObject);
EChar.eClass = ECore.EDataType;
EChar.set({ name: 'EChar' });

function ensureEcoreContainsDataType(typeName: string, type) {
    const eChar = ECore.EcorePackage.get('eClassifiers').find((e) => e.get("name") === typeName)
    if (eChar == null) {
        ECore.EcorePackage.get('eClassifiers').add(type);
    }
}

export function ensureEcoreContainsAllDataTypes() : void {
    ensureEcoreContainsDataType("EBigDecimal", EBigDecimal);
    ensureEcoreContainsDataType("EBigInteger", EBigInteger);
    ensureEcoreContainsDataType("EChar", EChar);
}

ensureEcoreContainsAllDataTypes();
