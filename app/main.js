import { Lexer } from './Lexer';
import MyParser from './MyParser';
import Transpiler from './Transpiler';

// import some code for textarea
import defaultCode from './code';

var sourceInput = document.getElementById('source');
var tokensArea = document.getElementById('tokens-area');
var astArea = document.getElementById('ast-area');
var outputArea = document.getElementById('output-area');
var btnEval = document.getElementById('eval-code');
var $tabs = $('#tabs');

var warns = document.getElementById('warns');
var errors = document.getElementById('errors');

var LOCAL_STORAGE_KEY_CODE = 'lang_parser_code';
var LOCAL_STORAGE_KEY_SEL_TAB = 'lang_parser_sel_tab';

var lexer = new Lexer();
var parser = new MyParser(lexer);
var transpiler = new Transpiler();

function loadCode () {
  var fromStorage = localStorage.getItem(LOCAL_STORAGE_KEY_CODE);

  if (fromStorage) {
    sourceInput.value = fromStorage;
  }
  else {
    sourceInput.value = defaultCode;
  }
}

function loadSelectedTab () {
  var tab = localStorage.getItem(LOCAL_STORAGE_KEY_SEL_TAB);

  if (!tab) {
    tab = '#ast';
  }

  $tabs.find('a[href="' + tab + '"]').tab('show');
}

function process () {
  var tokens;
  var ast;
  var output;

  lexer.source = sourceInput.value;
  oldSource = sourceInput.value;

  // hide errors and warnings
  showWarnings(null);
  showErrors(null);

  // tokenize
  try {
    tokens = lexer.dump();
    $(tokensArea).JSONView(tokens);
  }
  catch (ex) {
    showErrors(ex.message);

    tokensArea.innerHTML = '';
    astArea.innerHTML = '';
    outputArea.innerHTML = '';
    console.log(ex);
    return;
  }

  // parsing
  try {
    ast = parser.parseProgram(true);
    $(astArea).JSONView(JSON.stringify(ast));

    showWarnings(parser.warnings);
    showErrors(parser.errors);
  }
  catch (ex) {
    showErrors(ex.message);

    astArea.innerHTML = '';
    outputArea.innerHTML = '';
    console.log(ex);
    return;
  }

  // transpiling
  try {
    output = transpiler.visitProgram(ast);
    outputArea.innerHTML = output;
  }
  catch (ex) {
    showErrors(ex.message);

    outputArea.innerHTML = '';
    console.log(ex);
  }
}

function showErrors (errs) {
  errors.style.display = 'none';

  if (errs && !Array.isArray(errs)) {
    errs = [ errs ];
  }

  if (errs && errs.length) {
    errors.style.display = 'block';
    errors.innerHTML = errs.join('</br>');
  }
}

function showWarnings (warnings) {
  warns.style.display = 'none';

  if (warnings && warnings.length) {
    warns.style.display = 'block';
    warns.innerHTML = warnings.join('</br>');
  }
}

var oldSource = '';

// set editor data
loadCode();

(function update () {
  var code = sourceInput.value;

  if (oldSource != code) {
    process();

    localStorage.setItem(LOCAL_STORAGE_KEY_CODE, code);
  }
  setTimeout(update, 150);
})();

$(function () {
  loadSelectedTab();

  $tabs.on('click', 'a', function (e) {
    localStorage.setItem(LOCAL_STORAGE_KEY_SEL_TAB, e.target.getAttribute('href'));
  })
});

btnEval.addEventListener('click', () => {
  // eval code in global scope
  eval.call(null, outputArea.innerHTML);
});
