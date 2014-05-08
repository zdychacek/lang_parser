import Expression from './Expression';

export default class LiteralExpression extends Expression {
  constructor (value, raw) {
    super('Literal');

    this.value = value;
    this.raw = raw;
  }

  eval (context) {

  }
}
