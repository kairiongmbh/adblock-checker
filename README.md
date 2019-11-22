# Adblock-checker

### The module to check domains for being in block lists

### How to use:
1. Add global variables:
    * TATLER_NAME - tatler pipeline name 
    * TATLER_SECRET - pipeline secret
    * SOURCES - list of filter sources with '::' delimeter (e.g. 'SOURCES=https://easylist-downloads.adblockplus.org/easylistgermany+easylist.txt::https://raw.githubusercontent.com/betterwebleon/international-list/master/filters.txt')
    * DOMAINS_TO_CHECK - list of domains to check with '::' delimeter (e.g. 'DOMAINS_TO_CHECK=example.com::another-example.com')
2. Run the script:
    ```javascript
        npm start
    ```

All needed results/errors will be send to the tatlerbot.