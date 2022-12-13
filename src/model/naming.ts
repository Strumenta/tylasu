import {
    Node
} from "./model";

/**
 * An entity that can have a name
 */
export interface PossiblyNamed {
    name?: string;
}

/**
 * An entity which has a name.
 */
export interface Named extends PossiblyNamed {
    name: string;
}

function objectPrototypeName(object) {
    return Object.getPrototypeOf(object).constructor.name;
}

/**
 * A reference associated by using a name.
 */
export class ReferenceByName<N extends PossiblyNamed> {
    private _referred? : N;

    constructor(public readonly name: string, referred?: N) {
        this.referred = referred;
    }

    get referred() : N | undefined {
        return this._referred;
    }

    set referred(referred : N | undefined) {
        if (referred != undefined && !(referred instanceof Node))
            throw new Error(`We cannot enforce it statically but only Node should be referred to. Instead ${referred} was assigned (class: ${objectPrototypeName(referred)})`);
        this._referred = referred;
    }

    toString(): string {
        if (this.referred == null) {
            return `Ref(${this.name})[Unresolved]`;
        } else {
            return `Ref(${this.name})[Resolved]`;
        }
    }

    get resolved(): boolean {
        return !!this.referred;
    }

    tryToResolve(candidates: N[], caseInsensitive = false): boolean {
        const filter = caseInsensitive ?
                it => it.name.toLowerCase() == this.name.toLowerCase() :
                it => it.name == this.name;
        const res = candidates.find(filter);
        this.referred = res;
        return !!res;
    }
}
