import { Lexer } from './Lexer';
import MyParser from './MyParser';
import Transformer from './Transformer';

var sourceInput = document.getElementById('source');
var btnDo = document.getElementById('do');
var preTokens = document.getElementById('tokens');
var preAST = document.getElementById('ast');
var preOutput = document.getElementById('output');

var lexer = new Lexer();
var parser = new MyParser(lexer);
var transformer = new Transformer();

sourceInput.value =
`let a, b=a+5*9;

// function defaults parameters
function fn(bb=b+1,b='ahoj') {
  let c = 28,d;

  // binary numbers
  c+=0b11101;

  return a+1-2.e-10*0xabcd;
}
fn(b, null);`;

var oldSource = '';

function _do () {
  lexer.source = sourceInput.value;
  oldSource = sourceInput.value;

  try {
    let ast = parser.parseProgram();
    $(preAST).JSONView(JSON.stringify(ast));
    preOutput.innerHTML = transformer.visitProgram(ast);
  }
  catch (ex) {
    preAST.innerHTML = ex.message;
    preOutput.innerHTML = '';
    console.log(ex);
  }
}

(function _t () {
  if (oldSource != sourceInput.value) {
    _do();
  }
  setTimeout(_t, 150);
})();
