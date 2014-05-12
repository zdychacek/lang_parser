import ExpressionStatement from './statements/ExpressionStatement';
import Statement from './statements/Statement';

export default class Transformer {
  constructor () {
    this._state = {};
    this._indentationLevel = 0;
  }

  _processStatement (stmt) {
    var strStmt = stmt.accept(this);

    // ExpressionStatement
    if (stmt instanceof ExpressionStatement) {
      return `${this._indent()}${strStmt};`;
    }
    // Statement
    else if (stmt instanceof Statement) {
      return `${this._indent()}${strStmt}`;
    }
    else {
      throw new Error('You shall not pass.');
    }
  }

  _indent () {
    return '  '.repeat(this._indentationLevel);
  }

  visitProgram (node) {
    var start = new Date();
    var body = node.body.map(this._processStatement.bind(this));
    var time = (new Date() - start) / 1000;

    console.log(`compiling: ${time} s`);

    return body.join('\n');
  }

  visitExpressionStatement (node) {
    return node.expression.accept(this);
  }

  visitBinaryExpression (node) {
    var ret = '';

    ret += node.left.accept(this) + ' ';
    ret += node.operator;
    ret += ' ' + node.right.accept(this);

    return ret;
  }

  visitIdentifierExpression (node) {
    return node.name;
  }

  visitLiteralExpression (node) {
    return node.raw;
  }

  visitDeclarationStatement (node) {
    var str = `${node.kind} `;
    var lastIndex = node.declarations.length - 1;

    node.declarations.forEach((decl, i) => {
      str += decl.accept(this);

      if (i != lastIndex) {
        str += ', ';
      }
    }, this);

    str += ';'

    return str;
  }

  visitVariableDeclarator (node) {
    var str = node.id.accept(this);

    if (node.init) {
      str += ' = ' + node.init.accept(this);
    }

    return str;
  }

  visitBlockStatement (node) {
    var str = `${this._indent()}{\n`;

    //this._indentationLevel++;

    str += node.body
      .map((stmt) => '  ' + this._processStatement(stmt), this)
      .join('\n');

    //this._indentationLevel--;

    str += `${this._indent()}\n}`;

    return str;
  }

  visitFunctionDeclarationStatement (node) {
    var params = node.params
      .map((param) => param.accept(this))
      .join(', ');

    var id = node.id.accept(this);

    return `function ${id} (${params}) ` + node.body.accept(this);
  }

  visitEmptyStatement (node) {
    return ';'
  }

  visitReturnStatement (node) {
    var argument = '';

    if (node.argument) {
      argument += ' ' + node.argument.accept(this);
    }

    return `return${argument};`;
  }

  visitCallExpression (node) {
    var id = node.callee.accept(this);
    var args = node.args
      .map((param) => param.accept(this))
      .join(', ');

    return `${id}(${args})`;
  }

  visitAssignmentExpression (node) {
    var ret = '';

    ret += node.left.accept(this) + ' ';
    ret += node.operator;
    ret += ' ' + node.right.accept(this);

    return ret;
  }

  visitAny (node) {
    return `${node.type}_not_implemented`;
  }
}