import {expect} from "chai";

import {Point, START_POINT} from "../src";

describe('Position', function() {

/*@test fun isBefore() {
        val p0 = START_POINT
        val p1 = Point(1, 1)
        val p2 = Point(1, 100)
        val p3 = Point(2, 90)

        assertEquals(false, p0.isBefore(p0))
        assertEquals(true, p0.isBefore(p1))
        assertEquals(true, p0.isBefore(p2))
        assertEquals(true, p0.isBefore(p3))

        assertEquals(false, p1.isBefore(p0))
        assertEquals(false, p1.isBefore(p1))
        assertEquals(true, p1.isBefore(p2))
        assertEquals(true, p1.isBefore(p3))

        assertEquals(false, p2.isBefore(p0))
        assertEquals(false, p2.isBefore(p1))
        assertEquals(false, p2.isBefore(p2))
        assertEquals(true, p2.isBefore(p3))

        assertEquals(false, p3.isBefore(p0))
        assertEquals(false, p3.isBefore(p1))
        assertEquals(false, p3.isBefore(p2))
        assertEquals(false, p3.isBefore(p3))
    }*/
    it("Point comparisons",
        function () {
            const p0 = START_POINT;
            const p1 = new Point(1, 1);
            const p2 = new Point(1, 100);
            const p3 = new Point(2, 90);

            expect(p0.isBefore(p0)).to.be.false;
            expect(p0.isBefore(p1)).to.be.true;
            expect(p1.isBefore(p0)).to.be.false;
            expect(p0.isBefore(p2)).to.be.true;
            expect(p2.isBefore(p0)).to.be.false;
            expect(p0.isBefore(p3)).to.be.true;
            expect(p1.isBefore(p2)).to.be.true;
            expect(p2.isBefore(p1)).to.be.false;
            expect(p1.isBefore(p3)).to.be.true;
            expect(p3.isBefore(p1)).to.be.false;
        });
    it("Point.isBefore",
        function () {
            const p0 = START_POINT;
            const p1 = new Point(1, 1);
            const p2 = new Point(1, 100);
            const p3 = new Point(2, 90);

            expect(p0.compareTo(p0)).to.equal(0);
            expect(p0.compareTo(p1)).to.equal(-1);
            expect(p1.compareTo(p0)).to.equal(1);
            expect(p0.compareTo(p2)).to.equal(-1);
            expect(p2.compareTo(p0)).to.equal(1);
            expect(p0.compareTo(p3)).to.equal(-1);
            expect(p1.compareTo(p2)).to.equal(-1);
            expect(p2.compareTo(p1)).to.equal(1);
            expect(p1.compareTo(p3)).to.equal(-1);
            expect(p3.compareTo(p1)).to.equal(1);
        });
});
