import Statement from './Statement';
import { Keyword } from '../Lexer';

export class Declarator extends Statement {
  constructor (id, init) {
    super('Declarator');

    // IdentifierExpression
    this.id = id;
    this.init = init;
  }

  get name () {
    return this.id.name;
  }
}

export class DeclarationStatement extends Statement {
  constructor (kind, declarations = []) {
    super('DeclarationStatement');

    this.declarations = declarations;
    this.kind = kind;
  }

  addDeclarator (idOrDeclarator, init) {
    if (idOrDeclarator instanceof Declarator) {
      this.declarations.push(idOrDeclarator);
    }
    else {
      this.declarations.push(new Declarator(idOrDeclarator, init));
    }
  }

  get names () {
    return this.declarations.map((decl) => decl.name);
  }

  expandToSeparateDeclarations () {
    return this.declarations.map((declarator) => new DeclarationStatement(this.kind, [ declarator ]));
  }

  *[Symbol.iterator]() {
    for (var declarator of this.declarations) {
      yield declarator;
    }
  }

  /**
   * Merge more DeclarationStatements into one.
   */
  static merge (...declarations) {
    var mergeDeclaration = new this(Keyword.Var);
    var nameMap = Object.create(null);

    for (var declaration of declarations) {
      for (var declarator of declaration.declarations) {
        if (!(declarator.id.name in nameMap)) {
          mergeDeclaration.addDeclarator(declarator);

          nameMap[declarator.id.name] = true;
        }
      }
    }

    return mergeDeclaration;
  }
}
