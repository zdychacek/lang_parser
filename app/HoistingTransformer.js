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

export default class HoistingTransformer {
  static hoist (node) {
    return new this().hoist(node);
  }

  constructor () {
    this._state = {};
    this._declarations = [];
  }

  /**
   * Find declarations and hoist them to the of function.
   * 1. Find declaration and transform it to assignment expression.
   * 2. Remember this declaration.
   */
  hoist (node) {
    var variables = [];
    var functions = [];

    if (!node.body) {
      throw new Error('Node must contain body of statements.');
    }

    this._transformStatements(node);

    this._declarations.forEach((decl) => {
      if (decl instanceof DeclarationStatement) {
        variables.push(decl);
      }
      else {
        functions.push(decl);
      }
    });

    if (functions.length) {
      node.body.splice(0, 0, ...functions);
    }

    if (variables.length) {
      variables = DeclarationStatement.merge(...variables);
      node.body.splice(0, 0, variables);
    }
  }

  _transformStatements (node, prop = 'body') {
    var newBody = [];

    for (var stmt of node[prop]) {
      let index = node[prop].indexOf(stmt);
      let nodeReplacement = stmt.accept(this);

      if (nodeReplacement) {
        newBody.push(...nodeReplacement);
      }
      else if (nodeReplacement !== null){
        newBody.push(stmt);
      }
    }

    node[prop] = newBody;
  }

  visitBlockStatement (node) {
    this._transformStatements(node);
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
    this._transformStatements(node, 'consequent');
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
