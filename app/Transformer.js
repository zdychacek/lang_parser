import {
  Keyword,
  Punctuator
} from './Lexer';
import EmptyStatement from './statements/EmptyStatement';
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

    return `${this._indent()}${strStmt}`;
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
    return node.expression.accept(this) + ';';
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

  visitDeclarationStatement (node, withoutSemicolon = false) {
    var declarations = node.declarations.map((decl) => decl.accept(this)).join(', ')
    var str = `${node.kind} ${declarations}`;

    if (!withoutSemicolon) {
      str += ';';
    }

    return str;
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

  visitLabeledStatement (node) {
    var label = node.label.accept(this);
    var body = node.body.accept(this);

    return `${label}:\n${body}`;
  }

  visitBreakStatement (node) {
    if (node.label) {
      return `break ${node.label.accept(this)};`;
    }
    else {
      return 'break;'
    }
  }

  visitContinueStatement (node) {
    if (node.label) {
      return `continue ${node.label.accept(this)};`;
    }
    else {
      return 'continue;'
    }
  }

  visitWhileStatement (node) {
    var test = node.test.accept(this);
    var body = node.body.accept(this);

    return `while (${test}) ${body}`;
  }

  visitDoWhileStatement (node) {
    var test = node.test.accept(this);
    var body = node.body.accept(this);

    return `do ${body} while (${test});`;
  }

  visitThrowStatement (node) {
    return `throw ${node.argument.accept(this)};`;
  }

  visitUpdateExpression (node) {
    var argument = node.argument.accept(this);

    if (node.prefix) {
      return `${node.operator}${argument}`;
    }
    else {
      return `${argument}${node.operator}`;
    }
  }

  visitIfStatement (node) {
    var test = node.test.accept(this);
    var consequent = node.consequent.accept(this);

    var str = `if (${test}) ${consequent}`;

    if (node.alternate) {
      let alternate = node.alternate.accept(this);

      str += `\nelse ${alternate}`;
    }

    return str;
  }

  visitThisExpression (node) {
    return 'this';
  }

  visitForStatement (node) {
    var str = '';

    if (node.init) {
      str += `${node.init.accept(this, true)}`;
    }

    str += ';';

    if (node.test) {
      str += ` ${node.test.accept(this)}`;
    }

    str += ';';

    if (node.update) {
      str += ` ${node.update.accept(this)}`;
    }

    str = `for (${str})`;

    if (!(node.body instanceof EmptyStatement)) {
      str += ' ';
    }

    return `${str}${node.body.accept(this)}`;
  }

  visitForInStatement (node) {
    var left = node.left.accept(this, true);
    var right = node.right.accept(this);
    var str = `for (${left} in ${right})`;

    if (!(node.body instanceof EmptyStatement)) {
      str += ' ';
    }

    var body = node.body.accept(this);

    return `${str}${body}`;
  }

  visitDebuggerStatement (node) {
    return 'debugger;';
  }

  visitTryStatement (node) {
    var body = node.block.accept(this);
    var handlers = node.handlers.map((handler) => handler.accept(this));
    var finalizer = node.finalizer.accept(this);

    return `try ${body}${handlers}\nfinally${finalizer}`;
  }

  visitCatchClause (node) {
    return `\ncatch (${node.param.accept(this)})${node.body.accept(this)}`;
  }

  visitUnaryExpression (node) {
    var argument = node.argument.accept(this);

    if (node.prefix) {
      switch (node.operator) {
        // with space before argument
        case Keyword.Delete:
          return `${node.operator} ${argument}`;
        // without space before argument
        default:
          return `${node.operator}${argument}`;
      }
    }
    else {
      return `${argument}${node.operator}`;
    }
  }

  visitSequenceExpression (node) {
    return node.expressions.map((expr) => expr.accept(this)).join(', ');
  }

  visitSwitchStatement (node) {
    var cases = node.cases.map((ccase) => ccase.accept(this)).join('\n');

    return `switch (${node.discriminant.accept(this)}) {\n${cases}\n}`;
  }

  visitSwitchCase (node) {
    var consequent = node.consequent.map((stmt) => stmt.accept(this)).join('\n');

    // case
    if (node.test) {
      return `case ${node.test.accept(this)}:\n${consequent}`;
    }
    else {
      return `default:\n${consequent}`;
    }
  }

  visitAny (node) {
    return `${node.type}_not_implemented`;
  }
}
