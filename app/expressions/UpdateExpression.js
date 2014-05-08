import Expression from './Expression';

export default class UpdateExpression extends Expression {
  constructor (operator, argument, prefix = false) {
    super('UpdateExpression');

    this.operator = operator;
    this.argument = argument;
    this.prefix = prefix;
  }

  eval (context) {

  }
}
