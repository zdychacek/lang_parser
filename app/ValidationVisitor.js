import {
  Keyword,
  Punctuator
} from './Lexer';
import {
  Scope,
  ScopeType
} from './Scope';
import AbstractVisitor from './AbstractVisitor';
import { DeclarationStatement, Declarator } from './statements/DeclarationStatement';

/**
 * Validates AST.
 */
export default class ValidationVisitor extends AbstractVisitor {
  constructor (globals) {
    this._globals = globals;

    // scope chain for identifier lookup
    this._scopeChain = [];  // of scopes

    this.reset();
  }

  reset () {
    this._scopeChain = [];
    this._warnings = [];
    this._errors = [];
  }

  _pushScope (type) {
    var newScope = new Scope({
      parent: this._scopeChain.length? this.scope : null,
      type
    }, this);

    this._scopeChain.push(newScope);

    return newScope;
  }

  _pushFunctionScope () {
    this._pushScope(ScopeType.Function);
  }

  _pushBlockScope () {
    this._pushScope(ScopeType.Block);
  }

  _popScope () {
    return this._scopeChain.pop();
  }

  get scope () {
    var len = this._scopeChain.length;

    return this._scopeChain[len - 1];
  }

  get globalScope () {
    return this._scopeChain[0];
  }

  visitProgram (node) {
    this.reset();

    // create global scope
    this._pushFunctionScope();

    for (var stmt of node.body) {
      stmt.accept(this);
    }

    this._popScope();
  }

  visitBlockStatement (node, pushNewScope = true) {
    if (pushNewScope) {
      this._pushBlockScope();
    }

    for (var stmt of node.body) {
      stmt.accept(this);
    }

    if (pushNewScope) {
      this._popScope();
    }
  }

  visitExpressionStatement (node) {
    node.expression.accept(this);
  }

  visitBinaryExpression (node) {
    node.left.accept(this);
    node.right.accept(this);
  }

  visitIdentifier (node, checkIfDefined = true) {
    if (checkIfDefined && !this.scope.isVariableDefined(node.name)) {
      this._warnings.push(`Variable '${node.name}' is not defined.`);
    }
  }

  visitLiteral (node) {

  }

  visitDeclarationStatement (node) {
    try {
      this.scope.define(node);
    }
    catch (ex) {
      this._warnings.push(ex.message);
    }

    for (var decl of node.declarations) {
      decl.accept(this);
    }
  }

  visitDeclarator (node) {
    node.id.accept(this);

    if (node.init) {
      node.init.accept(this);
    }
  }

  _processFunctionParameters (node) {
    // create params declaration statement
    var paramsDeclaration = new DeclarationStatement();

    paramsDeclaration.declarations = node.params.map((param, i) => {
      var defaultValue = node.defaults[i];

      return new Declarator(param, defaultValue);
    });

    // create temporary scope for parameters (for default values expressions)
    this._pushFunctionScope();
    this.scope.define(paramsDeclaration);

    // visit params and default values
    for (let i = 0; i < node.params.length; i++) {
      let param = node.params[i];
      let defaultValue = node.defaults[i];

      param.accept(this);

      if (defaultValue) {
        defaultValue.accept(this);
      }
    }

    this._popScope();

    return paramsDeclaration;
  }

  visitFunctionDeclarationStatement (node) {
    // define function
    try {
      this.scope.define(node);
    }
    catch (ex) {
      this._errors.push(ex.message);
    }

    // visit function name
    node.id.accept(this);

    // process function parameters
    var paramsDeclaration = this._processFunctionParameters(node);

    // create scope for function body
    this._pushFunctionScope();
    // ... and inject parameters declaration
    this.scope.define(paramsDeclaration);

    // visit function body
    node.body.accept(this, false);

    this._popScope();
  }

