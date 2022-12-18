import config from '../config/config.js'

export default function login(req, res, next) {
  if (req.session?.user?.role == 'admin' || req.body.test == config.app.TEST_PWD) {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
}