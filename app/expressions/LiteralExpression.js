import Expression from './Expression';

export default class LiteralExpression extends Expression {
  constructor (value, raw = value) {
    super('Literal');

    this.value = value;
    this.raw = raw;
  }
}
