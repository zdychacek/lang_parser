import Statement from './Statement';

class VariableDeclarator extends Statement {
  constructor (id, init) {
    super('VariableDeclarator');

    this.id = id;
    this.init = init;
  }

  eval (context) {

  }
}

export default class DeclarationStatement extends Statement {
  constructor (declarations = [], kind = 'var') {
    super('VariableDeclaration');

    this.declarations = declarations;
    this.kind = kind;
  }

  addDeclarator (id, init) {
    this.declarations.push(new VariableDeclarator(id, init));
  }

  eval (context) {

  }
}
