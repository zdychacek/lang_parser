import Expression from './Expression';

export default class ArrayExpression extends Expression {
  constructor (elements) {
    super('ArrayExpression');

    this.elements = elements;
  }

  accept (visitor) {
    return visitor.visitArrayExpression(this);
  }
}
