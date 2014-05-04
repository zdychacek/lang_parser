import Parser from './Parser';
import Precedence from './Precedence';
import { TokenType, Keyword } from './Lexer';

///// Operators
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

export default class MyParser extends Parser {
  constructor (lexer) {
    super(lexer);

    this.registerPrefix(TokenType.IDENTIFIER, new IdentifierExpression());
    this.registerPrefix(TokenType.LITERAL, new LiteralExpression());
    this.registerPrefix(TokenType.LEFT_PAREN, new GroupExpression());
    this.registerPrefix(Keyword.FUNCTION, new FunctionExpression());

    this.registerInfix(TokenType.QUESTION, new ConditionalExpression());
    this.registerInfix(TokenType.LEFT_PAREN, new CallExpression());

    // assignments
    [
      TokenType.ASSIGN,
      TokenType.PLUS_ASSIGN,
      TokenType.MINUS_ASSIGN,
      TokenType.ASTERISK_ASSIGN,
      TokenType.SLASH_ASSIGN,
      TokenType.CARET_ASSIGN
    ].forEach(function (tokenType) {
      this.registerInfix(tokenType, new AssignmentExpression())
    }, this);

    this.registerPrefixGeneric(TokenType.PLUS, Precedence.PREFIX);
    this.registerPrefixGeneric(TokenType.MINUS, Precedence.PREFIX);
    this.registerPrefixGeneric(TokenType.TILDE, Precedence.PREFIX);
    this.registerPrefixGeneric(TokenType.BANG, Precedence.PREFIX);

    this.registerPostfixGeneric(TokenType.BANG, Precedence.POSTFIX);

    this.registerInfixLeftGeneric(TokenType.PLUS, Precedence.SUM);
    this.registerInfixLeftGeneric(TokenType.MINUS, Precedence.SUM);
    this.registerInfixLeftGeneric(TokenType.ASTERISK, Precedence.PRODUCT);
    this.registerInfixLeftGeneric(TokenType.SLASH, Precedence.PRODUCT);

    // relational
    this.registerInfixLeftGeneric(TokenType.EQUAL, Precedence.RELATION);
    this.registerInfixLeftGeneric(TokenType.NOT_EQUAL, Precedence.RELATION);
    this.registerInfixLeftGeneric(TokenType.GREATER, Precedence.RELATION);
    this.registerInfixLeftGeneric(TokenType.LESS, Precedence.RELATION);
    this.registerInfixLeftGeneric(TokenType.GREATER_OR_EQUAL, Precedence.RELATION);
    this.registerInfixLeftGeneric(TokenType.LESS_OR_EQUAL, Precedence.RELATION);

    // logical
    this.registerInfixLeftGeneric(TokenType.LOGICAL_AND, Precedence.LOGICAL_AND);
    this.registerInfixLeftGeneric(TokenType.LOGICAL_OR, Precedence.LOGICAL_OR);

    // right associativity
    this.registerInfixRightGeneric(TokenType.CARET, Precedence.EXPONENT);

    // statements
    this.registerStatement(Keyword.IF, new IfStatement());
    this.registerStatement(Keyword.VAR, new DeclarationStatement());
    this.registerStatement(Keyword.LET, new DeclarationStatement());
    this.registerStatement(TokenType.LEFT_CURLY, new LeftCurlyStatement());
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
