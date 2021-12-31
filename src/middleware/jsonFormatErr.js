const JSONFormatError = (err, req, res, next) => {
  if (err) res.status(400).json({ message: 'Request body is not a valid JSON' });
  else next();
};

module.exports = JSONFormatError;
