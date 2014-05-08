import Expression from './Expression';

export default class LiteralExpression extends Expression {
  constructor (value) {
    super('Literal');

    this.value = value;
  }

  eval (context) {

  }
}
