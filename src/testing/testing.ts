import {Node} from "../model/model";
import {fail} from "assert";
import {expect} from "chai";

export function assertASTsAreEqual(
    expected: Node,
    actual: Node,
    context = "<root>",
    considerPosition = false
) {
    if (areSameType(expected, actual)) {
        if (considerPosition) {
            expect(actual.position!.equals(expected.position!)).to.be.true;
        }
        expected.properties.forEach(expectedProperty => {
            const actualPropValue = actual.properties.find(p => p.name == expectedProperty.name)!.value;
            const expectedPropValue = expectedProperty.value;

            if (actualPropValue instanceof Node && expectedPropValue instanceof Node) {
                assertASTsAreEqual(
                    actualPropValue as Node,
                    expectedPropValue as Node,
                    `${context}.${expectedProperty.name}`,
                    considerPosition
                );
            }
            else if (Array.isArray(actualPropValue) && Array.isArray(expectedPropValue)) {
                expect(
                    actualPropValue.length,
                    `${context}, property ${expectedProperty.name} has length ${expectedPropValue.length}, but found ${actualPropValue.length}`
                ).to.equal(expectedPropValue.length)
                for (let i = 0; i < expectedPropValue.length; i++) {
                    const expectedElement = expectedPropValue[i];
                    const actualElement = actualPropValue[i];

                    if (expectedElement instanceof Node && actualElement instanceof Node) {
                        assertASTsAreEqual(
                            expectedElement as Node,
                            actualElement as Node,
                            `${context}.${expectedProperty.name}[${i}]`,
                            considerPosition
                        );
                    }
                    else if (typeof expectedElement != "object" && typeof actualElement != "object") {
                        expect(
                            actualElement,
                            `${context}, property ${expectedProperty.name}[${i}] is ${expectedPropValue[i]}, but found ${actualPropValue[i]}`
                        ).to.equal(expectedElement);
                    }
                }
            }
            else {
                expect(
                    actualPropValue,
                    `${context}, comparing property ${expectedProperty.name}`
                ).to.equal(expectedPropValue);
            }
        });
    }
    else {
        fail(`${context}: nodes are not of the same type`);
    }
}

function areSameType(a, b) : boolean {
    return typeof a == 'object' &&
        typeof a == typeof b &&
        Object.getPrototypeOf(a) === Object.getPrototypeOf(b);
}