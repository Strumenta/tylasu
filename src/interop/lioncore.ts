import {ModelAPI} from "lioncore/types/api";
import {Node, NODE_TYPES} from "../model/model";
import {Concept, Feature} from "lioncore";

export const tylasuAPI: ModelAPI<Node> = {
    conceptOf(node: Node): Concept {
        return node.concept!;
    }, getFeatureValue(node: Node, feature: Feature): unknown {
        return node[feature.name];
    }, nodeFor(parent: Node | undefined, concept: Concept, id: string, settings: { [p: string]: unknown }): Node {
        const qName = concept.qualifiedName();
        const pkgName = qName.substring(0, qName.length - concept.name.length - 1);
        const pkg = NODE_TYPES[pkgName];
        if (!pkg) {
            throw new Error(`Unknown package: ${pkg}`);
        }
        const nodeClass = pkg.nodes[concept.name];
        if (nodeClass) {
            const node = new nodeClass();
            node.parent = parent;
            node.id = id;
            return node;
        } else {
            throw new Error(`Unknown node class: ${concept.name} in package ${pkg}`);
        }
    }, setFeatureValue(node: Node, feature: Feature, value: unknown): void {
        node[feature.name] = value;
    }

}
