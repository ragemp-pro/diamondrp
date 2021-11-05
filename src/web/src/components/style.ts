const req_css = require.context('.', true, /.*\.css$/);

req_css.keys().forEach((key) => {
  req_css(key);
});

const req_less = require.context('.', true, /.*\.less$/);

req_less.keys().forEach((key) => {
  req_less(key);
});
