import * as Ecore from "ecore/dist/ecore";

// Given the Ecore implementation we have from the ecore.js is not 100% complete and it is unmaintained
// we apply corrections here

export const EChar = Ecore.create(Ecore.EObject);
EChar.eClass = Ecore.EDataType;
EChar.set({ name: 'EChar' });

export function ensureEcoreContainsEchar() : void {
    const eChar = Ecore.EcorePackage.get('eClassifiers').find((e)=>e.get("name") === "EChar")
    if (eChar == null) {
        Ecore.EcorePackage.get('eClassifiers').add(EChar);
    }
}

ensureEcoreContainsEchar();