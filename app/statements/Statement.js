export default class Statement {
    constructor (type) {
      this.type = type;
    }
    
    eval (context) {
      throw new Error('Not implemented.');
    }
}
