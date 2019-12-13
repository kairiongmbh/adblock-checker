const got = require('got');
const Tatler = require('tatler-client');
const AdBlockClient = require('adblock-rs');
const fs = require('fs');
const path = require('path');
const { StringStream } = require('scramjet');
const ruleBlackList = require('./rule_blacklist');

const ruleFileName = './rule_sources.txt';
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

// TODO: uncomment after new release
// let resources = AdBlockClient.uBlockResources('uBlockOrigin/src/web_accessible_resources', 'uBlockOrigin/src/js/redirect-engine.js', 'uBlockOrigin/assets/resources/scriptlets.js');
const placeToCheck = 'https://google.com'; // need a website example to make a check
(async () => {
  const ruleSources = await getRuleSources();
  console.log('Ready to read from stdin!');
  const stream = StringStream.from(process.stdin)
    .setOptions({maxParallel: 10})
    .lines()
    .parse((url) => ({ url }))
    .map(async ({ url }) => {
      if (!url) {
        return;
      }

      let res = '';
      for (let sourceName in ruleSources) {
        let client;
        try {
          client = new AdBlockClient.Engine(ruleSources[sourceName].split('\n'), true);
        } catch (e) {
          console.log(`${sourceName} is not valid. Error during parsing: ${e}`);
          continue;
        }

        const {
          matched,
          filter,
          error
        } = client.check(url, placeToCheck, 'host', true);

        if (error) {
          const errorText = `Error ${error} for url ${url} while checking ${sourceName}`;
          res += errorText + '\n';
          await tatler(errorText);
        } else if (matched) {
          const matchedText = `Url ${url} was matched in the list: ${sourceName} by the rule: ${filter}}`;
          res += matchedText + '\n';
          await tatler(matchedText);
        } else if (forceGrepInList(url, ruleSources[sourceName])) {
          const matchedText = `Url ${url} was matched in the list: ${sourceName} by force grep`;
          res += matchedText + '\n';
          await tatler(matchedText);
        } else {
          res += `${url} wasn't found in ${sourceName} \n`;
        }
      }
      return res;
    });

  stream
    .whenEnd().then(() => process.exit());
  stream
    .pipe(process.stdout);
})();

async function getRuleSources () {
  const pathToTheRuleFile = path.join(__dirname, ruleFileName);
  return StringStream
    .from(fs.createReadStream(pathToTheRuleFile))
    .setOptions({maxParallel: 4})
    .lines()
    .parse((source) => ({ source }))
    .accumulate(async (acc, { source }) => {
      console.log(`Started ${source} parsing`);
      try {
        const { body } = await got(source);
        acc[source] = applyRuleBlacklist(source, body);
        console.log(`Source ${source} was successfully parsed!`);
      } catch (e) {
        // await tatler(`There was an error during source parsing! Source: ${source}, error: ${e}`);
      }
    }, {});
}

function applyRuleBlacklist (source, body) {
  const blackRules = ruleBlackList[source];
  if (!blackRules) {
    return body;
  }
  return body.split('\n').filter((line) => !blackRules.include(line)).join('\n');
}

function forceGrepInList (url, list) {
  let u;
  try {
    u = new URL(url);
  } catch (e) {
    console.error(`Url ${url} seems to not be an url. Could you check it, please?`);
    return false;
  }

  return (new RegExp(`\\W${u.hostname}\\W`, 'gim')).test(list);
}
