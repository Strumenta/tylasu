import {ParsingResult} from "../parsing";
import {EMFEnabledParser, Result, toEObject} from "./ecore";
import {Node} from "../ast";
import * as Ecore from "ecore/dist/ecore";

export function saveForParserBench<R extends Node>(
    result: ParsingResult<R, any>, name: string,
    parser: EMFEnabledParser<R, any, any>, callback: (data: any, error: any) => void): void {
    const resourceSet = Ecore.ResourceSet.create();
    const mmResource = resourceSet.create({ uri: "ast" });
    parser.generateMetamodel(mmResource, false);
    mmResource.set("uri", "");
    const resource = resourceSet.create({ uri: 'file:' + name + ".json" });
    const simplifiedResult: Result = { root: result.root, issues: result.issues };
    const ast = toEObject(simplifiedResult);
    resource.get("contents").add(ast);
    resource.save((data, e) => {
        if (e == null) {
            const parserBenchData: any = {
                ast: data,
                code: result.code,
                name,
                astBuildingTime: result.time
            };
            if (result.firstStage) {
                parserBenchData.parsingTime = result.firstStage.time;
            }
            callback(parserBenchData, e);
        } else {
            callback(undefined, e);
        }
    });
}