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
  define (declarationStatement) {
    var scope = this;
    var kind = declarationStatement.kind;

    // if we are about to define variable with var, we must find nearest function scope first
    if (kind == Keyword.Var) {
      scope = this._findFunctionScope();
    }

    if (declarationStatement instanceof DeclarationStatement) {
      for (let declarator of declarationStatement.declarations) {
        this._defineDeclarator(declarator, scope);
      }
    }
    else if (declarationStatement instanceof Declarator) {
      this._defineDeclarator(declarationStatement, scope);
    }
    else if (declarationStatement instanceof FunctionDeclarationStatement) {
      let declaratorName = declarationStatement.id.name;

      scope._vars[declaratorName] = declarationStatement;
    }
    else {
      throw new Error('You shall not pass.');
    }
  }

  _defineDeclarator (declarator, scope) {
    let declaratorName = declarator.id.name;

    // if variable is not defined, then define it
    if (!(declaratorName in scope._vars)) {
      scope._vars[declaratorName] = declarator;
    }
    else {
      throw new Error(`Variable '${declaratorName}' already defined in current scope.`);
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
