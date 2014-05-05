import Parser from './Parser';
import Precedence from './Precedence';
import { TokenType, Keyword, Punctuator, Precedence } from './Lexer';

///// Expressions
import IdentifierExpression from './expressions/IdentifierExpression';
import LiteralExpression from './expressions/LiteralExpression';
import AssignmentExpression from './expressions/AssignmentExpression';
import ConditionalExpression from './expressions/ConditionalExpression';
import GroupExpression from './expressions/GroupExpression';
import CallExpression from './expressions/CallExpression';
import PrefixOperatorExpression from './expressions/PrefixOperatorExpression';
import PostfixOperatorExpression from './expressions/PostfixOperatorExpression';
import BinaryOperatorExpression from './expressions/BinaryOperatorExpression';
import FunctionExpression from './expressions/FunctionExpression';

///// Statements
import Statement from './statements/Statement';
import IfStatement from './statements/IfStatement';
import LeftCurlyStatement from './statements/LeftCurlyStatement';
import DeclarationStatement from './statements/DeclarationStatement';
import FunctionDeclarationStatement from './statements/FunctionDeclarationStatement';
import ReturnStatement from './statements/ReturnStatement';

export default class MyParser extends Parser {
  constructor (lexer) {
    super(lexer);

    this.registerPrefix(TokenType.Identifier, new IdentifierExpression());
    this.registerPrefix(TokenType.Literal, new LiteralExpression());
    this.registerPrefix(Punctuator.LeftParen, new GroupExpression());
    this.registerPrefix(Keyword.Function, new FunctionExpression());

    this.registerInfix(Punctuator.Question, new ConditionalExpression());
    this.registerInfix(Punctuator.LeftParen, new CallExpression());

    // assignments
    [
      Punctuator.Assign,
      Punctuator.PlusAssign,
      Punctuator.MinusAssign,
      Punctuator.AsteriskAssign,
      Punctuator.SlashAssign,
      Punctuator.CaretAssign
    ].forEach(function (tokenType) {
      this.registerInfix(tokenType, new AssignmentExpression())
    }, this);

    this.registerPrefixGeneric(Punctuator.Plus, Precedence.Prefix);
    this.registerPrefixGeneric(Punctuator.Minus, Precedence.Prefix);
    this.registerPrefixGeneric(Punctuator.Tilde, Precedence.Prefix);
    this.registerPrefixGeneric(Punctuator.Bang, Precedence.Prefix);

    this.registerPostfixGeneric(Punctuator.Bang, Precedence.Postfix);

    this.registerInfixLeftGeneric(Punctuator.Plus, Precedence.Sum);
    this.registerInfixLeftGeneric(Punctuator.Minus, Precedence.Sum);
    this.registerInfixLeftGeneric(Punctuator.Asterisk, Precedence.Product);
    this.registerInfixLeftGeneric(Punctuator.Slash, Precedence.Product);

    // relational
    this.registerInfixLeftGeneric(Punctuator.Equal, Precedence.Relational);
    this.registerInfixLeftGeneric(Punctuator.NotEqual, Precedence.Relational);
    this.registerInfixLeftGeneric(Punctuator.Greater, Precedence.Relational);
    this.registerInfixLeftGeneric(Punctuator.Less, Precedence.Relational);
    this.registerInfixLeftGeneric(Punctuator.GreaterEqual, Precedence.Relational);
    this.registerInfixLeftGeneric(Punctuator.LessEqual, Precedence.Relational);

    // logical
    this.registerInfixLeftGeneric(Punctuator.LogicalAnd, Precedence.LogicalAnd);
    this.registerInfixLeftGeneric(Punctuator.LogicalOr, Precedence.LogicalOr);

    // right associativity
    this.registerInfixRightGeneric(Punctuator.Caret, Precedence.Exponent);

    // statements
    this.registerStatement(Punctuator.LeftCurly, new LeftCurlyStatement());
    this.registerStatement(Keyword.If, new IfStatement());
    this.registerStatement(Keyword.Var, new DeclarationStatement());
    this.registerStatement(Keyword.Let, new DeclarationStatement());
    this.registerStatement(Keyword.Function, new FunctionDeclarationStatement());
    this.registerStatement(Keyword.Return, new ReturnStatement());
  }

  registerPostfixGeneric (token, precedence) {
    this.registerInfix(token, new PostfixOperatorExpression(precedence));
  }

  registerPrefixGeneric (token, precedence) {
    this.registerPrefix(token, new PrefixOperatorExpression(precedence));
  }

  registerInfixLeftGeneric (token, precedence) {
    this.registerInfix(token, new BinaryOperatorExpression(precedence, false));
  }

  registerInfixRightGeneric (token, precedence) {
    this.registerInfix(token, new BinaryOperatorExpression(precedence, true));
  }
}
