import Parser from './Parser';
import { TokenType, Keyword, Punctuator, Precedence } from './Lexer';

///// Expressions
import IdentifierExpressionParser from './expressions/parsers/IdentifierExpressionParser';
import LiteralExpressionParser from './expressions/parsers/LiteralExpressionParser';
import SequenceExpressionParser from './expressions/parsers/SequenceExpressionParser';
import AssignmentExpressionParser from './expressions/parsers/AssignmentExpressionParser';
import ConditionalExpressionParser from './expressions/parsers/ConditionalExpressionParser';
import GroupExpressionParser from './expressions/parsers/GroupExpressionParser';
import CallExpressionParser from './expressions/parsers/CallExpressionParser';
import UnaryExpressionParser from './expressions/parsers/UnaryExpressionParser';
import PostfixOperatorExpressionParser from './expressions/parsers/PostfixOperatorExpressionParser';
import BinaryOperatorExpressionParser from './expressions/parsers/BinaryOperatorExpressionParser';
import FunctionExpressionParser from './expressions/parsers/FunctionExpressionParser';
import ObjectExpressionParser from './expressions/parsers/ObjectExpressionParser';
import ArrayExpressionParser from './expressions/parsers/ArrayExpressionParser';
import MemberExpressionParser from './expressions/parsers/MemberExpressionParser';
import UpdateExpressionParser from './expressions/parsers/UpdateExpressionParser';
import ThisExpressionParser from './expressions/parsers/ThisExpressionParser';

///// Statements
import IfStatementParser from './statements/parsers/IfStatementParser';
import BlockStatementParser from './statements/parsers/BlockStatementParser';
import DeclarationStatementParser from './statements/parsers/DeclarationStatementParser';
import FunctionDeclarationStatementParser from './statements/parsers/FunctionDeclarationStatementParser';
import ReturnStatementParser from './statements/parsers/ReturnStatementParser';
import EmptyStatementParser from './statements/parsers/EmptyStatementParser';
import WhileStatementParser from './statements/parsers/WhileStatementParser';
import DoWhileStatementParser from './statements/parsers/DoWhileStatementParser';
import ContinueStatementParser from './statements/parsers/ContinueStatementParser';
import BreakStatementParser from './statements/parsers/BreakStatementParser';
import ForStatementParser from './statements/parsers/ForStatementParser';

export default class MyParser extends Parser {
  constructor (lexer) {
    super(lexer);

    this.registerPrefix(TokenType.Identifier, new IdentifierExpressionParser());
    this.registerPrefix(TokenType.Literal, new LiteralExpressionParser());
    this.registerPrefix(Punctuator.LeftParen, new GroupExpressionParser());
    this.registerPrefix(Punctuator.LeftCurly, new ObjectExpressionParser());
    this.registerPrefix(Punctuator.LeftSquare, new ArrayExpressionParser());
    this.registerPrefix(Keyword.Function, new FunctionExpressionParser());
    this.registerPrefix(Punctuator.Increment, new UpdateExpressionParser(true));
    this.registerPrefix(Punctuator.Decrement, new UpdateExpressionParser(true));
    this.registerPrefix(Keyword.This, new ThisExpressionParser());

    this.registerInfix(Punctuator.Question, new ConditionalExpressionParser());
    this.registerInfix(Punctuator.LeftParen, new CallExpressionParser());
    this.registerInfix(Punctuator.Dot, new MemberExpressionParser(false));
    this.registerInfix(Punctuator.LeftSquare, new MemberExpressionParser(true));
    this.registerInfix(Punctuator.Comma, new SequenceExpressionParser());
    this.registerInfix(Punctuator.Increment, new UpdateExpressionParser(false));
    this.registerInfix(Punctuator.Decrement, new UpdateExpressionParser(false));

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
    this.registerPrefixGeneric(Keyword.TypeOf, Precedence.Prefix);

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
    this.registerInfixLeftGeneric(Keyword.InstanceOf, Precedence.Relational);
    this.registerInfixLeftGeneric(Keyword.In, Precedence.Relational);

    // logical
    this.registerInfixLeftGeneric(Punctuator.LogicalAnd, Precedence.LogicalAnd);
    this.registerInfixLeftGeneric(Punctuator.LogicalOr, Precedence.LogicalOr);

    // right associativity
    this.registerInfixRightGeneric(Punctuator.Caret, Precedence.Exponent);

    // statements
    this.registerStatement(Punctuator.LeftCurly, new BlockStatementParser());
    this.registerStatement(Punctuator.Semicolon, new EmptyStatementParser());
    this.registerStatement(Keyword.If, new IfStatementParser());
    this.registerStatement(Keyword.Var, new DeclarationStatementParser());
    this.registerStatement(Keyword.Let, new DeclarationStatementParser());
    this.registerStatement(Keyword.Function, new FunctionDeclarationStatementParser());
    this.registerStatement(Keyword.Return, new ReturnStatementParser());
    this.registerStatement(Keyword.While, new WhileStatementParser());
    this.registerStatement(Keyword.Do, new DoWhileStatementParser());
    this.registerStatement(Keyword.Continue, new ContinueStatementParser());
    this.registerStatement(Keyword.Break, new BreakStatementParser());
    this.registerStatement(Keyword.For, new ForStatementParser());
  }

  registerPostfixGeneric (token, precedence) {
    this.registerInfix(token, new PostfixOperatorExpressionParser(precedence));
  }

  registerPrefixGeneric (token, precedence) {
    this.registerPrefix(token, new UnaryExpressionParser(precedence));
  }

  registerInfixLeftGeneric (token, precedence) {
    this.registerInfix(token, new BinaryOperatorExpressionParser(precedence, false));
  }

  registerInfixRightGeneric (token, precedence) {
    this.registerInfix(token, new BinaryOperatorExpressionParser(precedence, true));
  }
}
