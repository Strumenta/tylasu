import {ParseTree} from "antlr4ts/tree/ParseTree";
import {ParserRuleContext} from "antlr4ts";
import {Child, Node, NODE_DEFINITION_SYMBOL, registerNodeDefinition} from "./model/model";
import {TerminalNode} from "antlr4ts/tree/TerminalNode";
import {RuleNode} from "antlr4ts/tree/RuleNode";
import {GenericNode, Mapped, registerNodeFactory, transform} from "./transformation/transformation";
import {ParseTreeOrigin} from "./parsing";

export function ASTNodeFor<T extends ParseTree>(type: new (...args: any[]) => T) {
    return function (target: new () => Node): void {
        if(!target[NODE_DEFINITION_SYMBOL]) {
            registerNodeDefinition(target);
        }
        registerNodeFactory(type, () => new target());
    };
}

//-------//
// toAST //
//-------//

export function toAST(tree: ParseTree, parent?: Node): Node | undefined {
    const node = transform(tree, parent, toAST);
    if(node && !node.origin) { //Give a chance to custom factories to set a different node
        node.origin = new ParseTreeOrigin(tree);
    }
    return node;
}

export class GenericParseTreeNode extends GenericNode {
    @Child()
    @Mapped("children")
    childNodes: GenericParseTreeNode[] = [];
}

registerNodeFactory(ParserRuleContext, () => new GenericParseTreeNode());

//Augment the ParseTree class with a toAST method
declare module 'antlr4ts/tree' {
    export interface ParseTree {
        toAST(parent?: Node): Node | undefined;
    }
    export interface RuleNode {
        toAST(parent?: Node): Node | undefined;
    }
    export interface TerminalNode {
        toAST(parent?: Node): Node | undefined;
    }
}

RuleNode.prototype.toAST = function(parent?: Node): Node | undefined {
    return toAST(this, parent);
};
TerminalNode.prototype.toAST = function(parent?: Node): Node | undefined {
    return toAST(this, parent);
};
