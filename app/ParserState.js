export default class ParserState {
  constructor () {
    // inFunction - if we are currently parsing function body
    // inLoop - if we are currently parsing switch case statements
    // inSwitchCaseBody - if we are currently parsing switch case statements
    // allowIn -
    this._defaults = {
      inFunction: false,
      inLoop: false,
      allowIn: true
    };

    this._stacks = {};
  }

  pushAttribute (attribute, value) {
    if (!this._stacks[attribute]) {
      this._stacks[attribute] = [];
    }

    this._stacks[attribute].push(value);
  }

  popAttribute (attribute) {
    var attrStack = this._stacks[attribute];

    if (!attrStack || !attrStack.length) {
      throw new Error('Cannot pop state attribute.');;
    }

    return this._stacks[attribute].pop();
  }

  getAttribute (attribute) {
    var attrStack = this._stacks[attribute];

    if (attrStack) {
      let lastValue = attrStack[attrStack.length - 1];

      return lastValue !== undefined? lastValue : this._defaults[attribute];
    }

    return this._defaults[attribute];
  }
}
