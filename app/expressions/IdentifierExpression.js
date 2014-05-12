import Expression from './Expression';

export default class IdentifierExpression extends Expression {
  constructor (name) {
    super('Identifier');

    this.name = name;
  }

  accept (visitor) {
    return visitor.visitIdentifierExpression(this);
  }
}
