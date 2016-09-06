var inherits = require('inherits');
var Reader = require('./Reader');
var utils = require('./utils');
var jar = require('./jar');
var path = require('path');

var YAPATCH_MF = /^yapatch\.mf$/i;
var META_INF_YAPATCH_MF = /meta-inf\/.*\.mf$/i;
var ANDROIDD_SF = /meta-inf\/.*\.sf$/i;
var ANDROIDD_RSA = /meta-inf\/.*\.*$/i;
var JS = /.*\.js$/i;

var options = {
  createdTime: /Created-Time: (.*)/,
  createdBy: /Created-By: (.*)/,
  yaPatchType: /YaPatchType: (.*)/,
  versionName: /VersionName: (.*)/,
  versionCode: /VersionCode: (.*)/,
  from: /From: (.*)/,
  to: /To: (.*)/
}

var DEFAULT_OPTIONS = {
  withIcon: false,
  iconType: 'base64'
};

function PatchReader(path, options) {
  if (!(this instanceof PatchReader)) return new PatchReader(path, options);
  Reader.call(this, path);
  this.options = utils.extend({}, DEFAULT_OPTIONS, (options || {}));
}

inherits(PatchReader, Reader);

PatchReader.prototype.parse = function(callback, fileInfo) {
  var that = this;

  var whatYouNeed = [YAPATCH_MF, META_INF_YAPATCH_MF, ANDROIDD_SF, ANDROIDD_RSA,JS];

  this.getEntries(whatYouNeed, function(error, buffers, entryCount) {
    if(error) {
      return callback(error);
    }
    console.log('entryCount ==> ', entryCount)
    console.log('all ==> ', buffers[JS])

    //判断是否存在js文件，有且只有一个js文件才是正常的包
    if(buffers[JS]) {
      //callback(err, info)
      if(entryCount == 1) {
        return callback(null, {'ios_patch': 'ok'})
      } else if(entryCount > 1) {
        return callback(new Error('Parse patch file failed, zipfile contains more than one js! It suppose to be just one js file!'))
      }
    }
    var patch = buffers[YAPATCH_MF] || buffers[META_INF_YAPATCH_MF]
    if(!patch) {
      return callback(new Error('Parse patch file failed, can not find yapatch.mf!'))
    }

    var patchMsg = {},
      patchStr = patch.toString(),
      rsa = null;
    for(var i in options) {
      patchMsg[i] = patchStr.match(options[i])[1]
    }
    

    if(buffers[ANDROIDD_RSA]) {
      rsa = buffers[ANDROIDD_RSA];
    }
    // console.log('fileinfo ==> ', fileInfo)
    var tempFile = fileInfo.fileId + '.txt'
    
    return new Promise(function(resolve, reject) {
      if(!rsa) {
        reject(new Error('没有找到签名信息！'))
      }
      resolve(jar.write(tempFile, rsa, jar.keytool, callback, patchMsg))
    })
    
  });
};

module.exports = PatchReader;