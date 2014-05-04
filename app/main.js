import { Lexer } from './Lexer';
import MyParser from './MyParser';

var sourceInput = document.getElementById('source');
var btnDo = document.getElementById('do');
var preTokens = document.getElementById('tokens');
var preAST = document.getElementById('ast');

var lexer = new Lexer();
var parser = new MyParser(lexer);

function _do () {
  lexer.source = sourceInput.value;
  //console.log(lexer.dump());return;

  ast = parser.parseProgram();
  preAST.innerHTML = JSON.stringify(ast, null, 3);
}

btnDo.addEventListener('click', _do, false);

_do();
