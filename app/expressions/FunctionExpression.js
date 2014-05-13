import Expression from './Expression';

export default class FunctionExpression extends Expression {
  constructor (id, params, body, defaults = []) {
    super('FunctionExpression');

    this.id = id;
    this.params = params;
    this.defaults = defaults;
    this.body = body;
  }
}
