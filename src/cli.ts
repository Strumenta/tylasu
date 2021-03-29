#!/usr/bin/env node

import { command, run, positional } from 'cmd-ts';
import { File } from 'cmd-ts/dist/cjs/batteries/fs';
import * as Ecore from "ecore/dist/ecore";
import * as fs from "fs";
import {generateASTClasses, SYMBOL_CLASS_DEFINITION} from "./interop/ecore";

const cmd = command({
    name: 'generate-classes',
    description: 'Generates TypeScript AST classes from an Ecore metamodel',
    version: '0.1.0',
    args: {
        metamodel: positional({ type: File, displayName: 'metamodel', description: "the path to the metamodel file in emfjson format" }),
    },
    handler: args => {
        const resourceSet = Ecore.ResourceSet.create();
        const resource = resourceSet.create({ uri: 'file:' + args.metamodel });
        const buffer = fs.readFileSync(args.metamodel);
        resource.load(buffer.toString(), (r, e) => {
            if(e) {
                console.error(e);
            } else {
                const ePackage = r.get("contents").at(0);
                if(!ePackage.get("nsURI")) {
                    ePackage.set("nsURI", "");
                }
                Ecore.EPackage.Registry.register(ePackage);
                const pkg = generateASTClasses(ePackage);
                console.log("import {ASTNode, Child, Children, Node, Property} from '@strumenta/ast';");
                console.log("");
                for (const k in pkg.nodes) {
                    console.log(pkg.nodes[k][SYMBOL_CLASS_DEFINITION]);
                    console.log("");
                }
            }
        });
    },
});

run(cmd, process.argv.slice(2));