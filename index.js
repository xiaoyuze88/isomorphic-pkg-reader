var ApkReader = require('./lib/ApkReader');
var IpaReader = require('./lib/IpaReader');
var Reader = require('./lib/Reader');

function PkgReader(path, extension, options) {
  return new (extension === 'ipa' ? IpaReader : ApkReader)(path, options);
}

module.exports = PkgReader;
module.exports.Reader = Reader;