export default class Scope {
  constructor ({ parent = null, block = false }) {
    // reference to parent scope
    this._parent = parent;

    // array of variables defined in this scope
    this._vars = [];

    // array of labels (continue, break) defined in this scope
    this._labels = [];

    // block scope or not
    this._isBlock = block;
  }

  /**
   * Define variable in current scope (disabling variable redefinition).
   */
  define (varName, varDeclaration = true) {
    var scope = this;

    if (varDeclaration) {
      scope = this._findFunctionScope();
    }

    if (scope._vars.indexOf(varName) == -1) {
      scope._vars.push(varName);
    }
    else {
      throw new SyntaxError(`Variable '${varName}' already defined in current scope.`);
    }
  }

  /**
   * Return "nearest" function/global scope.
   */
  _findFunctionScope () {
    var currScope = this;

    do {
      if (!currScope._isBlock) {
        return currScope;
      }
    }
    while (currScope = currScope._parent);
  }

  /**
   * Check if variable is defined (traverses scope chain)
   */
  isVariableDefined (varName) {
    var currScope = this;

    do {
      if (currScope._vars.indexOf(varName) > -1) {
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
    this._labels.push(name);
  }

  /**
   * Check if scope has label defined
   */
  hasLabel (name) {
    return this._labels.indexOf(name) > -1;
  }
}
