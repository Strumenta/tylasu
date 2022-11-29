import {Node} from "./model";

function sign(number: number): number {
    return number > 0 ? +1 : number < 0 ? -1 : 0;
}

export class Point {
    constructor(public readonly line: number, public readonly column: number) {
        if(line < 1) {
            throw new Error(`Line should be equal to or greater than 1, was ${line}`);
        }
        if(line < 0) {
            throw new Error(`Column should be equal to or greater than 0, was ${column}`);
        }
    }

    compareTo(other: Point): number {
        if (this.line == other.line) {
            return sign(this.column - other.column);
        } else {
            return sign(this.line - other.line);
        }
    }

    equals(other: Point): boolean {
        return this.compareTo(other) == 0;
    }

    isAfter(other: Point): boolean {
        return !other || this.compareTo(other) > 0;
    }

    isSameOrAfter(other: Point): boolean {
        return !other || this.compareTo(other) >= 0;
    }

    isBefore(other: Point): boolean {
        return other && this.compareTo(other) < 0;
    }

    isSameOrBefore(other: Point): boolean {
        return other && this.compareTo(other) <= 0;
    }

    asPosition(): Position {
        return new Position(this, this);
    }
}

export const START_POINT = new Point(1, 0);

export class Position {
    constructor(public readonly start: Point, public readonly end: Point) {}

    static ofPoint(point: Point): Position {
        return new Position(point, point);
    }

    compareTo(other: Position): number {
        if(!other) {
            return 1;
        }
        const cmp = this.start.compareTo(other.start);
        if (cmp == 0 && this.end) {
            return this.end.compareTo(other.end);
        } else {
            return cmp;
        }
    }

    /**
     * If this Position has both a start and an end, and they are the same,
     * then it is considered empty.
     */
    isEmpty(): boolean {
        return this.end !== undefined && this.start.equals(this.end)
    }

    /**
     * Tests whether the given object is contained in the interval represented by this object.
     * @param object the object to test: could be a Point, a Position, or a Node.
     */
    contains(object: Point | Position | Node | null | undefined): boolean {
        if (object instanceof Point) {
            return this.start.isSameOrBefore(object) && this.end.isSameOrAfter(object);
        } else if (object instanceof Position) {
            return (this.start.isSameOrBefore(object.start) && this.end.isSameOrAfter(object.end))
        } else if (object instanceof Node) {
            return this.contains(object.position);
        } else {
            return false;
        }
    }

    /**
     * Tests whether the given position overlaps the interval represented by this object.
     * @param position the position
     */
    overlaps(position?: Position): boolean {
        return (position != null) && (
            (this.start.isSameOrAfter(position.start) && this.start.isSameOrBefore(position.end)) ||
            (this.end.isSameOrAfter(position.start) && this.end.isSameOrBefore(position.end)) ||
            (position.start.isSameOrAfter(this.start) && position.start.isSameOrBefore(this.end)) ||
            (position.end.isSameOrAfter(this.start) && position.end.isSameOrBefore(this.end))
        )
    }
}

export function pos(startLine: number, startCol: number, endLine: number, endCol: number): Position {
    return new Position(new Point(startLine, startCol), new Point(endLine, endCol));
}