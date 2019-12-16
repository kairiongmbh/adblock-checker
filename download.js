const fs = require('fs');
const path = require('path');

const got = require('got');
const tatler = require(path.join(__dirname, 'lib/tatler.js'));

const { sources: blackList } = require('./blacklist');
const LISTS_SOURCE = 'http://filterlists.com/api/v1/lists';

(async () => {
  const { body: rawUrlData } = await got(LISTS_SOURCE, {json: true});
  const urls = rawUrlData
    .filter(({ syntaxId, viewUrl }) => {
      return syntaxId === 3 && !blackList.includes(viewUrl);
    })
    .map(({ viewUrl }) => viewUrl);

  if (!urls || urls.length < 100) {
    await tatler(`Something wrong with the source of our rule lists: ${LISTS_SOURCE}. Please, check it!`);
  }
  fs.writeFileSync(path.join(__dirname, './rule_sources.txt'), urls.join('\n'));
})();
