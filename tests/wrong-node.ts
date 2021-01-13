import {Child, Node} from "../src";

class WrongNode extends Node {
    @Child()
    parent: Node
    @Child()
    children: Node[]
}