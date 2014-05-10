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

TODO
-----------------------
- variables hoisting (hoist ```var``` declarations to nearest function scope)
- line and column counters (for better error reporting)
- detect line terminators (some statements, eg. ```throw``` or ```return```, must not trail with new line terminator)
- automatic semicolon insertion
- support for octal and hexadecimal numbers
- Try/catch statement support
- Debugger statement support
- Void support (??)
- With support (??)
