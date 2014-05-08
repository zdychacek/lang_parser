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
`var a = 5 +9;

test:
  a + 1;

while (a + 1 > 2) {
  continue test;
}
`;
/*`var person = {
  name: 'Ondrej',
  age: 26,
  data: {
    a: 1,
    b: 2
  }
};

var fn = function (a,b,c) {
  let a = 'ahoj';

  b += 14 + 28 * 3;

  var a = 1 + 2, b = 3;

  let c = 'ahoj';

  if (a == 28) {
    a = 14;

    b += a;
  }
  else f(a >= 5 && b < 12);

  return b || a && 28;
};`*/

function _do () {
  lexer.source = sourceInput.value;

  try {
    ast = parser.parseProgram();
    $(preAST).JSONView(JSON.stringify(ast));

    // TODO:
    let retVal = interpreter.interpretProgram(ast);
  }
  catch (ex) {
    preAST.innerHTML = ex.message;
    console.log(ex);
  }
}

sourceInput.addEventListener('keyup', _do, false);

_do();
