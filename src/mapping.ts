import {ParseTree} from "antlr4ts/tree/ParseTree";
import {ParserRuleContext} from "antlr4ts";
import {Child, Node, NODE_DEFINITION_SYMBOL, Origin, registerNodeDefinition} from "./model/model";
import {TerminalNode} from "antlr4ts/tree/TerminalNode";
import {RuleNode} from "antlr4ts/tree/RuleNode";
import {ASTTransformer, GenericNode, Mapped, registerNodeFactory, transform} from "./transformation/transformation";
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

export function toAST(tree?: ParseTree | null, parent?: Node): Node | undefined {
    if (tree == null)
        tree = undefined;

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

/**
 * Implements a transformation from an ANTLR parse tree (the output of the parser) to an AST (a higher-level
 * representation of the source code).
 */
export class ParseTreeToASTTransformer extends ASTTransformer {

    /**
     * Performs the transformation of a node and, recursively, its descendants. In addition to the overridden method,
     * it also assigns the parseTreeNode to the AST node so that it can keep track of its position.
     * However, a node factory can override the parseTreeNode of the nodes it creates (but not the parent).
     */
    transform(source?: any, parent?: Node): Node | undefined {
        const node = super.transform(source, parent);
        if (node != undefined && node.origin == undefined && source instanceof ParserRuleContext) {
            node.withParseTreeNode(source);
        }
        return node;
    }

    getSource(node: Node, source: any): any {
        const origin = node.origin;
        if (origin instanceof ParseTreeOrigin)
            return origin.parseTree;
        else
            return source;
    }

    asOrigin(source: any): Origin | undefined {
        // TODO: how to check if source is a ParseTree?
        // if (source instanceof ParseTree)
        //     return new ParseTreeOrigin(source);
        // else
        //     return undefined;
        return new ParseTreeOrigin(source);
    }
}

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
    return toAST(this, parent)!;
};
TerminalNode.prototype.toAST = function(parent?: Node): Node {
    return toAST(this, parent)!;
};
