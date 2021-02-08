import {Node} from "./ast";
import {walk} from "./traversing";
import itiriri from "itiriri";

declare module './ast' {
    export interface Node {
        find(predicate: (n: Node, index: number) => boolean, walker?: typeof walk): Node | undefined;
    }
}

export function find(
    startingNode: Node, predicate: (n: Node, index: number) => boolean,
    walker: typeof walk = walk): Node | undefined {
    return itiriri(walker(startingNode)).find(predicate);
}

Node.prototype.find = function(predicate: (n: Node, index: number) => boolean, walker: typeof walk = walk) {
    return find(this, predicate, walker);
};