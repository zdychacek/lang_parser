import { Keyword } from './Lexer';

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

    // array of variables defined in this scope
    this._vars = {};

    // array of labels (continue, break) defined in this scope
    this._labels = [];

    // tscope type (block or function)
    this._type = type;

    // reference to parser
    this._parser = parser;
  }

  /**
   * Define variable in current scope (disabling variable redefinition).
   */
  define (name, kind) {
    var scope = this;

    // if we are about to define variable with var, we must find nearest function scope first
    if (kind == Keyword.Var) {
      scope = this._findFunctionScope();
    }

    // if variable is not defined, then define it
    if (!(name in scope._vars)) {
      scope._vars[name] = kind;
    }
    else {
      this._parser.throw(`Variable '${name}' already defined in current scope`, ReferenceError);
    }
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
  isVariableDefined (name) {
    var currScope = this;

    do {
      if (name in currScope._vars) {
        return true;
      }
    }
    while (currScope = currScope._parent);

    return false;
  }

  /**
   * Add label name definition
   */
  addLabel (name) {
    // labels are always defined on function scope level
    var scope = this._findFunctionScope();

    // do not allow duplicate label names in same scope
    if (scope.hasLabel(name)) {
      this._parser.throw(`Label with name '${name} already defined`, ReferenceError);
    }

    scope._labels.push(name);
  }

  /**
   * Check if scope has label defined
   */
  hasLabel (name) {
    // labels are always defined on function scope level
    var scope = this._findFunctionScope();

    return scope._labels.indexOf(name) > -1;
  }
}
