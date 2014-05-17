import Expression from './Expression';

export default class UnaryExpression extends Expression {
  constructor (operator, argument, prefix = true) {
    super('UnaryExpression');

    this.operator = operator;
    this.argument = argument;
    this.prefix = prefix;
  }

  eval (context) {

  }
}
