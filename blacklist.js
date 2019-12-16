module.exports.rules = {
  'https://raw.githubusercontent.com/mkb2091/blockconvert/master/output/adblock.txt': [
    '||www.de^'
  ],
  'https://raw.githubusercontent.com/Hubird-au/Adversity/master/Adversity.txt': [
    '//tracking.$third-party'
  ],
  'https://ideone.com/plain/K452p': [
    '/tracking/*$third-party [+] //tracking.$third-party'
  ],
  'https://raw.githubusercontent.com/k2jp/abp-japanese-filters/master/abpjf_paranoid.txt': [
    '^tracking.$domain=~tracking.post.japanpost.jp'
  ]
};

module.exports.sources = [
  'https://raw.githubusercontent.com/DandelionSprout/adfilt/master/AncientLibrary/ABP%20Macedonian%20List.txt',
  'https://raw.githubusercontent.com/DandelionSprout/adfilt/master/AncientLibrary/TamilFriends%20List.txt',
  'https://raw.githubusercontent.com/Cybo1927/Hosts/master/Hosts'
];
