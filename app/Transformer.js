import {
  Keyword,
  Punctuator
} from './Lexer';
import ExpressionStatement from './statements/ExpressionStatement';
import Statement from './statements/Statement';
import { DeclarationStatement, Declarator } from './statements/DeclarationStatement';
import IdentifierExpression from './expressions/IdentifierExpression';
import ConditionalExpression from './expressions/ConditionalExpression';
import BinaryExpression from './expressions/BinaryExpression';

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

  visitIdentifier (node) {
    return node.name;
  }

  visitLiteral (node) {
    var value = node.value;
    var raw = node.raw;

    // convert binary number to decimal
    if (typeof value === 'number' && raw.indexOf('0b') == 0) {
      return value;
    }

    return raw;
  }

  visitDeclarationStatement (node) {
    var declarations = node.declarations.map((decl) => decl.accept(this)).join(', ')

    return `${node.kind} ${declarations};`;
  }

  visitDeclarator (node) {
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
    var params = node.params.map((param) => param.accept(this)).join(', ');
    var id = node.id.accept(this);
    var paramsDefValuesDecl = this._createParamsDefValuesDeclaration(node.params, node.defaults);

    if (paramsDefValuesDecl) {
      node.body.prepend(paramsDefValuesDecl);
    }

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
    var args = node.args.map((param) => param.accept(this)).join(', ');

    return `${id}(${args})`;
  }

  visitAssignmentExpression (node) {
    var ret = '';

    ret += node.left.accept(this) + ' ';
    ret += node.operator;
    ret += ' ' + node.right.accept(this);

    return ret;
  }

  visitArrayExpression (node) {
    return '[' + node.elements.map((el) => el.accept(this)).join(', ') + ']';
  }

  visitConditionalExpression (node) {
    var test = node.test.accept(this);
    var consequent = node.consequent.accept(this);
    var alternate = node.alternate.accept(this);

    return `${test} ? ${consequent} : ${alternate}`;
  }

  /**
   * Creates DeclrationStatement for function parameters default values.
   */
  _createParamsDefValuesDeclaration (params, defaults) {
    var declarators = [];

    // default values
    if (defaults && defaults.length) {
      defaults.forEach((decl, i) => {
        if (decl) {
          let idName = params[i].name;
          let identifier = new IdentifierExpression(idName);

          // e.g. var a = a !== undefined ? a : 'huhu'
          declarators.push(
            new Declarator(
              identifier,
              new ConditionalExpression(
                new BinaryExpression(
                  Punctuator.StrictNotEqual,
                  identifier,
                  new IdentifierExpression('undefined')
                ),
                identifier,
                decl
              )
            )
          );
        }
      });
    }

    if (declarators.length) {
      return new DeclarationStatement(declarators, Keyword.Var);
    }

    return null;
  }

  visitFunctionExpression (node) {
    var params = node.params.map((param) => param.accept(this)).join(', ');
    var id = node.id? ' ' + node.id.accept(this) : '';
    var paramsDefValuesDecl = this._createParamsDefValuesDeclaration(node.params, node.defaults);

    if (paramsDefValuesDecl) {
      node.body.prepend(paramsDefValuesDecl);
    }

    return `function${id} (${params}) ` + node.body.accept(this);
  }

  visitMemberExpression (node) {
    var str = node.object.accept(this);
    var prop = node.property.accept(this);

    if (node.computed) {
      str += `[${prop}]`;
    }
    else {
      str += `.${prop}`;
    }

    return str;
  }

  visitNewExpression (node) {
    var callee = node.callee.accept(this);
    var args = node.args.map((arg) => arg.accept(this)).join(', ');

    return `new ${callee}(${args})`;
  }

  visitGroupExpression (node) {
    return `(${node.expression.accept(this)})`;
  }

  visitObjectProperty (node) {
    var key = node.key.accept(this);
    var value = node.value.accept(this);

    return `${key}: ${value}`;
  }

  visitObjectExpression (node) {
    return '{\n' + node.properties.map((prop) => prop.accept(this)).join(',\n') + '\n}';
  }

  /*visitForInStatement (node) {

  }*/

  visitAny (node) {
    return `${node.type}_not_implemented`;
  }
}
