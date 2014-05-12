import Expression from './Expression';

export default class LiteralExpression extends Expression {
  constructor (value, raw) {
    super('Literal');

    this.value = value;
    this.raw = raw;
  }

  accept (visitor) {
    return visitor.visitLiteralExpression(this);
  }
}
