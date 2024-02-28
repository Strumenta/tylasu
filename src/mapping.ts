import {ParserRuleContext, TerminalNode} from "antlr4ng";
import {Node, Origin} from "./model/model";
import {ASTTransformer} from "./transformation/transformation";
import {ParseTreeOrigin} from "./parsing";


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
