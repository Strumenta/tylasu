import {Node} from "./ast";

declare module './ast' {
    export interface Node {
        /**
         * A generator that walks the whole AST starting from this node, depth-first.
         */
        walk(): Generator<Node>;
        /**
         * A generator that walks the whole AST starting from the children of this node.
         * @param walker a function that generates a sequence of nodes. By default this is the depth-first "walk" function.
         * For post-order traversal, use "walkLeavesFirst".
         */
        walkDescendants(walker: typeof walk): Generator<Node>;
    }
}

/**
 * A generator that walks the whole AST starting from the provided node, depth-first.
 * @param node the starting node.
 */
export function* walk(node: Node): Generator<Node> {
    const stack = [node];
    while(stack.length > 0) {
        const currentNode = stack.pop();
        stack.push(...(currentNode.children?.reverse() || []));
        yield currentNode;
    }
}

Node.prototype.walk = function() {
    return walk(this)
};

/**
 * A generator that walks the whole AST starting from the children of the given node.
 * @param node the starting node (excluded from the walk).
 * @param walker a function that generates a sequence of nodes. By default this is the depth-first "walk" function.
 * For post-order traversal, use "walkLeavesFirst".
 */
export function* walkDescendants(node: Node, walker: typeof walk = walk): Generator<Node> {
    for(const n of walker(node)) {
        if(n != node) {
            yield n;
        }
    }
}

Node.prototype.walkDescendants = function(walker: typeof walk = walk) {
    return walkDescendants(this, walker)
};