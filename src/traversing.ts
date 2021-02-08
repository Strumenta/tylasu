import {Node} from "./ast";

export function* walk(node: Node): Generator<Node> {
    const stack = [node];
    while(stack.length > 0) {
        const currentNode = stack.pop();
        stack.push(...currentNode.children.reverse());
        yield currentNode;
    }
}