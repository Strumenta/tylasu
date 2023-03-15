import {ASTNode} from "./model/model";
import {walk} from "./traversing/structurally";
import {first, pipe} from "iter-ops";

declare module './model/model' {
    export interface ASTNode {
        /**
         * Finds the first node that satisfies a condition among this node's descendants.
         * @param predicate the function expressing the condition that the node must satisfy.
         * @param walker the function that generates the nodes to operate on in the desired sequence. By default, this
         * is a depth-first traversal that includes the node on which find() has been called.
         * @return the first node in the AST for which the predicate is true. Returns undefined if none are found.
         */
        find(predicate: (n: ASTNode, index: number) => boolean, walker?: typeof walk): ASTNode | undefined;

        hasValidParents(parent ?: ASTNode) : boolean;
        invalidPositions() : Generator<ASTNode>;
    }
}

/**
 * Finds the first node that satisfies a condition among a node's descendants.
 * @param startingNode the node which is the root of the subtree.
 * @param predicate the function expressing the condition that the node must satisfy.
 * @param walker the function that generates the nodes to operate on in the desired sequence. By default, this is a
 * depth-first traversal that includes the starting node.
 * @return the first node in the AST for which the predicate is true. Returns undefined if none are found.
 */
export function find(
    startingNode: ASTNode, predicate: (n: ASTNode, index: number) => boolean,
    walker: typeof walk = walk): ASTNode | undefined {
    return pipe(walker(startingNode), first(predicate)).first;
}

ASTNode.prototype.find = function(predicate: (n: ASTNode, index: number) => boolean, walker: typeof walk = walk) {
    return find(this, predicate, walker);
};

/**
 * Sets or corrects the parent of all AST nodes.
 * Kolasu does not see set/add/delete operations on the AST nodes,
 * so this function should be called manually after modifying the AST.
 */
export function assignParents(node: ASTNode): void {
    for(const c of node.walkChildren()) {
        c.parent = this;
        assignParents(c);
    }
}

ASTNode.prototype.hasValidParents = function(parent?: ASTNode) : boolean {
    return this.parent == parent &&
        this.children
            .map(c => c.hasValidParents(this))
            .reduce((res, val) => res && val, true);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function* getInvalidPositions(node: ASTNode): Generator<ASTNode> {
    for (const n of this.walk()) {
        if (n.position == undefined || (
            // If the parent position is null, we can't say anything about this node's position
            n.parent?.position != undefined && !(n.parent?.position.contains(n.position.start) && n.parent?.position.contains(n.position.end))
        )) {
            yield n;
        }
    }
}

ASTNode.prototype.invalidPositions = function() {
    return getInvalidPositions(this);
}
