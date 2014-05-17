JavaScript like language parser
=====================
Builds AST tree from JavaScript code in same format like esprima produces. Transpiles that code back to JavaScript.

Features
-----------------------
- all variables should be declared with ```var``` or ```let``` keyword
- supports block (```let```) declarations
- supports function parameters default values
- array expressions cannot contain trailing comma, detto object expressions
- object expressions cannot contain duplicate property names
- duplicate label names are not supported
- supports binary number notation

TODO
-----------------------
- variables hoisting (hoist ```var``` declarations to nearest function scope)
- reqular expressions support
- ```with``` support
- include comments into AST tree
- proper indentation in compiled source code
- add bitwise operators support (a & b)
