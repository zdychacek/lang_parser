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

  replace (stmtToReplace, replacement) {
    var index = this.body.indexOf(stmtToReplace);

    if (index > -1) {
      this.body.splice(index, 1, ...replacement);
    }
    else {
      throw new Error('Cannot replace. Node to replace doesn\'t exist.');
    }
  }

  remove (stmt) {
    var index = this.body.indexOf(stmt);

    if (index > -1) {
      this.body.splice(index, 1);
    }
  }

  *[Symbol.iterator]() {
    for (var stmt of this.body) {
      yield stmt;
    }
  }
}
