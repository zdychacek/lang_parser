import {
  Keyword,
  Punctuator
} from './Lexer';
import AbstractVisitor from './AbstractVisitor';
import { DeclarationStatement } from './statements/DeclarationStatement';
import FunctionDeclarationStatement from './statements/FunctionDeclarationStatement';

export default class ScopeVisitor extends AbstractVisitor {
  static getScopeDeclarations (node) {
    return new this().getScopeDeclarations(node);
  }

  constructor () {
    super();

    this._declarations = [];
  }

  getScopeDeclarations (node) {
    if (!node.body) {
      throw new Error('Node must contain body of statements.');
    }

    var body = node.body;

    for (var stmt of node.body) {
      stmt.accept(this);
    }

    return this._declarations;
  }

  visitDeclarationStatement (node) {
    // only vars can be hoisted
    if (node.kind == Keyword.Var) {
      // remember declaration for hoisting
      this._declarations.push(node);
    }
  }

  visitFunctionDeclarationStatement (node) {
    this._declarations.push(node);
  }

  visitForStatement (node) {
    if (node.init) {
      if (node.init instanceof DeclarationStatement) {
        this._declarations.push(node.init);
      }

      node.init.accept(this);
    }

    node.body.accept(this);
  }

  visitForInStatement (node) {
    if (node.left instanceof DeclarationStatement) {
      this._declarations.push(node.left);
    }

    node.left.accept(this);
    node.body.accept(this);
  }

  visitFunctionExpression (node) {
    // do nothing
  }
}
