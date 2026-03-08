// Middleware to require a passcode for incoming requests when PASSCODE env var is set
module.exports = function (req, res, next) {
  const passcode = process.env.PASSCODE;
  // If no passcode configured, do nothing
  if (!passcode) return next();

  // Allow health check without auth
  if (req.path === '/api/ping') return next();

  // Check header `x-passcode` or query `passcode`
  const headerPass = req.get('x-passcode');
  const queryPass = req.query && req.query.passcode;
  if (headerPass === passcode || queryPass === passcode) return next();

  // Support HTTP Basic auth where password is the passcode
  const auth = req.get('authorization');
  if (auth && auth.startsWith('Basic ')) {
    try {
      const b64 = auth.slice(6);
      const decoded = Buffer.from(b64, 'base64').toString('utf8');
      const parts = decoded.split(':');
      // password may be after the colon
      const password = parts.slice(1).join(':');
      if (password === passcode) return next();
    } catch (e) {
      // fallthrough to 401
    }
  }

  res.set('WWW-Authenticate', 'Basic realm="Protected"');
  return res.status(401).send('Passcode required');
};
