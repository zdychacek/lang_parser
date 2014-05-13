import Expression from './Expression';

export default class CallExpression extends Expression {
  constructor (callee, args) {
    super('CallExpression');

    this.callee = callee;
    this.args = args;
  }
}
