import Expression from './Expression';

export default class PrefixExpression extends Expression {
  constructor (operator, right) {
    super('PrefixExpression');

    this.operator = operator;
    this.right = right;
  }

  eval (context) {

  }
}
