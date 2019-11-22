const got = require('got');
const Tatler = require('tatler-client');
const AdBlockClient = require('adblock-rs');
const fs = require('fs');
const path = require('path');
const { StringStream } = require('scramjet');

const ruleFileName = './rule_sources.txt';
const {
  TATLER_NAME: tatlerName,
  TATLER_SECRET: tatlerSecret
} = process.env;

let tatler = () => {};
if (tatlerName && tatlerSecret) {
  console.log('Tatler is switched off');
  tatler = Tatler({
    [tatlerName]: tatlerSecret
  }, tatlerName);
}

// TODO: uncomment after new release
// let resources = AdBlockClient.uBlockResources('uBlockOrigin/src/web_accessible_resources', 'uBlockOrigin/src/js/redirect-engine.js', 'uBlockOrigin/assets/resources/scriptlets.js');
const placeToCheck = 'https://google.com'; // need a website example to make a check
(async () => {
  const ruleSources = await getRuleSources();
  console.log('Ready to read from stdin!');
  StringStream.from(process.stdin)
    .setOptions({maxParallel: 4})
    .lines()
    .map(async (url) => {
      let res = '';
      for (let sourceName in ruleSources) {
        const client = new AdBlockClient.Engine(ruleSources[sourceName].split('\n'), true);

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
        } else {
          res += `${url} wasn't found in ${sourceName} \n`;
        }
      }
      return res;
    })
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
        acc[source] = body;
        console.log(`Source ${source} was successfully parsed!`);
      } catch (e) {
        await tatler(`There was an error during source parsing! Source: ${source}, error: ${JSON.stringify(e)}`);
      }
    }, {});
}
