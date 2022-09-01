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
}