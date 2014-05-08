import Expression from './Expression';

export default class PostfixExpression extends Expression {
  constructor (operator, left) {
    super('PostfixExpression');

    this.operator = operator;
    this.left = left;
  }

  eval (context) {

  }
}
