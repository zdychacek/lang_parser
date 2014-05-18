import {
  Keyword,
  Punctuator
} from './Lexer';
import {
  Scope,
  ScopeType
} from './Scope';

/**
 * Validates AST.
 */
export default class ValidationVisitor {
  constructor (globals) {
    this._globals = globals;
  }

  visitProgram () {

  }
}
