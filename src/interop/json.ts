import {ensureNodeDefinition, ASTNode} from "../model/model";
import {ReferenceByName} from "../model/naming";
import {Indexer} from "./indexing";

export const TO_JSON_SYMBOL = Symbol("toJSON");

export function toJSON(node: ASTNode, withIds?: Indexer): any {
    return node[TO_JSON_SYMBOL](withIds);
}

export class JSONGenerator {
    toJSON(node: ASTNode, withIds?: Indexer): any {
        return toJSON(node, withIds);
    }
}

ASTNode.prototype[TO_JSON_SYMBOL] = function (withIds?: Indexer) {
    const def = ensureNodeDefinition(this);
    const result = {
        type: (def.package ? def.package + "." : "") + def.name
    };

    if (withIds) {
        const id = withIds.getId(this);
        if (id)
            result["id"] = id;
    }

    const node = this as ASTNode;
    for(const p in node) {
        if(p == 'parent' || p == 'parseTreeNode') {
            continue;
        }
        const element = node[p];
        if(element !== undefined && element !== null) {
            if(node.isChild(p)) {
                if(element instanceof ASTNode) {
                    result[p] = toJSON(element, withIds);
                } else if(Array.isArray(element)) {
                    result[p] = element.map(e => toJSON(e));
                }
            }
            else if (element instanceof ReferenceByName) {
                const reference = element as ReferenceByName<any>;
                result[p] = {
                    name: reference.name
                }
                if (withIds) {
                    result[p]["referred"] = reference.resolved ? withIds.getId(reference.referred) : undefined;
                }
            }
            else if(typeof node[p] !== "function") {
                result[p] = node[p];
            }
        }
    }
    return result;
}
