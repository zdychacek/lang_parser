import Parser from './Parser';
import Precedence from './Precedence';
import { TokenType, Keyword } from './Lexer';

///// Operators
import IdentifierParselet from './parselets/IdentifierParselet';
import NumberParselet from './parselets/NumberParselet';
import StringParselet from './parselets/StringParselet';
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

export default class MyParser extends Parser {
  constructor (lexer) {
    super(lexer);

    this.register(TokenType.IDENTIFIER, new IdentifierParselet());
    this.register(TokenType.NUMBER,     new NumberParselet());
    this.register(TokenType.STRING,     new StringParselet());
    this.register(TokenType.ASSIGN,     new AssignmentParselet());
    this.register(TokenType.QUESTION,   new ConditionalParselet());
    this.register(TokenType.LEFT_PAREN, new GroupParselet());
    this.register(TokenType.LEFT_PAREN, new CallParselet());

    this.prefix(TokenType.PLUS,         Precedence.PREFIX);
    this.prefix(TokenType.MINUS,        Precedence.PREFIX);
    this.prefix(TokenType.TILDE,        Precedence.PREFIX);
    this.prefix(TokenType.BANG,         Precedence.PREFIX);

    this.postfix(TokenType.BANG,        Precedence.POSTFIX);

    this.infixLeft(TokenType.PLUS,      Precedence.SUM);
    this.infixLeft(TokenType.MINUS,     Precedence.SUM);
    this.infixLeft(TokenType.ASTERISK,  Precedence.PRODUCT);
    this.infixLeft(TokenType.SLASH,     Precedence.PRODUCT);
    this.infixRight(TokenType.CARET,    Precedence.EXPONENT);

    // statements
    this.registerStatement(Keyword.IF, new IfStatement());
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

  stmt (token, statementParselet) {
    this.registerStatement(token, statementParselet);
  }
}
