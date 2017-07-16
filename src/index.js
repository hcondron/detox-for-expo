const Detox = require('./Detox');

let detox;

async function init(config) {
  detox = new Detox(config);
  await detox.init();
}

async function cleanup() {
  if (detox) {
    await detox.cleanup();
  }
}

async function beforeEach() {
  if (detox) {
    await detox.beforeEach.apply(this, arguments);
  }
}

async function afterEach() {
  if (detox) {
    await detox.afterEach.apply(this, arguments);
  }
}

//process.on('uncaughtException', (err) => {
//  //client.close();
//
//  throw err;
//});
//
//process.on('unhandledRejection', (reason, p) => {
//  throw reason;
//});

module.exports = {
  init,
  cleanup,
  beforeEach,
  afterEach
};
