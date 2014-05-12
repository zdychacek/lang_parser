import Node from './Node';

export default class Program extends Node {
  constructor (body) {
    super('Program');

    this.body = body;
  }

  accept (visitor) {
    visitor.visitProgram(this);
  }
}
