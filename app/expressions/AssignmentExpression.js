import Expression from './Expression';

export default class AssignmentExpression extends Expression {
  constructor (operator, left, right) {
    super('AssignmentExpression');

    this.operator = operator;
    this.left = left;
    this.right = right;
  }
}
