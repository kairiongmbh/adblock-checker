# Adblock-checker

### The module to check domains for being in block lists

### How to use:
1. Add global variables:
    * TATLER_NAME - tatler pipeline name 
    * TATLER_SECRET - pipeline secret
2. Add some additional sources for the rule lists into rule_sources.txt file.
3. Build image and run container.
4. See logs and when you see message "Ready to read from stdin!" app is ready to accept url's via stdin.

Very basic work schema is like:

**Send url (e.g. http://google.com/) via stdin >>> processing >>> send all matches and errors to tatler if it was initialized >>> receive response via stdout**
