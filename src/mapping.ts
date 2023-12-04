import {ParserRuleContext, ParseTree, TerminalNode} from "antlr4ng";
import {Node, NODE_DEFINITION_SYMBOL, Origin, registerNodeDefinition} from "./model/model";
import {ASTTransformer, registerNodeFactory} from "./transformation/transformation";
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
        if (node && node.origin && source instanceof ParserRuleContext) {
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
        if (source instanceof ParserRuleContext || source instanceof TerminalNode)
            return new ParseTreeOrigin(source);
        else
            return undefined;
    }
}
