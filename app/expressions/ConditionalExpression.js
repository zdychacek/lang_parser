import Expression from './Expression';

export default class ConditionalExpression extends Expression {
  constructor (test, consequent, alternate) {
    super('ConditionalExpression');

    this.test = test;
    this.consequent = consequent;
    this.alternate = alternate;
  }

  accept (visitor) {
    return visitor.visitConditionalExpression(this);
  }
}
