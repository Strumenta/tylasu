import {Node} from "./ast";
import {walk} from "./traversing";
import {first, pipe} from "iter-ops";

declare module './ast' {
    export interface Node {
        /**
         * Finds the first node that satisfies a condition among this node's descendants.
         * @param predicate the function expressing the condition that the node must satisfy.
         * @param walker the function that generates the nodes to operate on in the desired sequence. By default, this
         * is a depth-first traversal that includes the node on which find() has been called.
         * @return the first node in the AST for which the predicate is true. Returns undefined if none are found.
         */
        find(predicate: (n: Node, index: number) => boolean, walker?: typeof walk): Node | undefined;
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
    startingNode: Node, predicate: (n: Node, index: number) => boolean,
    walker: typeof walk = walk): Node | undefined {
    return pipe(walker(startingNode), first(predicate)).first;
}

Node.prototype.find = function(predicate: (n: Node, index: number) => boolean, walker: typeof walk = walk) {
    return find(this, predicate, walker);
};

/**
 * Sets or corrects the parent of all AST nodes.
 * Kolasu does not see set/add/delete operations on the AST nodes,
 * so this function should be called manually after modifying the AST.
 */
export function assignParents(node: Node): void {
    for(const c of node.walkChildren()) {
        c.parent = this;
        assignParents(c);
    }
}
