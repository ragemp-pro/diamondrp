const fs = require('fs');

fs.readFile('./client_packages/client/index.js', function(err, buf) {
  let data = 'var parcelRequire; ' + buf.toString();

  fs.writeFile('./client_packages/client/index.js', data, (err) => {
    if (err) console.log(err);
    console.log('Client build variable fixed');
  });
});
