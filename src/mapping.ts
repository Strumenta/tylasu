import {ParseTree} from "antlr4ts/tree/ParseTree";
import {ParserRuleContext} from "antlr4ts";
import {ASTNode, Node, NODE_DEFINITION_SYMBOL} from "./ast";
import {TerminalNode} from "antlr4ts/tree/TerminalNode";
import {RuleNode} from "antlr4ts/tree/RuleNode";
import {registerNodeFactory, transform} from "./transformation";

export function ASTNodeFor<T extends ParseTree>(type: new (...args: any[]) => T) {
    return function (target: new () => Node): void {
        if(!target[NODE_DEFINITION_SYMBOL]) {
            ASTNode("")(target);
        }
        registerNodeFactory(type, () => new target());
    };
}

//-------//
// toAST //
//-------//

export function toAST(tree: ParseTree, parent?: Node): Node {
    const node = transform(tree, parent, toAST);
    if(!node.parseTreeNode) { //Give a chance to custom factories to set a different node
        node.parseTreeNode = tree;
    }
    return node;
}

@ASTNodeFor(ParserRuleContext)
export class GenericNode extends Node {}

//Augment the ParseTree class with a toAST method
declare module 'antlr4ts/tree' {
    export interface ParseTree {
        toAST(parent?: Node): Node;
    }
    export interface RuleNode {
        toAST(parent?: Node): Node;
    }
    export interface TerminalNode {
        toAST(parent?: Node): Node;
    }
}

RuleNode.prototype.toAST = function(parent?: Node): Node {
    return toAST(this, parent);
};
TerminalNode.prototype.toAST = function(parent?: Node): Node {
    return toAST(this, parent);
};