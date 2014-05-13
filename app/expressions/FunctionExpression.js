import Expression from './Expression';

export default class FunctionExpression extends Expression {
  constructor (id, params, body) {
    super('FunctionExpression');

    this.id = id;
    this.params = params;
    this.body = body;
  }
}
