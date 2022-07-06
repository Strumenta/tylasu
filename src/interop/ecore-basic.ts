import {EEnum, EEnumLiteral, EPackage} from "ecore";

export function addLiteral(eenum: EEnum, name: string, value: number): EEnumLiteral {
    const literal = EEnumLiteral.create({
        name, value
    });
    eenum.get("eLiterals").add(literal);
    return literal;
}

export function getEPackage(packageName: string, args: { nsPrefix?: string; nsURI?: string }): EPackage {
    const ePackage = EPackage.Registry.ePackages().find(p => p.get("name") == packageName);
    if(ePackage) {
        if(args.nsURI && ePackage.get("nsURI") !== args.nsURI) {
            throw new Error("Package " + packageName + " already exists with different nsUri: " + ePackage.get("nsURI")+ ". Now using " + args.nsURI);
        } else if(args.nsPrefix && ePackage.get("nsPrefix") !== args.nsPrefix) {
            throw new Error("Package " + packageName + " already exists with different nsPrefix: " + ePackage.get("nsPrefix"));
        } else {
            return ePackage;
        }
    } else {
        const newPackage = EPackage.create({
            name: packageName,
            ...args
        }) as EPackage;
        EPackage.Registry.register(newPackage);
        return newPackage;
    }
}
