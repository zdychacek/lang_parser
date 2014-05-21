JavaScript language parser
=====================
Builds AST tree from JavaScript code in same format like esprima produces. Transpiles that code back to JavaScript. Supports some ES6 features.

Features
-----------------------
- all variables should be declared with ```var``` or ```let``` keyword
- supports block (```let```) declarations
- supports function parameters default values
- supports shorthand for methods/members definition in object expressions
- array expressions cannot contain trailing comma, detto object expressions
- object expressions cannot contain duplicate property names
- duplicate label names are not supported
- supports binary number notation (```var num = 0b101;```)

TODO
-----------------------
- reqular expressions support
- include comments into AST tree
- add bitwise operators support (a & b)
- add support for ES5 getters and setters
