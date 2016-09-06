var ApkReader = require('./lib/ApkReader');
var IpaReader = require('./lib/IpaReader');
var PatchReader = require('./lib/PatchReader');

function PkgReader(path, extension, options) {
  switch(extension) {
    case 'ipa':
      return new IpaReader(path, options);
    case 'apk':
      return new ApkReader(path, options);
    case 'patch':
      return new PatchReader(path, options);
  }
}

module.exports = PkgReader;
