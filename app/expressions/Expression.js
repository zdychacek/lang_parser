import Node from '../Node';

export default class Expression extends Node {
  constructor (type) {
    super(type);
  }

  checkIfDefined (scope) {
    return true;
  }
}
