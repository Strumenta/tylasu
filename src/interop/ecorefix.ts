import * as Ecore from "ecore/dist/ecore";

export const EChar = new Ecore.create(Ecore.EObject);
EChar.eClass = Ecore.EDataType;
EChar.set({ name: 'EChar' });

export function ensureEcoreContainsEchar() : void {
    const eChar = Ecore.EcorePackage.get('eClassifiers').find((e)=>e.get("name") === "EChar")
    if (eChar == null) {
        Ecore.EcorePackage.get('eClassifiers').add(EChar);
    }
}

ensureEcoreContainsEchar();