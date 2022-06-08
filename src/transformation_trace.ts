import {Node} from "./ast";
import {ParseTree} from "antlr4ts/tree";
import {Point, Position} from "./position";
import {EObject} from "ecore"
import * as Ecore from "ecore/dist/ecore";

export class NodeData {
    //type: string;
    id?: string;
    destination?: NodeData;
    origin?: NodeData;
    //position?: Position;

    constructor(public type: string, public position?: Position) {
    }
}

export interface TranspilationTrace {
    originalCode: string,
    sourceAST: NodeData,
    targetAST: NodeData,
    generatedCode: string
}

export function loadTranspilationTraceFromJSON(json: string) : TranspilationTrace {
    // const p : EPackage = new EPackageImpl()
    // const f : EFactory = new EFactoryImpl()
    // const jr = new JsonResource(p, f)
    // const loaded = jr.fromJson(json)
    // console.log("loaded", loaded);
    // // @ts-ignore
    // console.log("package", p.eContents().size());
    //
    // Dynamic
    const resourceSet = Ecore.ResourceSet.create();
    const mmResource = resourceSet.create({ uri: "some.package" });
    mmResource.load((resource)=>{
        console.log("resource loaded", resource)
    }, (e)=>{
        console.error("Error", e)
    })

    const raw = JSON.parse(json);
    const idsToNodes = new Map<string, NodeData>();
    const deferredDestinations = new Map<string, NodeData>();

    const loadPoint = (json: any): Point => {
        return new Point(json.line, json.column);
    }

    const loadPosition = (json: any): Position => {
        return new Position(loadPoint(json.start), loadPoint(json.end));
    }

    const loadNode = (json: any): NodeData => {
        const result = new NodeData(json["#type"]);
        if ('#position' in json) {
            result.position = loadPosition(json['#position']);
        }
        if ('#id' in json) {
            result.id = json['#id'];
            idsToNodes.set(result.id, result);
        }
        if ('#destination' in json) {
            deferredDestinations.set(json["#destination"], result);
        }
        return result;
    };

    const transpilationTrace: TranspilationTrace = {
        originalCode: raw.originalCode,
        generatedCode: raw.generatedCode,
        sourceAST: loadNode(raw.sourceAST),
        targetAST: loadNode(raw.targetAST)
    };
    return transpilationTrace;
}
