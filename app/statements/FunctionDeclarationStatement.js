import Statement from './Statement';

export default class FunctionDeclarationStatement extends Statement {
  constructor (id, params, body) {
    super('FunctionDeclaration');

    this.id = id;
    this.params = params;
    this.body = body;
  }

  accept (visitor) {
    return visitor.visitFunctionDeclarationStatement(this);
  }
}
