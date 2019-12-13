const Tatler = require('tatler-client');

const {
  TATLER_NAME: tatlerName,
  TATLER_SECRET: tatlerSecret
} = process.env;

let tatler = () => {};
if (tatlerName && tatlerSecret) {
  tatler = Tatler({
    [tatlerName]: tatlerSecret
  }, tatlerName);
} else {
  console.log('You didn\'t pass tatler credentials. Tatler is switched off');
}

module.exports = tatler;
