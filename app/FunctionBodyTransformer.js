import {
  Keyword,
  Punctuator
} from './Lexer';
import Program from './Program';
import FunctionExpression from './expressions/FunctionExpression';
import { DeclarationStatement } from './statements/DeclarationStatement';
import FunctionDeclarationStatement from './statements/FunctionDeclarationStatement';
import AssignmentExpression from './expressions/AssignmentExpression';

export default class FunctionBodyTransformer {
  static transform (node) {
    var transformer = new this(node)

    return transformer.transform();
  }

  constructor (node) {
    this._node = node;

    this._results = [];
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

    return this._results;
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
      let asssignments = this._transformDeclToAssignmentExpr(node);

      // delete init expressions
      node.declarations.forEach((decl) => decl.init = null);

      this._results.push({
        asssignments,
        declaration: node
      });
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

  _transformDeclToAssignmentExpr (declarationStatement) {
    var transformed = [];

    if (declarationStatement instanceof DeclarationStatement) {
      for (let declarator of declarationStatement.declarations) {
        if (declarator.init) {
          var assignment = new AssignmentExpression(Punctuator.Assign, declarator.id, declarator.init);

          transformed.push(assignment);
        }
        //console.log('decl:', declarator);
      }
    }
    else {
      throw new Error('Bad declaration statement.');
    }

    return transformed;
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
