import {ensureNodeDefinition, Node} from "../model/model";
import {Indexer} from "./indexing";

export const TO_JSON_SYMBOL = Symbol("toJSON");

export function toJSON(node: Node, withIds?: Indexer): any {
    return node[TO_JSON_SYMBOL](withIds);
}

export class JSONGenerator {
    toJSON(node: Node, withIds?: Indexer): any {
        return toJSON(node, withIds);
    }
}

export function defaultToJSON(node: Node, withIds?: Indexer) {
    const def = ensureNodeDefinition(node);
    const result = {
        type: (def.package ? def.package + "." : "") + def.name
    };

    if (withIds) {
        const id = withIds.getId(node);
        if (id) {
            result["id"] = id;
        }
    }

    for(const p in node.nodeDefinition.features) {
        const feature = node.nodeDefinition.features[p];
        if(feature.child) {
            if(feature.multiple) {
                const children = node.getChildren(p);
                if (children.length > 0) {
                    result[p] = children.map(e => toJSON(e, withIds));
                }
            } else {
                const child = node.getChild(p);
                if (child) {
                    result[p] = toJSON(child, withIds);
                }
            }
        } else if (feature.reference) {
            const reference = node.getReference(p);
            if (reference) {
                result[p] = {
                    name: reference.name,
                    referred: reference.resolved ? withIds?.getId(reference.referred) : undefined
                }
            }
        } else {
            const attributeValue = node.getAttributeValue(p);
            if (attributeValue !== undefined) {
                result[p] = attributeValue;
            }
        }
    }
    return result;
}

Node.prototype[TO_JSON_SYMBOL] = function (withIds?: Indexer) {
    return defaultToJSON(this as Node, withIds);
}
