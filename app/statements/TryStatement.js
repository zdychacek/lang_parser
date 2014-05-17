import Statement from './Statement';

class CatchClause extends Statement {
  constructor (param, body) {
    super('CatchClause');

    this.param = param;
    this.body = body;
  }
}

export default class TryStatement extends Statement {
  constructor (block, handlers = [], finalizer = null) {
    super('TryStatement');

    this.block = block;
    this.handlers = handlers;
    this.finalizer = finalizer;
  }

  addHandler (param, body) {
    this.handlers.push(new CatchClause(param, body));
  }
}
