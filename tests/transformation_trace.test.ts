import {expect} from "chai";
import * as fs from "fs";

describe('Transformation traces', function() {
    it("Can load transformation trace produced by Kolasu",
        function () {
            const text = fs.readFileSync('tests/data/rpgtojava-transpilation-example.json', 'utf8')
            const data = JSON.parse(text)
            console.log(data)
        });
});
