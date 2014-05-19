import {
  Keyword,
  Punctuator
} from './Lexer';
import EmptyStatement from './statements/EmptyStatement';
import BlockStatement from './statements/BlockStatement';
import { DeclarationStatement, Declarator } from './statements/DeclarationStatement';
import IdentifierExpression from './expressions/IdentifierExpression';
import LiteralExpression from './expressions/LiteralExpression';
import ConditionalExpression from './expressions/ConditionalExpression';
import BinaryExpression from './expressions/BinaryExpression';
import MemberExpression from './expressions/MemberExpression';

/**
 * Transforms AST to JavaScript code.
 */
export default class Transformer {
  constructor () {
    // some state information
    this._state = {};

    // current indentation level for output
    this._indentationLevel = 0;
  }

  /**
   * Indents source line code;
   */
  _indent () {
    return '   '.repeat(this._indentationLevel);
  }

  transform (node) {
    // reset indentation level
    this._indentationLevel = 0;

    var start = new Date();
    var body = node.body.map((stmt) => stmt.accept(this));
    var time = (new Date() - start) / 1000;

    console.log(`compiling: ${time} s`);

    return body.join('\n');
  }

  visitExpressionStatement (node, indent = true) {
    return (indent? this._indent() : '') + node.expression.accept(this) + ';';
  }

  visitBinaryExpression (node) {
    return `${node.left.accept(this)} ${node.operator} ${node.right.accept(this)}`;
  }

  visitIdentifier (node) {
    return node.name;
  }

  visitLiteral (node) {
    var value = node.value;
    var raw = node.raw;

    // convert binary number to decimal
    if (typeof value === 'number'
      && typeof raw === 'string'
      && raw.indexOf('0b') == 0)
    {
      return value;
    }

    return raw;
  }

  visitDeclarationStatement (node, indent = true, withoutSemicolon = false) {
    var declarations = node.declarations.map((decl) => decl.accept(this)).join(', ')
    var str = (indent? this._indent() : '') + `${node.kind} ${declarations}`;

    if (!withoutSemicolon) {
      str += ';';
    }

    return str;
  }

  /**
   * Transforms Declarator.
   */
  visitDeclarator (node) {
    var str = node.id.accept(this);

    if (node.init) {
      str += ' = ' + node.init.accept(this, false);
    }

    return str;
  }

  /**
   * Transforms BlockStatement.
   */
  visitBlockStatement (node, indent = true) {
    if (node.body.length) {
      var str = `${this._indent()}{\n`;

      if (!indent) {
        str = '{\n';
      }

      this._indentationLevel++;
      str += node.body.map((stmt) => stmt.accept(this)).join('\n');
      this._indentationLevel--;

      str += `\n${this._indent()}}`;

      return str;
    }
    // empty block
    else {
      return (indent? this._indent() : '') + '{}';
    }
  }

  /**
   * Transforms FunctionDeclarationStatement.
   */
  visitFunctionDeclarationStatement (node) {
    var params = [];
    var id = node.id.accept(this);
    var paramsDefValuesDecl = this._createParamsDefValuesDeclaration(node.params, node.defaults);

    // if we have some default values, then we remove all parameters definition
    // and we create parameters declaration manually
    if (paramsDefValuesDecl) {
      // expand declarators to separate declarations
      node.body.prepend(paramsDefValuesDecl.expandToSeparateDeclarations());
    }
    // otherwise we parse parse function parameters
    else {
      params = node.params.map((param) => param.accept(this)).join(', ');
    }

    return `${this._indent()}function ${id} (${params}) ` + node.body.accept(this, false);
  }

  /**
   * Transforms FunctionExpression.
   */
  visitFunctionExpression (node, indent = true) {
    var params = [];
    var id = node.id? ' ' + node.id.accept(this) : '';
    var paramsDefValuesDecl = this._createParamsDefValuesDeclaration(node.params, node.defaults);

    // if we have some default values, then we remove all parameters definition
    // and we create parameters declaration manually
    if (paramsDefValuesDecl) {
      // expand declarators to separate declarations
      node.body.prepend(paramsDefValuesDecl.expandToSeparateDeclarations());
    }
    // otherwise we parse parse function parameters
    else {
      params = node.params.map((param) => param.accept(this)).join(', ');
    }

    return (indent? this._indent() : '') + `function${id} (${params}) ` + node.body.accept(this, false);
  }

  /**
   * Transforms EmptyStatement into ';'.
   */
  visitEmptyStatement (node) {
    return this._indent() + ';'
  }

  /**
   * Transforms ReturnStatement.
   */
  visitReturnStatement (node) {
    var argument = '';

    if (node.argument) {
      argument += ' ' + node.argument.accept(this);
    }

    return `${this._indent()}return${argument};`;
  }

  /**
   * Transforms CallExpression.
   */
  visitCallExpression (node) {
    var id = node.callee.accept(this);
    var args = node.args.map((param) => param.accept(this)).join(', ');

    return `${id}(${args})`;
  }

