export default class AbstractVisitor {
  constructor () {}

  visitProgram (node) {
    for (var stmt of node.body) {
      stmt.accept(this);
    }
  }

  visitBlockStatement (node) {
    for (var stmt of node.body) {
      stmt.accept(this);
    }
  }

  visitExpressionStatement (node) {
    node.expression.accept(this);
  }

  visitBinaryExpression (node) {
    node.left.accept(this);
    node.right.accept(this);
  }

  visitIdentifier (node) {}

  visitLiteral (node) {}

  visitDeclarationStatement (node) {
    for (var decl of node.declarations) {
      decl.accept(this);
    }
  }

  visitDeclarator (node) {
    node.id.accept(this);

    if (node.init) {
      node.init.accept(this);
    }
  }

  visitFunctionDeclarationStatement (node) {
    node.id.accept(this);

    for (var param of node.params) {
      param.accept(this);
    }

    node.body.accept(this);
  }

  visitFunctionExpression (node) {
    if (node.id) {
      node.id.accept(this);
    }

    for (var param of node.params) {
      param.accept(this);
    }

    node.body.accept(this);
  }

  visitEmptyStatement (node) {}

  visitReturnStatement (node) {
    if (node.argument) {
      node.argument.accept(this);
    }
  }

  visitCallExpression (node) {
    node.callee.accept(this);

    for (var arg of node.args) {
      arg.accept(this);
    }
  }

  visitAssignmentExpression (node) {
    node.left.accept(this);
    node.right.accept(this);
  }

  visitArrayExpression (node) {
    for (var el of node.elements) {
      el.accept(this);
    }
  }

  visitConditionalExpression (node) {
    node.test.accept(this);
    node.consequent.accept(this);
    node.alternate.accept(this);
  }

  visitNewExpression (node) {
    node.callee.accept(this);

    for (var arg of node.args) {
      arg.accept(this);
    }
  }

  visitGroupExpression (node) {
    node.expression.accept(this);
  }

  visitObjectProperty (node) {
    node.key.accept(this);
    node.value.accept(this);
  }

  visitObjectExpression (node) {
    for (var prop of node.properties) {
      prop.accept(this);
    }
  }

  visitLabeledStatement (node) {
    node.label.accept(this);
    node.body.accept(this);
  }

  visitBreakStatement (node) {
    if (node.label) {
      node.label.accept(this);
    }
  }

  visitContinueStatement (node) {
    if (node.label) {
      node.label.accept(this);
    }
  }

  visitWhileStatement (node) {
    node.test.accept(this);
    node.body.accept(this);
  }

  visitDoWhileStatement (node) {
    node.test.accept(this);
    node.body.accept(this);
  }

  visitThrowStatement (node) {
    node.argument.accept(this);
  }

  visitUpdateExpression (node) {
    node.argument.accept(this);
  }

  visitIfStatement (node) {
    node.test.accept(this);
    node.consequent.accept(this);

    if (node.alternate) {
      node.alternate.accept(this);
    }
  }

  visitThisExpression (node) {}

  visitForStatement (node) {
    if (node.init) {
      node.init.accept(this);
    }

    if (node.test) {
      node.test.accept(this);
    }

    if (node.update) {
      node.update.accept(this);
    }

    node.body.accept(this);
  }

  visitForInStatement (node) {
    node.left.accept(this);
    node.right.accept(this);
    node.body.accept(this);
  }

  visitDebuggerStatement (node) {}

  visitTryStatement (node) {
    node.block.accept(this);

    for (var handler of node.handlers) {
      handler.accept(this);
    }

    if (node.finalizer) {
      node.finalizer.accept(this);
    }
  }

  visitCatchClause (node) {
    node.param.accept(this);
    node.body.accept(this);
  }

  visitUnaryExpression (node) {
    node.argument.accept(this);
  }

  visitSequenceExpression (node) {
    for (var expr of node.expressions) {
      expr.accept(this);
    }
  }

  visitSwitchStatement (node) {
    for (var ccase of node.cases) {
      ccase.accept(this);
    }

    node.discriminant.accept(this);
  }

  visitSwitchCase (node) {
    for (var stmt of node.consequent) {
      stmt.accept(this);
    }

    if (node.test) {
      node.test.accept(this);
    }
  }

  visitWithStatment (node) {
    node.object.accept(this);
    node.body.accept(this);
  }

  visitAny (node) {
    console.log(`AbstractVisitor#visitAny called with node type ${node.type}.`);
  }
}
