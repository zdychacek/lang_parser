import Statement from './Statement';

class VariableDeclarator extends Statement {
  constructor (id, init) {
    super('VariableDeclarator');

    this.id = id;
    this.init = init;
  }

  get name () {
    return this.id.name;
  }

  eval (context) {

  }
}

export default class DeclarationStatement extends Statement {
  constructor (declarations = [], kind) {
    super('VariableDeclaration');

    this.declarations = declarations;
    this.kind = kind;
  }

  addDeclarator (id, init) {
    this.declarations.push(new VariableDeclarator(id, init));
  }

  get names () {
    return this.declarations.map((decl) => decl.name);
  }

  eval (context) {

  }
}
