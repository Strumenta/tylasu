import {ensureNodeDefinition, Node} from "../ast";

export const TO_JSON_SYMBOL = Symbol("toJSON");

export function toJSON(node: Node): any {
    return node[TO_JSON_SYMBOL]();
}

export class JSONGenerator {
    toJSON(node: Node): any {
        return toJSON(node);
    }
}

Node.prototype[TO_JSON_SYMBOL] = function () {
    const def = ensureNodeDefinition(this);
    const result = {
        type: (def.package ? def.package + "." : "") + def.name
    };
    const node = this as Node;
    for(const p in node) {
        if(p == 'parent' || p == 'parseTreeNode') {
            continue;
        }
        const element = node[p];
        if(element !== undefined && element !== null) {
            if(node.isChild(p)) {
                if(element instanceof Node) {
                    result[p] = toJSON(element);
                } else if(Array.isArray(element)) {
                    result[p] = element.map(toJSON);
                }
            } else if(typeof node[p] !== "function") {
                result[p] = node[p];
            }
        }
    }
    return result;
}