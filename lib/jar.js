var fs = require('fs');
var spawn = require("child_process").spawn;
var KEYTOOL_COMMAND = "keytool";

//提取jar包签名信息
var OWNER = /OWNER: (.*)\n/,
  OWNER_CN = /\u6240\u6709\u8005: (.*)\n/,
  SERIAL_NUMBER = /Serial number: ([\da-zA-Z]+)\n/,
  SERIAL_NUMBER_CN = /\u5E8F\u5217\u53F7: ([\da-zA-Z]+)\n/,
  VALID_FROM = /Valid from: (.*) util:/,
  VALID_FROM_CN = /\u6709\u6548\u671F\u5F00\u59CB\u65E5\u671F: (.*)(,\s)\u622A\u6B62\u65E5\u671F/,
  UNTIL = /util: (.*)\n/,
  UNTIL_CN = /\u622A\u6B62\u65E5\u671F: (.*)\n/,
  MD5 = /MD5: ([\dA-Z:]+)\n/,
  SHA1 = /SHA1: ([\dA-Z:]+)\n/;

var whatIWant = {
  owner : [OWNER, OWNER_CN],
  serialNumber : [SERIAL_NUMBER, SERIAL_NUMBER_CN],
  validFrom : [VALID_FROM, VALID_FROM_CN],
  until : [UNTIL, UNTIL_CN],
  md5: [MD5],
  sha1: [SHA1]
}


/**
 * 调用Java提供的keytool工具，执行命令keytool -printcert -file xxx 得到未加密的签名信息
 */
function keytool(file, cb2, patchMsg) {
  var ktArgs = ["-printcert", "-file", file];
  var cmd = spawn(KEYTOOL_COMMAND, ktArgs);
  cmd.stdout.on('data', function (data) {
    // console.log('stdout: ' + data);
    var str = data.toString();
    if(str.trim() != '') {
      var target = {}
      for(var i in whatIWant) {
        var arr = whatIWant[i];
        arr.forEach(function(item, index) {
          var match = str.match(item);
          if(match) {
            // console.log(item, match[1])
            target[i] = match[1]
          }
        })
      }
      return cb2(null, Object.assign({}, patchMsg, target))
    }
  });

  cmd.stderr.setEncoding('utf8');
  cmd.stderr.on('data', function (data) {

    cmd.stdin.write("password\n");
  });

  cmd.on('close', function (code) {
    console.log('child process exited with code ' + code);
    fs.unlink(file, function(err) {
      if(err) {
        throw err;
      }
    })
  });
}

function write(file, data, cb, cb2, patchMsg) {
  fs.writeFile(file, data, function(err){
    if (err) throw err;
    console.log('It\'s saved!', file);
    cb && cb(file, cb2, patchMsg)
  })
}

module.exports = {
  keytool: keytool,
  write: write
}