import Statement from './Statement';

export default class FunctionDeclarationStatement extends Statement {
  constructor (id, params, body) {
    super('FunctionDeclarationStatement');

    this.id = id;
    this.params = params;
    this.body = body;
  }
}
