import { Lexer } from './Lexer';
import MyParser from './MyParser';

var sourceInput = document.getElementById('source');
var btnDo = document.getElementById('do');
var preTokens = document.getElementById('tokens');
var preAST = document.getElementById('ast');

function _do () {
  var lexer = new Lexer(sourceInput.value);
  //console.log(lexer.dump());return;

  var parser = new MyParser(lexer);

  //ast = parser.parseExpression();
  ast = parser.parseStatements();
  preAST.innerHTML = JSON.stringify(ast, null, 3);
}

btnDo.addEventListener('click', _do, false);
