JavaScript like language parser
=====================
Builds AST tree from JavaScript code in same format like esprima produces.

Features
-----------------------
- all variables must be declared with ```var``` or ```let``` keyword
- every statement (except block statements) or expression statement must end with semicolon
- supports variable redefinition but not in same scope
- supports block (```let```) declarations
- array expressions cannot contain trailing comma, detto object expressions
- object expressions cannot contain duplicate property names
- duplicate label names are not supported

TODO
-----------------------
- variables hoisting (hoist ```var``` declarations to nearest function scope)
- automatic semicolon insertion
- support for octal and hexadecimal numbers
- reqular expressions support
- ```try/catch``` statement support
- ```with``` support
- ```void``` support (??)
- ...
