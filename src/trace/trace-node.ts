import {Node, NodeDefinition} from "../model/model";
import {Position} from "../model/position";
import {Issue} from "../validation";

export abstract class ExternalNode {
    abstract definition: NodeDefinition;
    abstract parent?: ExternalNode;

    abstract get(...path: string[]): ExternalNode | undefined;

    abstract getAttribute(name: string): any;

    abstract getAttributes(): { [name: string]: any };

    abstract getChildren(role?: string): ExternalNode[];

    abstract getId(): string;

    abstract getIssues(property?: string): Issue[] | undefined;

    abstract getPosition(property?: string): Position | undefined;

    abstract getRole(): string | undefined;

    abstract isDeclaration(): boolean;

    abstract isExpression(): boolean;

    abstract isStatement(): boolean;

    equals(other: ExternalNode) {
        return other == this;
    }
}

export abstract class TraceNode extends Node {

    abstract parent?: TraceNode;

    protected constructor(public wrappedNode: ExternalNode) {
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

    getRole(): string | undefined {
        return this.wrappedNode.getRole();
    }

    getPosition(): Position | undefined {
        return this.wrappedNode.getPosition();
    }

    get position(): Position | undefined {
        return this.getPosition();
    }

    get nodeDefinition(): NodeDefinition {
        return this.wrappedNode.definition;
    }

    getAttributes(): { [name: string]: any } {
        return this.wrappedNode.getAttributes();
    }

    doGetAttribute(attrName: string): any {
        return this.wrappedNode.getAttribute(attrName);
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

    equals(node: TraceNode) {
        return node === this || node.wrappedNode.equals(this.wrappedNode);
    }

    isDeclaration(): boolean {
        return this.wrappedNode.isDeclaration();
    }

    isExpression(): boolean {
        return this.wrappedNode.isExpression();
    }

    isStatement(): boolean {
        return this.wrappedNode.isStatement();
    }
}