  visitFunctionExpression (node) {
    var functionNameDeclaration = null;

    // optional function name
    if (node.id) {
      functionNameDeclaration = new DeclarationStatement();
      functionNameDeclaration.addDeclarator(node.id, node);

      // visit function name
      node.id.accept(this, false);
    }

    // process function parameters
    var paramsDeclaration = this._processFunctionParameters(node);

    this._pushFunctionScope();

    // define function name
    if (functionNameDeclaration) {
      this.scope.define(functionNameDeclaration);
    }
    // ... and inject parameters declaration
    this.scope.define(paramsDeclaration);

    // visit function body
    node.body.accept(this, false);

    this._popScope();
  }

  visitEmptyStatement (node) {

  }

  visitReturnStatement (node) {
    if (node.argument) {
      node.argument.accept(this);
    }
  }

  visitCallExpression (node) {
    node.callee.accept(this);

    for (var arg of node.args) {
      arg.accept(this);
    }
  }

  visitAssignmentExpression (node) {
    node.left.accept(this);
    node.right.accept(this);
  }

  visitArrayExpression (node) {
    for (var el of node.elements) {
      el.accept(this);
    }
  }

  visitConditionalExpression (node) {
    node.test.accept(this);
    node.consequent.accept(this);
    node.alternate.accept(this);
  }

  visitMemberExpression (node) {
    node.object.accept(this);
    node.property.accept(this, false);
  }

  visitNewExpression (node) {
    node.callee.accept(this);

    for (var arg of node.args) {
      arg.accept(this);
    }
  }

  visitGroupExpression (node) {
    node.expression.accept(this);
  }

  visitObjectProperty (node) {
    node.value.accept(this);
  }

  visitObjectExpression (node) {
    for (var prop of node.properties) {
      prop.accept(this);
    }
  }

  visitLabeledStatement (node) {
    node.label.accept(this);
    node.body.accept(this);
  }

  visitBreakStatement (node) {
    if (node.label) {
      node.label.accept(this);
    }
  }

  visitContinueStatement (node) {
    if (node.label) {
      node.label.accept(this);
    }
  }

  visitWhileStatement (node) {
    node.test.accept(this);
    node.body.accept(this);
  }

  visitDoWhileStatement (node) {
    node.test.accept(this);
    node.body.accept(this);
  }

  visitThrowStatement (node) {
    node.argument.accept(this);
  }

  visitUpdateExpression (node) {
    node.argument.accept(this);
  }

  visitIfStatement (node) {
    node.test.accept(this);
    node.consequent.accept(this);

    if (node.alternate) {
      node.alternate.accept(this);
    }
  }

  visitThisExpression (node) {

  }

  visitForStatement (node) {
    if (node.init) {
      node.init.accept(this);
    }

    if (node.test) {
      node.test.accept(this);
    }

    if (node.update) {
      node.update.accept(this);
    }

    node.body.accept(this);
  }

  visitForInStatement (node) {
    node.left.accept(this);
    node.right.accept(this);
    node.body.accept(this);
  }

  visitDebuggerStatement (node) {

  }

  visitTryStatement (node) {
    node.block.accept(this);

    for (var handler of node.handlers) {
      handler.accept(this);
    }

    if (node.finalizer) {
      node.finalizer.accept(this);
    }
  }

  visitCatchClause (node) {
    node.param.accept(this);
    node.body.accept(this);
  }

  visitUnaryExpression (node) {
    node.argument.accept(this);
  }

  visitSequenceExpression (node) {
    for (var expr of node.expressions) {
      expr.accept(this);
    }
  }

  visitSwitchStatement (node) {
    for (var ccase of node.cases) {
      ccase.accept(this);
    }

    node.discriminant.accept(this);
  }

  visitSwitchCase (node) {
    for (var stmt of node.consequent) {
      stmt.accept(this);
    }

    if (node.test) {
      node.test.accept(this);
    }
  }

  visitAny (node) {
    console.log('Not implemented: ', node);
  }
}
