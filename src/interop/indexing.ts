import {ASTNode} from "../model/model";
import {ReferenceByName} from "../model/naming";

export type NodeId = {
    node: ASTNode;
    id?: string;
}

export class Indexer {
    constructor(private nodes: NodeId[]) {}

    getId(node: ASTNode): string | undefined {
        return this.nodes.find(nid => nid.node === node)?.id;
    }

    static computeIds(node: ASTNode) : Indexer {
        return node[COMPUTE_NODE_IDS_SYMBOL]();
    }

    static computeReferencedIds(node: ASTNode) : Indexer {
        return node[COMPUTE_REF_NODE_IDS_SYMBOL]();
    }
}

export interface IdProvider {
    getId(node: ASTNode) : string | undefined
}

export class SequentialIdProvider implements IdProvider {
    constructor(private counter: number = 0) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getId(node: ASTNode): string | undefined {
        return (this.counter++).toString();
    }
}

export class OnlyReferencedIdProvider implements IdProvider {
    private referencedElements: ASTNode[] = [];

    constructor(private root: ASTNode, private idProvider: IdProvider = new SequentialIdProvider()) {
        for (const node of root.walk()) {
            node.properties
                .filter(p => p.value instanceof ReferenceByName)
                .map(p => (p.value as ReferenceByName<any>).referred as ASTNode)
                .forEach(node => this.referencedElements.push(node));
        }
    }

    getId(node: ASTNode): string | undefined {
        const referencedNode = this.referencedElements.find(n => node === n);
        if (referencedNode)
            return this.idProvider.getId(referencedNode);
        return undefined;
    }
}

export const COMPUTE_NODE_IDS_SYMBOL = Symbol("computeIds");
ASTNode.prototype[COMPUTE_NODE_IDS_SYMBOL] = function (
    walker: (node: ASTNode) => Generator<ASTNode> = node => node.walk(),
    idProvider: IdProvider = new SequentialIdProvider()) : Indexer {

    const nodeIds: NodeId[] = [];

    for (const node of walker(this)) {
        const id = idProvider.getId(node);
        if (id)
            nodeIds.push({ node: node, id: id });
    }

    return new Indexer(nodeIds);
}

export const COMPUTE_REF_NODE_IDS_SYMBOL = Symbol("computeReferencedIds");
ASTNode.prototype[COMPUTE_REF_NODE_IDS_SYMBOL] = function (
    walker: (node: ASTNode) => Generator<ASTNode> = node => node.walk(),
    idProvider: IdProvider = new OnlyReferencedIdProvider(this)) : Indexer {

    return this[COMPUTE_NODE_IDS_SYMBOL](walker, idProvider);
}
