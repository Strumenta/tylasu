import * as ECore from "ecore";

export function addLiteral(eenum: ECore.EEnum, name: string, value: number): ECore.EEnumLiteral {
    const literal = ECore.EEnumLiteral.create({
        name, value
    });
    eenum.get("eLiterals").add(literal);
    return literal;
}

export function getEPackage(packageName: string, args: { nsPrefix?: string; nsURI?: string }): ECore.EPackage {
    const ePackage = ECore.EPackage.Registry.ePackages().find(p => p.get("name") == packageName);
    if(ePackage) {
        if(args.nsURI && ePackage.get("nsURI") !== args.nsURI) {
            throw new Error("Package " + packageName + " already exists with different nsUri: " + ePackage.get("nsURI")+ ". Now using " + args.nsURI);
        } else if(args.nsPrefix && ePackage.get("nsPrefix") !== args.nsPrefix) {
            throw new Error("Package " + packageName + " already exists with different nsPrefix: " + ePackage.get("nsPrefix"));
        } else {
            return ePackage;
        }
    } else {
        const newPackage = ECore.EPackage.create({
            name: packageName,
            ...args
        }) as ECore.EPackage;
        ECore.EPackage.Registry.register(newPackage);
        return newPackage;
    }
}
