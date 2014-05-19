import {
  Keyword,
  Punctuator
} from './Lexer';
import Program from './Program';
import FunctionExpression from './expressions/FunctionExpression';
import { DeclarationStatement } from './statements/DeclarationStatement';
import FunctionDeclarationStatement from './statements/FunctionDeclarationStatement';
import ExpressionStatement from './statements/ExpressionStatement';
import AssignmentExpression from './expressions/AssignmentExpression';
import SequenceExpression from './expressions/SequenceExpression';

export default class FunctionBodyTransformer {
  static transform (node) {
    var transformer = new this(node)

    return transformer.transform();
  }

  constructor (node) {
    this._node = node;

    this._state = {};
    this._declarations = [];
  }

  /**
   * Find declarations and hoist them to the of function.
   * 1. Find declaration and transform it to assignment expression.
   * 2. Create new declaration and save it to the stack.
   */
  transform () {
    var node = this._node;
    var body = node.body;

    for (var stmt of body) {
      let index = body.indexOf(stmt);
      let nodeReplacement = stmt.accept(this);

      if (nodeReplacement === null) {
        body.splice(index, 1);
      }
      else if (nodeReplacement && index > -1) {
        body.splice(index, 1, ...nodeReplacement);
      }
    }

    var variables = [];
    var functions = [];

    this._declarations.forEach((decl) => {
      if (decl instanceof DeclarationStatement) {
        variables.push(decl);
      }
      else {
        functions.push(decl);
      }
    });

    return { variables, functions };
  }

  visitBlockStatement (node) {
    for (var stmt of node.body) {
      let replacement = stmt.accept(this);

      if (replacement) {
        node.replace(stmt, replacement);
      }
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

      // clear init expressions (these were expanded to assignment expressions)
      node.declarations.forEach((decl) => decl.init = null);

      // remember declaration for hoisting
      this._declarations.push(node);

      return asssignments;
    }
  }

  visitFunctionDeclarationStatement (node) {
    this._declarations.push(node);

    return null;
  }

  visitForStatement (node) {
    this._state.inForDeclaration = true;

    var initReplacement = node.init.accept(this);

    this._state.inForDeclaration = false;

    if (initReplacement) {
      if (initReplacement.length > 1) {
        // we must remap ExpressionStatement to Expression
        node.init = new SequenceExpression(initReplacement.map((repl) => repl.expression));
      }
      else if (initReplacement.length) {
        node.init = initReplacement[0].expression;
      }
    }

    node.body.accept(this);
  }

  visitForInStatement (node) {
    this._state.inForDeclaration = true;

    var leftReplacement = node.left.accept(this);

    this._state.inForDeclaration = false;

    if (leftReplacement && leftReplacement.length) {
      node.left = leftReplacement[0];
    }

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

    for (var declarator of declarationStatement.declarations) {
      if (declarator.init) {
        var assignment = new ExpressionStatement(
          new AssignmentExpression(Punctuator.Assign, declarator.id, declarator.init)
        );

        transformed.push(assignment);
      }
      else {
        if (this._state.inForDeclaration) {
          transformed.push(declarator.id)
        }
      }
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
