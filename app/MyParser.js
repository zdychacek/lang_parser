import Parser from './Parser';
import Precedence from './Precedence';
import { TokenType, Keyword } from './Lexer';

///// Operators
import IdentifierParselet from './parselets/IdentifierParselet';
import LiteralParselet from './parselets/LiteralParselet';
import AssignmentParselet from './parselets/AssignmentParselet';
import ConditionalParselet from './parselets/ConditionalParselet';
import GroupParselet from './parselets/GroupParselet';
import CallParselet from './parselets/CallParselet';
import PrefixOperatorParselet from './parselets/PrefixOperatorParselet';
import PostfixOperatorParselet from './parselets/PostfixOperatorParselet';
import BinaryOperatorParselet from './parselets/BinaryOperatorParselet';

///// Statements
import Statement from './statements/Statement';
import IfStatement from './statements/IfStatement';
import LeftCurlyStatement from './statements/LeftCurlyStatement';
import DeclarationStatement from './statements/DeclarationStatement';

export default class MyParser extends Parser {
  constructor (lexer) {
    super(lexer);

    this.register(TokenType.IDENTIFIER, new IdentifierParselet());
    this.register(TokenType.LITERAL, new LiteralParselet());
    this.register(TokenType.QUESTION, new ConditionalParselet());
    this.register(TokenType.LEFT_PAREN, new GroupParselet());
    this.register(TokenType.LEFT_PAREN, new CallParselet());

    [
      TokenType.ASSIGN,
      TokenType.PLUS_ASSIGN,
      TokenType.MINUS_ASSIGN,
      TokenType.ASTERISK_ASSIGN,
      TokenType.SLASH_ASSIGN,
      TokenType.CARET_ASSIGN
    ].forEach(function (tokenType) {
      this.register(tokenType, new AssignmentParselet())
    }, this);

    this.prefix(TokenType.PLUS, Precedence.PREFIX);
    this.prefix(TokenType.MINUS, Precedence.PREFIX);
    this.prefix(TokenType.TILDE, Precedence.PREFIX);
    this.prefix(TokenType.BANG, Precedence.PREFIX);

    this.postfix(TokenType.BANG, Precedence.POSTFIX);

    this.infixLeft(TokenType.PLUS, Precedence.SUM);
    this.infixLeft(TokenType.MINUS, Precedence.SUM);
    this.infixLeft(TokenType.ASTERISK, Precedence.PRODUCT);
    this.infixLeft(TokenType.SLASH, Precedence.PRODUCT);

    // relational
    this.infixLeft(TokenType.EQUAL, Precedence.RELATION);
    this.infixLeft(TokenType.NOT_EQUAL, Precedence.RELATION);
    this.infixLeft(TokenType.GREATER, Precedence.RELATION);
    this.infixLeft(TokenType.LESS, Precedence.RELATION);
    this.infixLeft(TokenType.GREATER_OR_EQUAL, Precedence.RELATION);
    this.infixLeft(TokenType.LESS_OR_EQUAL, Precedence.RELATION);

    // logical
    this.infixLeft(TokenType.LOGICAL_AND, Precedence.LOGICAL_AND);
    this.infixLeft(TokenType.LOGICAL_OR, Precedence.LOGICAL_OR);

    // right associativity
    this.infixRight(TokenType.CARET, Precedence.EXPONENT);

    // statements
    this.registerStatement(Keyword.IF, new IfStatement());
    this.registerStatement(Keyword.VAR, new DeclarationStatement());
    this.registerStatement(Keyword.LET, new DeclarationStatement());
    this.registerStatement(TokenType.LEFT_CURLY, new LeftCurlyStatement());
  }

  postfix (token, precedence) {
    this.register(token, new PostfixOperatorParselet(precedence));
  }

  prefix (token, precedence) {
    this.register(token, new PrefixOperatorParselet(precedence));
  }

  infixLeft (token, precedence) {
    this.register(token, new BinaryOperatorParselet(precedence, false));
  }

  infixRight (token, precedence) {
    this.register(token, new BinaryOperatorParselet(precedence, true));
  }
}
