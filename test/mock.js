class Response {
  constructor() {
    this.code = null;
    this._listeners = [];
  }

  on(callback) {
    this._listeners.push(callback.bind(this));
  }

  _emit(res) {
    this._listeners.forEach(listener => {
      listener(res);
    });
  }

  // Mock
  status(code) {
    this.code = code;
    return this;
  }

  send(res) {
    this._emit(res);
  }

  json(res) {
    this._emit(res);
  }
}

function createRequest(req = {}) {
  return Object.assign({
    body: {},
    params: {},
    query: {},
  }, req);
}

function createResponse() {
  return new Response();
}

module.exports = {
  createRequest,
  createResponse,
};
