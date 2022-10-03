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

    isAfterOrSame(other: Point): boolean {
        return !other || this.compareTo(other) >= 0;
    }

    isBefore(other: Point): boolean {
        return other && this.compareTo(other) < 0;
    }

    isBeforeOrSame(other: Point): boolean {
        return other && this.compareTo(other) <= 0;
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
        if (cmp == 0) {
            return this.end.compareTo(other.end);
        } else {
            return cmp;
        }
    }


    isEmpty(): boolean {
        return this.start.equals(this.end)
    }

    /**
     * Tests whether the given object is contained in the interval represented by this object.
     * @param object the object to test: could be a Point, a Position, or a Node.
     */
    contains(object: Point | Position | Node | null | undefined): boolean {
        if (object instanceof Point) {
            return this.start.isBeforeOrSame(object) && this.end.isAfterOrSame(object);
        } else if (object instanceof Position) {
            return (this.start.isBeforeOrSame(object.start) && this.end.isAfterOrSame(object.end))
        } else if (object instanceof Node) {
            return this.contains(object.position);
        } else {
            return false;
        }
    }
}

export function pos(startLine: number, startCol: number, endLine: number, endCol: number): Position {
    return new Position(new Point(startLine, startCol), new Point(endLine, endCol));
}