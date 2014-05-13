import Expression from './Expression';

export default class NewExpression extends Expression {
  constructor (callee, args) {
    super('NewExpression');

    this.callee = callee;
    this.args = args;
  }
}
