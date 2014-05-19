import Statement from './Statement';

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

  addDeclarator (id, init) {
    this.declarations.push(new Declarator(id, init));
  }

  get names () {
    return this.declarations.map((decl) => decl.name);
  }

  expandToSeparateDeclarations () {
    return this.declarations.map((declarator) => new DeclarationStatement(this.kind, [ declarator ]));
  }
}
