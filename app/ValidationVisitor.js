import {
  Keyword,
  Punctuator
} from './Lexer';
import {
  Scope,
  ScopeType
} from './Scope';
import AbstractVisitor from './AbstractVisitor';
import HoistingTransformer from './HoistingTransformer';
import { DeclarationStatement, Declarator } from './statements/DeclarationStatement';
import IdentifierExpression from './expressions/IdentifierExpression';
import BlockStatement from './statements/BlockStatement';
import ScopeVisitor from './ScopeVisitor';

/**
 * Validates AST.
 */
export default class ValidationVisitor extends AbstractVisitor {
  constructor (globals) {
    super();

    this._globals = globals;
    this._state = {};

    this.reset();
  }

  reset () {
    // scope chain for identifier lookup
    this._scopeChain = [];
    this._warnings = [];
    this._errors = [];
    this._currentAst = null;
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
    return this._scopeChain[this._scopeChain.length - 1];
  }

  get globalScope () {
    return this._scopeChain[0];
  }

  dump () {
    return this._currentAst;
  }

  visitProgram (node) {
    this.reset();

    // save reference to actually validatiog AST
    this._currentAst = node;

    var globalsDeclarations = new DeclarationStatement(Keyword.Var);

    // create globals
    if (this._globals) {
      globalsDeclarations.declarations = this._globals.map((gl) => new Declarator(new IdentifierExpression(gl), null));
    }

    // create global scope
    this._pushFunctionScope();

    // extend global scope with globals
    this.scope.declare(globalsDeclarations);
    this._injectCurrentScopeDeclarations(node);

    // visit program body
    for (var stmt of node.body) {
      stmt.accept(this);
    }

    // destroy global scope
    this._popScope();
  }

  _injectCurrentScopeDeclarations (node) {
    var scopeDeclarations = ScopeVisitor.getScopeDeclarations(node);

    try {
      for (var decl of scopeDeclarations) {
        this.scope.declare(decl);
      }
    }
    catch (ex) {
      this._warnings.push(ex.message);
    }
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

  visitIdentifier (node, checkIfDefined = true) {
    if (this._state.inWith) {
      return;
    }

    if (checkIfDefined && !this.scope.isDeclared(node.name)) {
      this._warnings.push(`Variable '${node.name}' is not defined.`);
    }
  }

  visitDeclarationStatement (node) {
    for (var decl of node.declarations) {
      decl.accept(this);
    }
  }

  visitDeclarator (node) {
    if (!this.scope.isDeclared(node, true)) {
      try {
        this.scope.declare(node);
      }
      catch (ex) {
        this._warnings.push(ex.message);
      }
    }

    node.id.accept(this);

    if (node.init) {
      node.init.accept(this);
    }
  }

  _processFunctionParameters (node) {
    // create params declaration statement
    var paramsDeclaration = new DeclarationStatement();
    var paramsNamesMap = Object.create(null);

    node.params.forEach((param, i) => {
      var defaultValue = node.defaults[i];

      if (!paramsNamesMap[param.name]) {
        paramsDeclaration.declarations.push(new Declarator(param, defaultValue));

        paramsNamesMap[param.name] = true;
      }
      else {
        this._warnings.push(`Duplicate parameter name '${param.name}'.`);
      }
    });

    // create temporary scope for parameters (for default values expressions)
    this._pushFunctionScope();

    this.scope.declare(paramsDeclaration);

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
    if (!this.scope.isDeclared(node, true)) {
      try {
        this.scope.declare(node);
      }
      catch (ex) {
        this._warnings.push(ex.message);
      }
    }

    // visit function name
    node.id.accept(this);

    // process function parameters
    var paramsDeclaration = this._processFunctionParameters(node);

    // create scope for function body
    this._pushFunctionScope();
    // ... and inject parameters declaration
    this.scope.declare(paramsDeclaration);

    this._injectCurrentScopeDeclarations(node.body);

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
      this.scope.declare(functionNameDeclaration);
    }

    // ... and inject parameters declaration
    try {
      this.scope.declare(paramsDeclaration);
    }
    catch (ex) {
      this._warnings.push(ex.message);
    }

    this._injectCurrentScopeDeclarations(node.body);

    // visit function body
    node.body.accept(this, false);

    this._popScope();
  }

  visitObjectProperty (node) {
    node.value.accept(this);
  }

  visitObjectExpression (node) {
    // map for properties names
    var propsName = Object.create(null);

    for (var prop of node.properties) {
      let propKey = prop.keyName;

      if (propKey in propsName) {
        this._warnings.push(`Duplicate object property '${propKey}'`)
      }

      // visit object property
      prop.accept(this);

      propsName[propKey] = true;
    }
  }

  visitLabeledStatement (node) {
    this.scope.addLabel(node);

    node.label.accept(this, false);
    node.body.accept(this);
  }

  visitBreakStatement (node) {
    if (node.label) {
      let labelName = node.label.name;

      if (!this.scope.hasLabel(labelName)) {
        this._warnings.push(`Undefined label ${labelName}`);
      }
      node.label.accept(this, false);
    }
  }

  visitContinueStatement (node) {
    if (node.label) {
      let labelName = node.label.name;

      if (!this.scope.hasLabel(labelName)) {
        this._warnings.push(`Undefined label ${labelName}`);
      }
      node.label.accept(this, false);
    }
  }

  visitForStatement (node) {
    this._pushFunctionScope();

    if (node.init) {
      node.init.accept(this);
    }

    if (node.test) {
      node.test.accept(this);
    }

    if (node.update) {
      node.update.accept(this);
    }

    this._popScope();

    var blockBody = node.body instanceof BlockStatement;

    if (blockBody) {
      this._pushBlockScope();
    }

    // inject declaration from for loop
    if (node.init instanceof DeclarationStatement) {
      if (!this.scope.isDeclared(node.init.declarations[0], true)) {
        this.scope.declare(node.init);
      }
    }

    // visit for body
    node.body.accept(this, false);

    if (blockBody) {
      this._popScope();
    }
  }

  visitForInStatement (node) {
    this._pushFunctionScope();

    node.left.accept(this);
    node.right.accept(this);

    this._popScope();

    // create block scope for body
    var blockBody = node.body instanceof BlockStatement;

    if (blockBody) {
      this._pushBlockScope();
    }

    // inject declaration from for loop
    if (node.left instanceof DeclarationStatement) {
      if (!this.scope.isDeclared(node.left.declarations[0], true)) {
        this.scope.declare(node.left);
      }
    }

    // visit for body
    node.body.accept(this);

    if (blockBody) {
      this._popScope();
    }
  }

  visitCatchClause (node) {
    // create catch param declaration
    var paramDeclaration = new DeclarationStatement(Keyword.Var);
    paramDeclaration.addDeclarator(node.param, null);

    // visit param
    node.param.accept(this, false);

    this._pushBlockScope();
    // inject param declaration into scope
    this.scope.declare(paramDeclaration);

    // parse catch block
    node.body.accept(this);

    this._popScope();
  }

  visitWithStatement (node) {
    node.object.accept(this);

    var oldState = this._state.inWith;
    this._state.inWith = true;

    this._warnings.push('Don\'t use with.');
    node.body.accept(this);

    this._state.inWith = oldState;
  }

  visitSwitchStatement (node) {
    node.discriminant.accept(this);

    this._pushBlockScope();

    for (var ccase of node.cases) {
      ccase.accept(this);
    }

    this._popScope();
  }

  visitMemberExpression (node) {
    if (node.computed) {
      node.property.accept(this);
    }
  }
}
