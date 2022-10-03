import {Node} from "../model/model";
import {Position} from "../model/position";
import {walk} from "./structurally";

declare module '../model/model' {
    export interface Node {
        /**
         * @param position the position where to search for nodes
         * @param selfContained whether the starting node position contains the positions of all its children.
         * If **true** no further search will be performed in subtrees where the root node falls outside the given position.
         * If **false (default)** the research will cover all nodes from the starting node to the leaves.
         * @return the nearest node to the given [position]. Null if none is found.
         * @see searchByPosition
         */
        findByPosition(position: Position, selfContained: boolean);

        /**
         * @param position the position where to search for nodes
         * @param selfContained whether the starting node position contains the positions of all its children.
         * If **true**: no further search will be performed in subtrees where the root node falls outside the given position.
         * If **false (default)**: the research will cover all nodes from the starting node to the leaves.
         * @return all nodes contained within the given [position] using depth-first search. Empty list if none are found.
         */
        searchByPosition(position: Position, selfContained: boolean): Generator<Node>;

        /**
         * @param position the position within which the walk should remain
         * @return walks the AST within the given [position] starting from this node, depth-first.
         */
        walkWithin(position: Position): Generator<Node>;
    }
}

export function findByPosition(node: Node, position: Position, selfContained = false): Node | undefined {
    for (const n of node.searchByPosition(position, selfContained)) {
        return n;
    }
    return undefined;
}

Node.prototype.findByPosition = function(position: Position, selfContained = false) {
    return findByPosition(this, position, selfContained);
};

export function* searchByPosition(node: Node, position: Position, selfContained = false): Generator<Node> {
    if (selfContained) {
        yield* walkWithin(node, position);
    } else {
        for (const n of walk(node)) {
            if (position.contains(n)) {
                yield n;
            }
        }
    }
}

Node.prototype.searchByPosition = function(position: Position, selfContained = false) {
    return searchByPosition(this, position, selfContained);
};

export function* walkWithin(node: Node, position: Position): Generator<Node> {
    function* walkWithinChildren() {
        for (const c of node.children) {
            yield* walkWithin(c, position);
        }
    }

    if (position.contains(node)) {
        yield node;
        yield* walkWithinChildren();
    } else if (node.contains(position)) {
        yield* walkWithinChildren();
    }
}

Node.prototype.walkWithin = function(position: Position) {
    return walkWithin(this, position);
};
