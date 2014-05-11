import { Lexer } from './Lexer';
import MyParser from './MyParser';
import Interpreter from './Interpreter';

var sourceInput = document.getElementById('source');
var btnDo = document.getElementById('do');
var preTokens = document.getElementById('tokens');
var preAST = document.getElementById('ast');

var lexer = new Lexer();
var parser = new MyParser(lexer);
var interpreter = new Interpreter();

sourceInput.value =
`try {
}
catch (es) {
}
finally {
}`;

var oldSource = '';

function _do () {
  lexer.source = sourceInput.value;
  oldSource = sourceInput.value;

  try {
    //console.log(lexer.dump());return;

    ast = parser.parseProgram();
    $(preAST).JSONView(JSON.stringify(ast));

    //let retVal = interpreter.interpretProgram(ast);
  }
  catch (ex) {
    preAST.innerHTML = ex.message;
    console.log(ex);
  }
}

function _t () {
  if (oldSource != sourceInput.value) {
    _do();
  }
  setTimeout(_t, 150);
}

_t();
