const got = require('got');
const Tatler = require('tatler-client');
const AdBlockClient = require('adblock-rs');
const Promise = require('bluebird');

const {
  tatlerName,
  tatlerSecret,
  sources,
  domainsToCheck
} = checkVars(process.env);

const tatler = Tatler({
  [tatlerName]: tatlerSecret
}, tatlerName);

// TODO: uncomment after new release
// let resources = AdBlockClient.uBlockResources('uBlockOrigin/src/web_accessible_resources', 'uBlockOrigin/src/js/redirect-engine.js', 'uBlockOrigin/assets/resources/scriptlets.js');
const placeToCheck = 'https://google.com'; // need a website example to make a check
(async () => {
  await Promise.map(sources.split('::'), async (source) => {
    console.log(`Start ${source} processing`);
    let ruleList;
    try {
      ruleList = (await got(source)).body;
      if (!ruleList) {
        return tatler(`Empty rule list. Source: ${source}`);
      }
    } catch (e) {
      return tatler(`Error during rule list getting: ${JSON.stringify(e)}. Source: ${source}`);
    }
    console.log(`${source} was downloaded!`);

    const client = new AdBlockClient.Engine(ruleList.split('\n'), true);
    const checkResults = domainsToCheck
      .split('::')
      .map((domain) => client.check(`https://${domain}/`, placeToCheck, 'host', true));

    const checkErrors = checkResults
      .filter(({ error }) => error);
    if (checkErrors.length) {
      await tatler(`Error occures during the check: ${JSON.stringify(checkErrors)}. Source: ${source}`);
    }

    const checkMatches = checkResults
      .filter(({ matched }) => matched);
    console.log(`${source} check matches: `);
    console.dir(checkMatches);
    if (checkMatches.length) {
      await tatler(`Found a record in adblock rule list! Source: ${source}, results: ${JSON.stringify(checkMatches)}`);
    }
  });
})();

function checkVars () {
  const {
    TATLER_NAME: tatlerName,
    TATLER_SECRET: tatlerSecret,
    SOURCES: sources,
    DOMAINS_TO_CHECK: domainsToCheck
  } = process.env;

  console.log(tatlerSecret);

  if (!tatlerName) {
    throw new Error('Has no tatler pipeline name!');
  }
  if (!tatlerSecret) {
    throw new Error('Has no tatler secret!');
  }
  if (!sources) {
    throw new Error('Has no sources to download!');
  }
  if (!domainsToCheck) {
    throw new Error('Has no domains to check!');
  }

  return {
    tatlerName,
    tatlerSecret,
    sources,
    domainsToCheck
  };
}
