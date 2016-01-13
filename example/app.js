const fs = require('fs');
const crisis = fs.readFileSync(__dirname + '/partial.html','utf8');
module.exports = () => _.constant(_.identity(crisis));
