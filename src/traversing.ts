import {Node} from "./ast";

declare module './ast' {
    export interface Node {
        walk(): Generator<Node>;
    }
}

export function* walk(node: Node): Generator<Node> {
    const stack = [node];
    while(stack.length > 0) {
        const currentNode = stack.pop();
        stack.push(...(currentNode.children?.reverse() || []));
        yield currentNode;
    }
}

Node.prototype.walk = function() { return walk(this) };