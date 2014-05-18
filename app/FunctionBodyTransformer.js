import {
  Keyword,
  Punctuator
} from './Lexer';
import Program from './Program';
import FunctionExpression from './expressions/FunctionExpression';
import FunctionDeclarationStatement from './statements/FunctionDeclarationStatement';

export default class FunctionBodyTransformer {
  constructor (node) {
    this._node = node;
    this._declarations = [];
  }

  /**
   * Find declarations and hoist them to the of function.
   * 1. Find declaration and transform it to assignment expression.
   * 2. Create new declaration and save it to the stack.
   */
  transform () {
    var node = this._node;

    if (!(node instanceof FunctionExpression)
      && !(node instanceof FunctionDeclarationStatement)
      && !(node instanceof Program))
    {
      throw new Error('Cannot operate on this node.');
    }

    var body = node.body;

    if (!Array.isArray(body)) {
      body = [ body ];
    }

    for (let stmt of body) {
      stmt.accept(this);
    }

    // TODO: remove
    //console.log(this._declarations);
  }

  visitBlockStatement (node) {
    for (let stmt of node.body) {
      stmt.accept(this);
    }
  }

  visitIfStatement (node) {
    node.consequent.accept(this);

    if (node.alternate) {
      node.alternate.accept(this);
    }
  }

  visitDeclarationStatement (node) {
    // only vars can be hoisted
    if (node.kind == Keyword.Var) {
      this._declarations.push(node);
    }
  }

  visitFunctionDeclarationStatement (node) {
    this._declarations.push(node);
  }

  visitForStatement (node) {
    node.init.accept(this);
    node.body.accept(this);
  }

  visitForInStatement (node) {
    node.left.accept(this);
    node.body.accept(this);
  }

  visitSwitchStatement (node) {
    for (let ccase of node.cases) {
      ccase.accept(this);
    }
  }

  visitSwitchCase (node) {
    for (let stmt of node.consequent) {
      stmt.accept(this);
    }
  }

  visitTryStatement (node) {
    node.block.accept(this);

    for (let handler of node.handlers) {
      handler.accept(this);
    }

    if (node.finalizer) {
      node.finalizer.accept(this);
    }
  }

  _transformDeclaration (decl) {

  }

  /**
   * Generic visit method.
   * Traverses only body prop, if exists.
   */
  visitAny (node) {
    if (node.body) {
      node.body.accept(this);
    }
  }
}
