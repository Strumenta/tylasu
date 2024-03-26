import {ParserRuleContext, TerminalNode} from "antlr4ng";
import {Node, Origin} from "./model/model";
import {ASTTransformer} from "./transformation/transformation";
import {ParseTreeOrigin} from "./parsing";
import {Issue} from "./validation";
import {Source} from "./model/position";


/**
 * Implements a transformation from an ANTLR parse tree (the output of the parser) to an AST (a higher-level
 * representation of the source code).
 */
export class ParseTreeToASTTransformer extends ASTTransformer {

    constructor(issues: Issue[] = [], allowGenericNode = true, public readonly source?: Source) {
        super(issues, allowGenericNode);
    }

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
        if (origin instanceof ParseTreeOrigin) {
            return origin.parseTree;
        } else {
            return source;
        }
    }

    asOrigin(source: any): Origin | undefined {
        if (source instanceof ParserRuleContext || source instanceof TerminalNode) {
            return new ParseTreeOrigin(source);
        } else {
            return undefined;
        }
    }

    /**
     * Performs the transformation of a node and, recursively, its descendants. In addition to the overridden method,
     * it also assigns the parseTreeNode to the AST node so that it can keep track of its position.
     * However, a node factory can override the parseTreeNode of the nodes it creates (but not the parent).
     */
    transformIntoNodes(source?: any, parent?: Node) {
        const transformed = super.transformIntoNodes(source, parent);
        return transformed.map((node) => {
            if (source instanceof ParserRuleContext) {
                if (node.origin == null) {
                    node.withParseTreeNode(source, this.source);
                } else if (node.position != null && node.source == null) {
                    node.position.source = this.source;
                }
            }
            return node;
        });
    }
}
