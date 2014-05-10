JavaScript like language parser
=====================
- every statement (except block statements) or expression statement must end with semicolon
- array expressions cannot contain trailing comma, detto object expressions
- object expressions cannot contain duplicate property names
- support for block (```let```) declarations

TODO
-----------------------
- variables hoisting
- line and column counters
- detect line terminators
- automatic semicolon insertion

Missing statements
-----------------------
- Try/catch statement
- Debugger statement
- Void
- With

NOTES
-----------------------
- functionDeclarationStmt.defineIn(parser.scope);