  visitAssignmentExpression (node) {
    return `${node.left.accept(this)} ${node.operator} ${node.right.accept(this)}`;
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
   * Creates DeclarationStatement for function parameters default values.
   */
  _createParamsDefValuesDeclaration (params, defaults) {
    var declarators = [];

    // default values
    if (defaults && defaults.length) {
      params.forEach((param, i) => {
        let declInit =
          new MemberExpression(
            new IdentifierExpression('arguments'),
            new LiteralExpression(i),
            true
          );

        if (defaults[i]) {
          declInit =
            new ConditionalExpression(
              new BinaryExpression(
                Punctuator.StrictNotEqual,
                declInit,
                new IdentifierExpression('undefined')
              ),
              declInit,
              defaults[i]
            );
        }

        // e.g.: var b = arguments[1] !== undefined ? arguments[1] : 'huhu';
        declarators.push(
          new Declarator(
            new IdentifierExpression(param.name),
            declInit
          )
        );
      });
    }

    if (declarators.length) {
      return new DeclarationStatement(Keyword.Var, declarators);
    }

    return null;
  }

  /**
   * Transforms MemberExpression.
   * e.g.:
   *   obj.prop
   *   obj[prop]
   */
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

  /**
   * Transforms NewExpression.
   * e.g.:
   *   new expr
   */
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
    var value = node.value.accept(this, false);

    return `${this._indent()}${key}: ${value}`;
  }

  visitObjectExpression (node) {
    if (node.properties.length) {
      let str = '{\n';

      this._indentationLevel++;
      str += node.properties.map((prop) => prop.accept(this)).join(',\n');
      this._indentationLevel--;

      str += `\n${this._indent()}}`;

      return str;
    }
    else {
      return '{}';
    }
  }

  visitLabeledStatement (node) {
    var label = node.label.accept(this);
    var str = `${this._indent()}${label}:`;

    if (node.body instanceof BlockStatement) {
      str += node.body.accept(this, false);
    }
    else {
      this._indentationLevel++;
      str += `\n${node.body.accept(this)}`;
      this._indentationLevel--;
    }

    return str;
  }

  visitBreakStatement (node) {
    if (node.label) {
      return `${this._indent()}break ${node.label.accept(this)};`;
    }
    else {
      return `${this._indent()}break;`;
    }
  }

  visitContinueStatement (node) {
    if (node.label) {
      return `${this._indent()}continue ${node.label.accept(this)};`;
    }
    else {
      return `${this._indent()}continue;`;
    }
  }

  visitWhileStatement (node) {
    var test = node.test.accept(this);
    var body = node.body.accept(this, false);

    return `${this._indent()}while (${test}) ${body}`;
  }

  visitDoWhileStatement (node) {
    var test = node.test.accept(this);
    var body = node.body.accept(this, false);

    return `${this._indent()}do ${body}\n${this._indent()}while (${test});`;
  }

  visitThrowStatement (node) {
    return `${this._indent()}throw ${node.argument.accept(this)};`;
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
    var consequent = node.consequent.accept(this, false);

    var str = `${this._indent()}if (${test}) ${consequent}`;

    if (node.alternate) {
      let alternate = node.alternate.accept(this, false);

      str += `\n${this._indent()}else ${alternate}`;
    }

    return str;
  }

  visitThisExpression (node) {
    return 'this';
  }

  visitForStatement (node) {
    var str = '';

    if (node.init) {
      str += `${node.init.accept(this, false, true)}`;
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

    return `${this._indent()}${str}${node.body.accept(this, false)}`;
  }

  visitForInStatement (node) {
    var left = node.left.accept(this, false, true);
    var right = node.right.accept(this);
    var str = `for (${left} in ${right})`;

    if (!(node.body instanceof EmptyStatement)) {
      str += ' ';
    }

    var body = node.body.accept(this, false);

    return `${this._indent()}${str}${body}`;
  }

  visitDebuggerStatement (node) {
    return `${this._indent()}debugger;`;
  }

  visitTryStatement (node) {
    var body = node.block.accept(this, false);
    var handlers = node.handlers.map((handler) => handler.accept(this));

    var str = `${this._indent()}try ${body}${handlers}`;

    if (node.finalizer) {
      let finalizer = node.finalizer.accept(this, false);

      str += `\n${this._indent()}finally ${finalizer}`;
    }

    return str;
  }

  visitCatchClause (node, indent = true) {
    return `\n${(indent? this._indent() : '')}catch (${node.param.accept(this)}) ${node.body.accept(this, false)}`;
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
    this._indentationLevel++;
    var cases = node.cases.map((ccase) => ccase.accept(this)).join('\n');
    this._indentationLevel--;

    return `${this._indent()}switch (${node.discriminant.accept(this)}) {\n${cases}\n${this._indent()}}`;
  }

  visitSwitchCase (node) {
    this._indentationLevel++;
    var consequent = node.consequent.map((stmt) => stmt.accept(this)).join('\n');
    this._indentationLevel--;

    // case
    if (node.test) {
      return `${this._indent()}case ${node.test.accept(this)}:\n${consequent}`;
    }
    else {
      return `${this._indent()}default:\n${consequent}`;
    }
  }

  visitAny (node) {
    return `${this._indent()}${node.type}_not_implemented`;
  }
}
