
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

/**
 * A reference associated by using a name.
 */
export class ReferenceByName<N extends PossiblyNamed> {
    constructor(public readonly name: string, public referred: N | undefined = undefined) {}

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
