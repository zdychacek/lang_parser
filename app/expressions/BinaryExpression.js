import Expression from './Expression';

export default class BinaryExpression extends Expression {
  constructor (operator, left, right) {
    super('BinaryExpression');

    this.operator = operator;
    this.left = left;
    this.right = right;
  }

  accept (visitor) {
    return visitor.visitBinaryExpression(this);
  }
}
