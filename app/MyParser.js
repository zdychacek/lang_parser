import Parser from './Parser';
import { TokenType, Keyword, Punctuator, Precedence } from './Lexer';

///// Expressions
import IdentifierExpressionParser from './expressions/parsers/IdentifierExpressionParser';
import LiteralExpressionParser from './expressions/parsers/LiteralExpressionParser';
import AssignmentExpressionParser from './expressions/parsers/AssignmentExpressionParser';
import ConditionalExpressionParser from './expressions/parsers/ConditionalExpressionParser';
import GroupExpressionParser from './expressions/parsers/GroupExpressionParser';
import CallExpression from './expressions/parsers/CallExpression';
import PrefixOperatorExpressionParser from './expressions/parsers/PrefixOperatorExpressionParser';
import PostfixOperatorExpressionParser from './expressions/parsers/PostfixOperatorExpressionParser';
import BinaryOperatorExpressionParser from './expressions/parsers/BinaryOperatorExpressionParser';
import FunctionExpressionParser from './expressions/parsers/FunctionExpressionParser';
import ObjectExpressionParser from './expressions/parsers/ObjectExpressionParser';

///// Statements
import IfStatementParser from './statements/parsers/IfStatementParser';
import LeftCurlyStatementParser from './statements/parsers/LeftCurlyStatementParser';
import DeclarationStatementParser from './statements/parsers/DeclarationStatementParser';
import FunctionDeclarationStatementParser from './statements/parsers/FunctionDeclarationStatementParser';
import ReturnStatementParser from './statements/parsers/ReturnStatementParser';
import EmptyStatementParser from './statements/parsers/EmptyStatementParser';

export default class MyParser extends Parser {
  constructor (lexer) {
    super(lexer);

    this.registerPrefix(TokenType.Identifier, new IdentifierExpressionParser());
    this.registerPrefix(TokenType.Literal, new LiteralExpressionParser());
    this.registerPrefix(Punctuator.LeftParen, new GroupExpressionParser());
    this.registerPrefix(Punctuator.LeftCurly, new ObjectExpressionParser());
    this.registerPrefix(Keyword.Function, new FunctionExpressionParser());

    this.registerInfix(Punctuator.Question, new ConditionalExpressionParser());
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
      this.registerInfix(tokenType, new AssignmentExpressionParser())
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
    this.registerStatement(Punctuator.LeftCurly, new LeftCurlyStatementParser());
    this.registerStatement(Punctuator.Semicolon, new EmptyStatementParser());
    this.registerStatement(Keyword.If, new IfStatementParser());
    this.registerStatement(Keyword.Var, new DeclarationStatementParser());
    this.registerStatement(Keyword.Let, new DeclarationStatementParser());
    this.registerStatement(Keyword.Function, new FunctionDeclarationStatementParser());
    this.registerStatement(Keyword.Return, new ReturnStatementParser());
  }

  registerPostfixGeneric (token, precedence) {
    this.registerInfix(token, new PostfixOperatorExpressionParser(precedence));
  }

  registerPrefixGeneric (token, precedence) {
    this.registerPrefix(token, new PrefixOperatorExpressionParser(precedence));
  }

  registerInfixLeftGeneric (token, precedence) {
    this.registerInfix(token, new BinaryOperatorExpressionParser(precedence, false));
  }

  registerInfixRightGeneric (token, precedence) {
    this.registerInfix(token, new BinaryOperatorExpressionParser(precedence, true));
  }
}
