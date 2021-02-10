import {ParseTree} from "antlr4ts/tree/ParseTree";
import {ParserRuleContext} from "antlr4ts";
import {ASTNode, CHILD_PROPERTIES_SYMBOL, Node} from "./ast";
import {TerminalNode} from "antlr4ts/tree/TerminalNode";
import {RuleNode} from "antlr4ts/tree/RuleNode";

//-----------------------------------//
// Factory and metadata registration //
//-----------------------------------//

const NODE_FACTORY_SYMBOL = Symbol("nodeFactory");
const INIT_SYMBOL = Symbol("init");

export function registerNodeFactory<T extends ParseTree>(type: new (...args: any[]) => T, factory: (tree: T) => Node): void {
    type.prototype[NODE_FACTORY_SYMBOL] = factory;
}

export function registerNodeChild<T extends Node>(
    type: new (...args: any[]) => T, methodName: string, path: string = methodName, map = true): any {
    if (methodName == "parent" || methodName == "children") {
        throw new Error(`Can't register the ${methodName} property as a child`);
    }
    if (!type[CHILD_PROPERTIES_SYMBOL]) {
        type[CHILD_PROPERTIES_SYMBOL] = {};
    }
    const childInfo = map ? {path: path || methodName} : {};
    type[CHILD_PROPERTIES_SYMBOL][methodName] = childInfo;
    return childInfo;
}

export function registerInitializer<T extends Node>(type: new (...args: any[]) => T, methodName: string): void {
    type[INIT_SYMBOL] = methodName;
}

//------------//
// Decorators //
//------------//

export function ASTNodeFor<T extends ParseTree>(type: new (...args: any[]) => T, pkg = "") {
    return function (target: new () => Node): void {
        ASTNode(pkg)(target);
        registerNodeFactory(type, () => new target());
    };
}

export function Child(options: {path?: string, map?: boolean} = {map: true}): (target, methodName: string) => void {
    return function (target, methodName: string) {
        const map = (options.map === undefined) || options.map;
        registerNodeChild(target, methodName, options.path, map);
    };
}

// Since target is any-typed (see https://www.typescriptlang.org/docs/handbook/decorators.html),
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function Init(target, methodName: string): void {
    registerInitializer(target, methodName);
}

//-------//
// toAST //
//-------//

export function fillChildAST(node: Node, property: string, tree: ParseTree): Node[] {
    const childPath = node[CHILD_PROPERTIES_SYMBOL][property].path;
    if (childPath && childPath.length > 0) {
        const path = childPath.split(".");
        for (const segment in path) {
            if (tree && (tree[path[segment]] instanceof Function)) {
                tree = tree[path[segment]]();
            } else {
                tree = null;
                break;
            }
        }
        if (tree) {
            if (Array.isArray(tree)) {
                node[property] = [];
                for (const i in tree) {
                    node[property].push(toAST(tree[i], node));
                }
                return node[property];
            } else {
                node[property] = toAST(tree, node);
                return [node[property]];
            }
        }
    }
    return [];
}

export function toAST(tree: ParseTree, parent?: Node): Node {
    if (!tree) {
        return null;
    }
    const factory = tree[NODE_FACTORY_SYMBOL];
    let node: Node;
    if (factory) {
        node = factory(tree) as Node;
        if (node[CHILD_PROPERTIES_SYMBOL]) {
            for (const p in node[CHILD_PROPERTIES_SYMBOL]) {
                fillChildAST(node, p, tree);
            }
        }
        const initFunction = node[INIT_SYMBOL];
        if (initFunction) {
            node[initFunction].call(node, tree);
        }
    } else {
        node = new GenericNode();
    }
    if(!node.parseTreeNode) { //Give a chance to custom factories to set a different node
        node.parseTreeNode = tree;
    }
    return node.withParent(parent);
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