import {ASTNode} from "../model/model";
import {Position} from "../model/position";
import {last, pipe} from "iter-ops";

declare module '../model/model' {
    export interface ASTNode {
        /**
         * @param position the position where to search for nodes
         * @param selfContained whether the starting node position contains the positions of all its children.
         * If **true** no further search will be performed in subtrees where the root node falls outside the given position.
         * If **false (default)** the research will cover all nodes from the starting node to the leaves.
         * @return the node most closely containing the given [position]. `undefined` if none is found.
         * @see searchByPosition
         */
        findByPosition(position: Position, selfContained?: boolean): ASTNode | undefined;

        /**
         * @param position the position where to search for nodes
         * @param selfContained whether the starting node position contains the positions of all its children.
         * If **true**: no further search will be performed in subtrees where the root node falls outside the given position.
         * * If **false (default)**: the search will cover all nodes from the starting node to the leaves.
         * In any case, the search stops at the first subtree found to be containing the position.
         * @return all nodes containing the given [position] using depth-first search. Empty list if none are found.
         */
        searchByPosition(position: Position, selfContained?: boolean): Generator<ASTNode>;

        /**
         * @param position the position within which the walk should remain
         * @return walks the AST within the given [position] starting from this node, depth-first.
         */
        walkWithin(position: Position): Generator<ASTNode>;
    }
}

export function findByPosition(node: ASTNode, position: Position, selfContained = false): ASTNode | undefined {
    return pipe(searchByPosition(node, position, selfContained), last()).first;
}

ASTNode.prototype.findByPosition = function(position: Position, selfContained = false) {
    return findByPosition(this, position, selfContained);
};

export function* searchByPosition(node: ASTNode, position: Position, selfContained = false): Generator<ASTNode> {
    const contains = node.contains(position);
    if (!selfContained || contains) {
        if (node.children.length == 0) {
            if (contains) {
                yield node;
            }
        } else {
            let returnedSelf = false;
            for (const c of node.children) {
                const nodes = searchByPosition(c, position, selfContained);
                for (const n of nodes) {
                    if (!returnedSelf) {
                        yield node;
                        returnedSelf = true;
                    }
                    yield n;
                }
            }
            if (contains && !returnedSelf) {
                yield node;
            }
        }
    }
}

ASTNode.prototype.searchByPosition = function(position: Position, selfContained = false) {
    return searchByPosition(this, position, selfContained);
};

export function* walkWithin(node: ASTNode, position: Position): Generator<ASTNode> {
    function* walkWithinChildren() {
        for (const c of node.children) {
            yield* walkWithin(c, position);
        }
    }

    if (position.contains(node)) {
        yield node;
        yield* walkWithinChildren();
    } else if (node.overlaps(position)) {
        yield* walkWithinChildren();
    }
}

ASTNode.prototype.walkWithin = function(position: Position) {
    return walkWithin(this, position);
};
