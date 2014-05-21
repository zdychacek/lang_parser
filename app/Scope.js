import { Keyword } from './Lexer';
import { DeclarationStatement, Declarator } from './statements/DeclarationStatement';
import FunctionDeclarationStatement from './statements/FunctionDeclarationStatement';

/**
 * Represents scope type
 */
export var ScopeType = {
  Block: 'Block',
  Function: 'Function'
};

/**
 * Represents function or block scope.
 */
export class Scope {
  constructor ({ parent = null, type = ScopeType.Function }, parser) {
    // reference to parent scope
    this._parent = parent;

    // map of declarators defined in this scope
    this._vars = Object.create(null);

    // map of labels (continue, break) defined in this scope
    this._labels = Object.create(null);

    // tscope type (block or function)
    this._type = type;
  }

  /**
   * Define variable in current scope (disabling variable redefinition).
   */
  declare (declarationStatement) {
    var targetScope = this;
    var kind = declarationStatement.kind;

    // if we are about to define variable with var, we must find nearest function scope first
    if (kind == Keyword.Var) {
      targetScope = this._findFunctionScope();
    }

    if (declarationStatement instanceof DeclarationStatement) {
      for (let declarator of declarationStatement.declarations) {
        this._declare(declarator, targetScope);
      }
    }
    else {
      this._declare(declarationStatement, targetScope);
    }
  }

  _declare (declarator, scope) {
    let declaratorName = declarator.id.name;

    // if variable is not defined, then define it
    if (declaratorName in scope._vars) {
      throw new Error(`Variable '${declaratorName}' already defined in current scope.`);
    }
    else {
      scope._vars[declaratorName] = declarator;
    }
  }

  getVar (nameOrDeclarator, checkInstance = false) {
    var currScope = this;
    var name = nameOrDeclarator;
    var isStringDeclarator = true;

    if (typeof nameOrDeclarator !== 'string') {
      name = nameOrDeclarator.id.name;
      isStringDeclarator = false;
    }

    do {
      if (checkInstance && !isStringDeclarator) {
        if (currScope._vars[name] && nameOrDeclarator === currScope._vars[name]) {
          return currScope._vars[name];
        }
      }
      else if (currScope._vars[name]) {
        return currScope._vars[name];
      }
    }
    while (currScope = currScope._parent);

    return null;
  }

  /**
   * Return "nearest" function/global scope.
   */
  _findFunctionScope () {
    var currScope = this;

    do {
      if (currScope._type == ScopeType.Function) {
        return currScope;
      }
    }
    while (currScope = currScope._parent);
  }

  /**
   * Check if variable is defined (traverses scope chain)
   */
  isDeclared (nameOrDeclarator, checkInstance = false) {
    return !!this.getVar(nameOrDeclarator, checkInstance);
  }

  /**
   * Add label name definition
   */
  addLabel (labelStatement) {
    // labels are always defined on function scope level
    var scope = this._findFunctionScope();
    var labelName = labelStatement.label.name;

    // do not allow duplicate label names in same scope
    if (scope.hasLabel(labelName)) {
      throw new Error(`Label with name '${labelName} already defined`);
    }

    scope._labels[labelName] = labelStatement;
  }

  /**
   * Check if scope has label defined
   */
  hasLabel (name) {
    // labels are always defined on function scope level
    var scope = this._findFunctionScope();

    return name in scope._labels;
  }
}
