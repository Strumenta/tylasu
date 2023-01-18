import {Node} from "../model/model";
import {fail} from "assert";
import {strict as assert} from "assert";
import {expect} from "chai";

export function assertASTsAreEqual(
    expected: Node,
    actual: Node,
    context = "<root>",
    considerPosition = false
) {
    if (areSameType(expected, actual)) {
        if (considerPosition) {
            assert(expected.position!.equals(actual.position!), `${context}.position`);
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
                assert(actualPropValue.length == expectedPropValue.length,
                    `${context}, property ${expectedProperty.name} has length ${expectedPropValue.length}, but found ${actualPropValue.length}`);
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
                        assert(expectedElement == actualElement,
                            `${context}, property ${expectedProperty.name}[${i}] is ${expectedPropValue[i]}, but found ${actualPropValue[i]}`);
                    }
                }
            }
            else {
                assert(
                    expectedPropValue == actualPropValue,
                    `${context}, comparing property ${expectedProperty.name}`);
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