import {ModelAPI} from "lioncore/types/api";
import {ASTNode, NODE_TYPES} from "../model/model";
import {Concept, Containment, Feature} from "lioncore";

export const tylasuAPI: ModelAPI<ASTNode> = {
    conceptOf(node: ASTNode): Concept {
        return node.concept!;
    }, getFeatureValue(node: ASTNode, feature: Feature): unknown {
        return node[feature.name];
    }, nodeFor(parent: ASTNode | undefined, concept: Concept, id: string, settings: { [p: string]: unknown }): ASTNode {
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
    }, setFeatureValue(node: ASTNode, feature: Feature, value: unknown): void {
        if (feature instanceof Containment) {
            node.setChild(feature.name, value ? value as ASTNode : undefined);
        } else {
            node[feature.name] = value;
        }
    }

}
