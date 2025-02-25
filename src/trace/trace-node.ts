import {Concept, Node} from "../model/model";
import {Position} from "../model/position";
import {Issue} from "../validation";
import {PossiblyNamed, ReferenceByName} from "../model/naming";

export abstract class NodeAdapter extends Node {
    abstract parent?: NodeAdapter;
    abstract get concept(): Concept;

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
            const props = this.parent.nodeDefinition?.features || {};
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

    /**
     * @deprecated replaced by `isOfKnownType("EntityDeclaration")`
     */
    abstract isDeclaration(): boolean;

    abstract isExpression(): boolean;

    abstract isStatement(): boolean;

    equals(other: NodeAdapter | undefined) {
        return other == this;
    }

    abstract isOfKnownType(name: string);
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

    get concept() {
        return this.node.concept;
    }

    setChild(name: string, child: Node) {
        this.node.setChild(name, child);
    }

    addChild(name: string, child: Node) {
        this.node.addChild(name, child);
    }

    setAttributeValue(name: string | symbol, value: any) {
        this.node.setAttributeValue(name, value);
    }

    getAttributeValue(name: string | symbol): any {
        return this.node.getAttributeValue(name);
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

    isOfKnownType() {
        return false;
    }
}

export class TraceNode extends Node implements PossiblyNamed {

    parent?: TraceNode = undefined;

    constructor(public nodeAdapter: NodeAdapter) {
        super();
    }

    get name(): string | undefined {
        return this.getAttributeValue("name");
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

    get nodeDefinition(): Concept {
        return this.nodeAdapter.concept;
    }

    getAttributes(): { [name: string]: any } {
        return this.nodeAdapter.getAttributes();
    }

    doGetAttributeValue(attrName: string): any {
        return this.nodeAdapter.getAttributeValue(attrName);
    }

    protected doGetChildOrChildren(name: string | symbol): Node | Node[] | undefined {
        const containment = this.containment(name);
        if(!containment) {
            throw new Error("Not a containment: " + name.toString());
        }
        if (containment.multiple) {
            return this.nodeAdapter.getChildren(name)?.map(c => this.makeChild(c, name)!);
        } else {
            return this.makeChild(this.nodeAdapter.getChild(name), name);
        }
    }

    getReference(name: string | symbol): ReferenceByName<TraceNode> | undefined {
        const innerRef = this.nodeAdapter.getReference(name);
        if (innerRef) {
            const reference = new ReferenceByName<TraceNode>(innerRef.name);
            const refTarget = innerRef?.referred;
            if (refTarget instanceof NodeAdapter) {
                const referred = this.make(innerRef.referred);
                reference.referred = referred.withParent(this.computeParentForReference(refTarget));
            }
            return reference;
        } else {
            return undefined;
        }
    }

    private computeParentForReference(refTarget: NodeAdapter) {
        let node: TraceNode | undefined = undefined;
        let tempParent: TraceNode | undefined = undefined;
        while (refTarget.parent) {
            const parent = this.make(refTarget.parent);
            if (node) {
                node.parent = parent;
            } else {
                tempParent = parent;
            }
            node = parent;
            refTarget = refTarget.parent;
        }
        if (tempParent) {
            const newParent = this.getRoot().getDescendant(tempParent.getPathFromRoot());
            if (newParent instanceof Node) {
                return newParent;
            }
        }
    }

    private makeChild(child: Node | undefined | NodeAdapter, name: string | symbol) {
        if (child instanceof NodeAdapter) {
            return this.make(child).withParent(this);
        } else if (child) {
            const error = new Error(`Invalid child with role ${name?.toString()}`) as any;
            error.child = child;
            throw error;
        }
    }

    getRoot(): TraceNode {
        if (this.parent) {
            return this.parent.getRoot();
        } else {
            return this;
        }
    }

    getPathFromRoot(): (string | number)[] {
        if (this.parent) {
            const role = this.getRole()!;
            const path = this.parent.getPathFromRoot();
            const ft = this.parent.containment(role)!;
            path.push(ft.name.toString());
            if (ft.multiple) {
                const children = this.parent.getChildren(ft.name);
                let found = false;
                for (let index = 0; index < children.length; index++) {
                    const child = children[index];
                    if (child.equals(this)) {
                        path.push(index);
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    throw new Error(`Child node ${this} not found in ${ft.name.toString()}`);
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

    isOfKnownType(name: string): boolean {
        return this.nodeAdapter.isOfKnownType(name);
    }

    /**
     * @deprecated replaced by `isOfKnownType("EntityDeclaration")`
     */
    isDeclaration(): boolean {
        return this.nodeAdapter.isDeclaration();
    }

    isExpression(): boolean {
        return this.nodeAdapter.isExpression();
    }

    isStatement(): boolean {
        return this.nodeAdapter.isStatement();
    }

    getDescendant(path: (string | number)[]) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let node: Node | undefined = this;
        for (let i = 0; i < path.length; i++) {
            const elem = path[i];
            if (typeof elem !== "string") {
                throw new Error("Invalid path at " + elem + ", expected node, got " + node);
            }
            if (i < path.length - 1 && typeof path[i + 1] === "number") {
                node = node?.getChild(elem, path[i + 1] as number);
                i++;
            } else {
                node = node?.getChild(elem);
            }
        }
        return node;
    }
}
