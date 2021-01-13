import {Node} from "../ast";

export const TO_JSON_SYMBOL = Symbol("toJSON");

export class JSONGenerator {
    toJSON(node: Node) {
        return node[TO_JSON_SYMBOL]();
    }
}

Node.prototype[TO_JSON_SYMBOL] = function () {
    const result = {
        type: Object.getPrototypeOf(this).constructor.name
    };
    const node = this as Node;
    for(const p in node) {
        if(p == 'parent') {
            continue;
        }
        const element = node[p];
        if(element !== undefined && element !== null) {
            if(node.isChild(p)) {
                if(element instanceof Node) {
                    result[p] = element[TO_JSON_SYMBOL]();
                } else if(Array.isArray(element)) {
                    result[p] = element.map(e => e[TO_JSON_SYMBOL]());
                }
            } else {
                result[p] = node[p];
            }
        }
    }
    return result;
}