import fs from "fs";
import {EObject, Resource} from "ecore";
import {fromEObject, loadEObject, loadEPackages} from "../interop/ecore";
import * as Ecore from "ecore/dist/ecore";
import {Position} from "../position";

export class TranspilationTrace {
    private sourceToTarget = new Map<string, EObject>()
    constructor(private eo: EObject) {
        this.examineTargetNode(this.eo.get("targetAST"));
    }

    private examineTargetNode(tn: EObject) {
        if (tn.get("origin") != null) {
            const sourceID = this.getEObjectID(tn.get("origin"));
            this.sourceToTarget.set(sourceID, tn);
        }
        tn.eContents().forEach((c)=>this.examineTargetNode(c));
    }

    getDestinationNode(sourceNode: SourceNode) : TargetNode | null {
        const targetEO = this.sourceToTarget.get(this.getEObjectID(sourceNode.eo));
        if (targetEO == null) {
            return null
        }
        return new TargetNode(targetEO, this);
    }

    getRootSourceNode() : SourceNode {
        return new SourceNode(this.eo.get("sourceAST"), this)
    }

    getRootTargetNode() : TargetNode {
        return new TargetNode(this.eo.get("targetAST"), this)
    }

    private getEObjectID(eObject: EObject) : string {
        return eObject.fragment();
    }
}

abstract class Node {
    constructor(public eo: EObject, protected trace: TranspilationTrace) {
    }
    // getContainmentRoles() : string[] {
    //     return eo.eClass.fe
    // }

    getType() : string {
        return this.eo.eClass.eContainer.get("name") + "." + this.getSimpleType();
    }

    getSimpleType() : string {
        return this.eo.eClass.get("name");
    }

    getRole() : string {
        return this.eo.eContainingFeature.get("name");
    }
}

class SourceNode extends Node {
    getPosition() : Position | null {
        const raw = this.eo.get("position");
        if (raw == null) {
            return null
        }
        return fromEObject(raw) as Position;
    }
    getDestinationNode() : TargetNode | null {
        return this.trace.getDestinationNode(this);
    }
    getChildren(role?: string) : SourceNode[] {
        return this.eo.eContents()
            .filter((c) => c.eContainingFeature.get("name") != "position")
            .filter((c)=>role==null || role == c.eContainingFeature.get("name"))
            .map((c)=>new SourceNode(c, this.trace));
    }

}

class TargetNode extends Node {
    getDestination() : Position | null {
        const raw = this.eo.get("destination");
        if (raw == null) {
            return null
        }
        return fromEObject(raw) as Position;
    }
    getSourceNode() : SourceNode | null {
        const rawOrigin = this.eo.get("origin");
        if (rawOrigin == null) {
            return null;
        }
        return new SourceNode(rawOrigin, this.trace);
    }
    getChildren(role?: string) : TargetNode[] {
        return this.eo.eContents()
            .filter((c) => c.eContainingFeature.get("name") != "position")
            .filter((c) => c.eContainingFeature.get("name") != "destination")
            .filter((c)=>role==null || role == c.eContainingFeature.get("name"))
            .map((c)=>new TargetNode(c, this.trace));
    }
}

export class TranspilationTraceLoader {
    private readonly resourceSet: Ecore.ResourceSet
    private readonly resource: Resource

    constructor(...languages: string[]) {
        this.resourceSet = Ecore.ResourceSet.create();
        this.resource = this.resourceSet.create({uri: 'transpilation-dummy.json'});
        languages.forEach((l)=> this.registerLanguageFromFile(l));
    }

    registerLanguageFromFile(metamodelPath: string) : void {
        const languageResource = this.resourceSet.create({uri: 'language_' + metamodelPath})
        loadEPackages(JSON.parse(fs.readFileSync(metamodelPath).toString()),
            languageResource);
    }

    loadTranspilationTraceFromFile(path: string) : TranspilationTrace {
        const text = fs.readFileSync(path, 'utf8')
        const eo = loadEObject(text.toString(), this.resource);
        return new TranspilationTrace(eo);
    }
}
