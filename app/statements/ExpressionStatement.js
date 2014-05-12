import Statement from './Statement';

export default class ExpressionStatement extends Statement {
  constructor (expression) {
    super('ExpressionStatement');

    this.expression = expression;
  }

  accept (visitor) {
    return visitor.visitExpressionStatement(this);
  }
}
