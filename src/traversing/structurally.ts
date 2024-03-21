import {Node} from "../model/model";

declare module '../model/model' {
    export interface Node {
        /**
         * A generator that walks over the whole AST starting from this node, depth-first.
         */
        walk(): Generator<Node>;

        /**
         * @return nodes the sequence of nodes from the parent all the way up to the root node.
         * For this to work, the nodes' parents must have been set.
         */
        walkAncestors(): Generator<Node>;

        /**
         * A generator that walks over the whole AST starting from the children of this node.
         * @param walker a function that generates a sequence of nodes. By default, this is the depth-first
         * "walk" function.
         * For post-order traversal, use "walkLeavesFirst".
         */
        walkDescendants(walker?: typeof walk): Generator<Node>;

        /**
         * A generator that walks over the direct children of this node.
         */
        walkChildren(): Generator<Node>;

        /**
         * Note that the type is not strictly forced to be a subclass of Node. This is intended to support
         * interfaces like `Statement` or `Expression`. However, being an ancestor the returned
         * value is guaranteed to be a Node, as only Node instances can be part of the hierarchy.
         *
         * @return ancestor the nearest ancestor of this node that is of type `type`.
         */
        findAncestorOfType(type: any): Node | undefined;
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
        if (currentNode) {
            stack.push(...(currentNode.children?.reverse() || []));
            yield currentNode;
        }
    }
}

Node.prototype.walk = function() {
    return walk(this);
};

/**
 * @return nodes the sequence of nodes from the parent all the way up to the root node.
 * For this to work, the nodes' parents must have been set.
 */
export function* walkAncestors(node?: Node): Generator<Node> {
    if (node?.parent) {
        yield node.parent;
        yield* walkAncestors(node.parent);
    }
}

Node.prototype.walkAncestors = function() {
    return walkAncestors(this);
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

/**
 * @return all direct children of this node.
 */
export function* walkChildren(node: Node): Generator<Node> {
    for (const property of node.features) {
        const value = property.value;
        if (value instanceof Node) {
            yield value;
        }
        if(Array.isArray(value)) {
            for (let i = 0; i < value.length; i++){
                if(value[i] instanceof Node) {
                    yield value[i];
                }
            }
        }
    }
}

Node.prototype.walkChildren = function() {
    return walkChildren(this);
};

/**
 * Note that the type is not strictly forced to be a subclass of Node. This is intended to support
 * interfaces like `Statement` or `Expression`. However, being an ancestor the returned
 * value is guaranteed to be a Node, as only Node instances can be part of the hierarchy.
 *
 * @return ancestor the nearest ancestor of this node that is of type `type`.
 */
export function findAncestorOfType(node: Node | undefined, type: any): Node | undefined {
    for (const ancestor of walkAncestors(node)) {
        if (ancestor instanceof type) {
            return ancestor;
        }
    }
    return undefined;
}

Node.prototype.findAncestorOfType = function(type) {
    return findAncestorOfType(this, type);
};
