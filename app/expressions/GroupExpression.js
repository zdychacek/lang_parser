import Expression from './Expression';

export default class GroupExpression extends Expression {
  constructor (expression) {
    super('GroupExpression');

    this.expression = expression;
  }
}
