import {ParseTree} from "antlr4ts/tree/ParseTree";
import {ParserRuleContext} from "antlr4ts";
import {Child, Node, NODE_DEFINITION_SYMBOL, registerNodeDefinition} from "./model/model";
import {TerminalNode} from "antlr4ts/tree/TerminalNode";
import {RuleNode} from "antlr4ts/tree/RuleNode";
import {GenericNode, Mapped, registerNodeFactory, transform} from "./transformation/transformation";
import {ParseTreeOrigin} from "./parsing";

/**
 * Registers the decorated node as a target for transformation from the given `type`.
 *
 * Note: this will eventually be integrated with Kolasu-style transformers.
 * @param type the type of the source node to map to this node.
 */
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

export function toAST(tree: ParseTree, parent?: Node): Node {
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
