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
`var a,b,j,c;

if (true) let x = 2;

{
  a = 1;
  let q = 2;
}
a;

var obj;

for (var prop in obj) {
console.log(obj[prop]);
}

prop;

var fun = function f () {
  f();
};

switch (a + b) {
  case 1:
    a++;
    break;
  case 2:
    a--;
    {
      a = a*b;
    }
    break;
  default:
    ;
}

var arr = [1, 2, 3, 4, 5];

for (let i = 0, l = arr.length; i < l; i++, --j) {
  this[i] = a + 6;
};

var person = {
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

  var ab = 1 + 2, b = 3;

  while(true) {
    break;
  }

  let c = 'ahoj';

  if (a == 28) {
    a = 14;

    b += a;
  }
  else fn(a >= 5 && b < 12);

  return b || a && 28;
};`

function _do () {
  lexer.source = sourceInput.value;
  //console.log(lexer.dump());return;

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
