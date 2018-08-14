
class Mover extends EventHandler {

  constructor() {
    super();
  }

  destroy() {
    this._trigger('destroy');
  };

};
