import Statement from './Statement';

export default class BlockStatement extends Statement {
  constructor (body = []) {
    super('BlockStatement');

    this.body = body;
  }

  prepend (stmtOrExpression) {
    if (!Array.isArray(stmtOrExpression)) {
      stmtOrExpression = [ stmtOrExpression ];
    }

    this.body = stmtOrExpression.concat(this.body);
  }

  append (stmtOrExpression) {
    if (!Array.isArray(stmtOrExpression)) {
      stmtOrExpression = [ stmtOrExpression ];
    }

    this.body = this.body.concat(stmtOrExpression);
  }
}
