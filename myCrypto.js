var crypto = require('crypto');
var key = '8cg8j5j0301hpw';
function encrypt (text) {
    if (text) {
        var cipher = crypto.createCipher('aes-256-cbc', key);
        //cipher.setAutoPadding(auto_padding=true);
        var crypted = cipher.update(text, 'utf8', 'hex');
        crypted += cipher.final('hex');
        return crypted;
    } else {
        return '';
    }
}
function decrypt (text) {
    if (/^[0-9a-fA-F]+$/.exec(text)) {
        try {
            var decipher = crypto.createDecipher('aes-256-cbc', key);
            //decipher.setAutoPadding(auto_padding=true);
            var dec = decipher.update(text, 'hex', 'utf8');
            dec += decipher.final('utf8');
            return dec;
        } catch (e) {
            return '';
        }
    } else {
        return '';
    }
}
exports.encrypt = encrypt;
exports.decrypt = decrypt;
