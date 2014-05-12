import Statement from './Statement';

export default class BlockStatement extends Statement {
  constructor (body) {
    super('BlockStatement');

    this.body = body;
  }

  accept (visitor) {
    return visitor.visitBlockStatement(this);
  }
}
