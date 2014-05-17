import Statement from './Statement';

export default class FunctionDeclarationStatement extends Statement {
  constructor (id, params = [], body, defaults = []) {
    super('FunctionDeclarationStatement');

    this.id = id;
    this.params = params;
    this.defaults = defaults;
    this.body = body;
  }
}
