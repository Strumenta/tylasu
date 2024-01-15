import {Node} from "./model";
import {walk} from "../traversing/structurally";
import {first, pipe} from "iter-ops";
import {Issue, IssueSeverity} from "../validation";

declare module './model' {
    export interface Node {
        /**
         * Finds the first node that satisfies a condition among this node's descendants.
         * @param predicate the function expressing the condition that the node must satisfy.
         * @param walker the function that generates the nodes to operate on in the desired sequence. By default, this
         * is a depth-first traversal that includes the node on which find() has been called.
         * @return the first node in the AST for which the predicate is true. Returns undefined if none are found.
         */
        find(predicate: (n: Node, index: number) => boolean, walker?: typeof walk): Node | undefined;

        hasValidParents(parent ?: Node) : boolean;
        invalidPositions() : Generator<Node>;
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
        c.parent = node;
        assignParents(c);
    }
}

Node.prototype.hasValidParents = function(parent?: Node) : boolean {
    return this.parent == parent &&
        this.children
            .map((c: Node) => c.hasValidParents(this))
            .reduce((res: boolean, val: boolean) => res && val, true);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function* getInvalidPositions(node: Node): Generator<Node> {
    for (const n of this.walk()) {
        if (n.position == undefined || (
            // If the parent position is null, we can't say anything about this node's position
            n.parent?.position != undefined && !(n.parent?.position.contains(n.position.start) && n.parent?.position.contains(n.position.end))
        )) {
            yield n;
        }
    }
}

Node.prototype.invalidPositions = function() {
    return getInvalidPositions(this);
}

export class CodeProcessingResult<D> {

    constructor(public readonly code: string, public readonly data: D | undefined, public readonly issues: Issue[]) {}

    get correct(): boolean {
        return !this.issues.find(i => i.severity != IssueSeverity.INFO);
    }

}
