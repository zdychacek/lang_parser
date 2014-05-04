import { Lexer } from './Lexer';
import MyParser from './MyParser';

var sourceInput = document.getElementById('source');
var btnDo = document.getElementById('do');
var preTokens = document.getElementById('tokens');
var preAST = document.getElementById('ast');

var lexer = new Lexer();
var parser = new MyParser(lexer);

sourceInput.value =

`var fn = function (a,b,c) {
  a = '';
};`;

function _do () {
  lexer.source = sourceInput.value;

  try {
    ast = parser.parseProgram();
    preAST.innerHTML = JSON.stringify(ast, null, 3);
  }
  catch (ex) {
    preAST.innerHTML = ex.message;
    console.log(ex);
  }
}

sourceInput.addEventListener('keyup', _do, false);

_do();
