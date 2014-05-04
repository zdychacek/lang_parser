import PrefixExpression from './PrefixExpression';
import { TokenType, Keyword } from '../Lexer';

class FunctionExpression extends PrefixExpression {
  parse (parser, token) {
    var id = null, params = [], body;

    console.log('FunctionExpression');

    // nemusi obsahovat id
    return {
      type: 'FunctionExpression',
      id,
      params,
      body
    };
  }
}

export default FunctionExpression;
