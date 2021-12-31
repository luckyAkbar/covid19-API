const morgan = require('morgan');

morgan.token('splitter', (req, res) => '---------------------------------------------------------');
morgan.token('body', (req, res) => JSON.stringify(req.body));
morgan.token('params', (req, res) => JSON.stringify(req.params));
morgan.token('query', (req, res) => JSON.stringify(req.query));

const logger = morgan(`
  :splitter
  HTTP/:http-version :method :url :status :total-time ms :date
  :remote-addr
  :user-agent
  :params
  :query
  :body
`);

module.exports = logger;
