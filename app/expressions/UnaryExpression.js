import Expression from './Expression';

export default class UnaryExpression extends Expression {
  constructor (operator, argument) {
    super('UnaryExpression');

    this.operator = operator;
    this.argument = argument;
  }

  eval (context) {

  }
}
