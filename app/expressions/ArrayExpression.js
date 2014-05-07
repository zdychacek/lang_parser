import Expression from './Expression';

export default class ArrayExpression extends Expression {
  constructor (elements) {
    super('ArrayExpression');

    this.elements = elements;
  }

  eval (context) {

  }
}
