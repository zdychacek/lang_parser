import Statement from './Statement';

export default class BlockStatement extends Statement {
  constructor (body = []) {
    super('BlockStatement');

    this.body = body;
  }

  prepend (stmtOrExpression) {
    this.body.unshift(stmtOrExpression);
  }

  append (stmtOrExpression) {
    this.body.push(stmtOrExpression);
  }
}
