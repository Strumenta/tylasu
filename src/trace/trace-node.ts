import {Node, NodeDefinition} from "../model/model";
import {Position} from "../model/position";
import {Issue} from "../validation";

export abstract class NodeAdapter extends Node {
    abstract parent?: NodeAdapter;
    abstract get nodeDefinition(): NodeDefinition;

    abstract get(...path: string[]): NodeAdapter | undefined;

    abstract getAttributes(): { [name: string]: any };

    getChildren(name?: string | symbol): NodeAdapter[] {
        return super.getChildren(name).map(c => c as NodeAdapter);
    }

    abstract getId(): string;

    abstract getIssues(property?: string): Issue[] | undefined;

    abstract getPosition(property?: string): Position | undefined;

    getRole(): string | symbol | undefined {
        if (this.parent) { // Inefficient default implementation, searching in the parent's children
            const props = this.parent.nodeDefinition?.properties || {};
            for (const p in props) {
                const prop = props[p];
                if (prop.child) {
                    if (prop.multiple) {
                        if (this.parent.getChildren(prop.name)?.find(c => c.equals(this))) {
                            return prop.name;
                        }
                    } else if (this.equals(this.parent.getChild(prop.name) as NodeAdapter)) {
                        return prop.name;
                    }
                }
            }
        } else {
            return undefined;
        }
    }

    abstract isDeclaration(): boolean;

    abstract isExpression(): boolean;

    abstract isStatement(): boolean;

    equals(other: NodeAdapter | undefined) {
        return other == this;
    }
}

export class AugmentedNode extends NodeAdapter {
    constructor(protected node: Node) {
        super();
    }

    get parent() {
        if (this.node.parent) {
            return new AugmentedNode(this.node.parent);
        }
    }

    get nodeDefinition() {
        return this.node.nodeDefinition;
    }

    setChild(name: string, child: Node) {
        this.node.setChild(name, child);
    }

    addChild(name: string, child: Node) {
        this.node.addChild(name, child);
    }

    setAttribute(name: string | symbol, value: any) {
        this.node.setAttribute(name, value);
    }

    getAttribute(name: string | symbol): any {
        return this.node.getAttribute(name);
    }

    get(): NodeAdapter | undefined {
        return undefined;
    }

    getAttributes(): { [p: string]: any } {
        return {};
    }

    getId(): string {
        return "TODO";
    }

    getIssues(): Issue[] | undefined {
        return undefined;
    }

    getPosition(): Position | undefined {
        return this.node.position;
    }

    isDeclaration(): boolean {
        return false;
    }

    isExpression(): boolean {
        return false;
    }

    isStatement(): boolean {
        return false;
    }

    equals(other: NodeAdapter | undefined): boolean {
        return other instanceof AugmentedNode && this.node == other.node;
    }
}

export class TraceNode extends Node {

    parent?: TraceNode = undefined;

    constructor(public nodeAdapter: NodeAdapter) {
        super();
    }

    getType(): string {
        if (this.nodeDefinition.package) {
            return this.nodeDefinition.package + "." + this.nodeDefinition.name!;
        } else {
            return this.nodeDefinition.name!;
        }
    }

    getSimpleType(): string {
        return this.nodeDefinition.name!;
    }

    getRole(): string | symbol | undefined {
        return this.nodeAdapter.getRole();
    }

    getPosition(): Position | undefined {
        return this.nodeAdapter.getPosition();
    }

    get position(): Position | undefined {
        return this.getPosition();
    }

    get nodeDefinition(): NodeDefinition {
        return this.nodeAdapter.nodeDefinition;
    }

    getAttributes(): { [name: string]: any } {
        return this.nodeAdapter.getAttributes();
    }

    doGetAttribute(attrName: string): any {
        return this.nodeAdapter.getAttribute(attrName);
    }

    getPathFromRoot(): (string | number)[] {
        if (this.parent) {
            const role = this.getRole()!;
            const path = this.parent.getPathFromRoot();
            const ft = this.parent.containment(role)!;
            path.push(ft.name.toString());
            if (ft.multiple) {
                const children = this.parent.getChildren(ft.name);
                for (let index = 0; index < children.length; index++) {
                    const child = children[index];
                    if (child instanceof TraceNode && child.equals(this)) {
                        path.push(index);
                    }
                }
            }
            return path;
        } else {
            return [];
        }
    }

    protected make(node: NodeAdapter): TraceNode {
        return new TraceNode(node);
    }

    getChildren(role?: string | symbol): TraceNode[] {
        return this.nodeAdapter.getChildren(role).map((c) => this.make(c).withParent(this));
    }

    get children(): TraceNode[] {
        return this.getChildren();
    }

    equals(node: TraceNode) {
        return node === this || node.nodeAdapter.equals(this.nodeAdapter);
    }

    isDeclaration(): boolean {
        return this.nodeAdapter.isDeclaration();
    }

    isExpression(): boolean {
        return this.nodeAdapter.isExpression();
    }

    isStatement(): boolean {
        return this.nodeAdapter.isStatement();
    }
}
