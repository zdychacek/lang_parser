import Parser from './Parser';
import Precedence from './Precedence';
import { TokenType } from './Lexer';
import IdentifierParselet from './parselets/IdentifierParselet';
import NumberParselet from './parselets/NumberParselet';
import AssignParselet from './parselets/AssignParselet';
import ConditionalParselet from './parselets/ConditionalParselet';
import GroupParselet from './parselets/GroupParselet';
import CallParselet from './parselets/CallParselet';
import PrefixOperatorParselet from './parselets/PrefixOperatorParselet';
import PostfixOperatorParselet from './parselets/PostfixOperatorParselet';
import BinaryOperatorParselet from './parselets/BinaryOperatorParselet';

export class MyParser extends Parser {
  constructor (lexer) {
    super(lexer);

    this.register(TokenType.IDENTIFIER, new IdentifierParselet());
    this.register(TokenType.NUMBER,     new NumberParselet());
    this.register(TokenType.ASSIGN,     new AssignParselet());
    this.register(TokenType.QUESTION,   new ConditionalParselet());
    this.register(TokenType.LEFT_PAREN, new GroupParselet());
    this.register(TokenType.LEFT_PAREN, new CallParselet());

    // Register the simple operator parselets.
    this.prefix(TokenType.PLUS,      Precedence.PREFIX);
    this.prefix(TokenType.MINUS,     Precedence.PREFIX);
    this.prefix(TokenType.TILDE,     Precedence.PREFIX);
    this.prefix(TokenType.BANG,      Precedence.PREFIX);

    // For kicks, we'll make "!" both prefix and postfix, kind of like ++.
    this.postfix(TokenType.BANG,     Precedence.POSTFIX);

    this.infixLeft(TokenType.PLUS,     Precedence.SUM);
    this.infixLeft(TokenType.MINUS,    Precedence.SUM);
    this.infixLeft(TokenType.ASTERISK, Precedence.PRODUCT);
    this.infixLeft(TokenType.SLASH,    Precedence.PRODUCT);
    this.infixRight(TokenType.CARET,   Precedence.EXPONENT);
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
