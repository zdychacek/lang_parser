import Expression from './Expression';

export default class SequenceExpression extends Expression {
  constructor (expressions = []) {
    super('SequenceExpression');

    this.expressions = expressions;
  }

  addExpression (expr) {
    this.expressions.push(expr);
  }

  eval (context) {

  }
}
