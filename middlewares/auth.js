require('dotenv').config();
const jwt = require('jsonwebtoken');
const AuthError = require('../errors/AuthError');

const { JWT_SECRET, NODE_ENV } = process.env;

const auth = (req, res, next) => {
  const { authorization } = req.headers;
  // console.log(req.headers)
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new AuthError('Необходима авторизация'));
  }
  const token = authorization.replace('Bearer ', '');

  let payload;
  if (!token) return next(new AuthError('Необходима авторизация'));

  try {
  // верификация токена
    // console.log(token)
    // console.log(NODE_ENV)
    // console.log(JWT_SECRET)
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key');
  } catch (err) {
    console.log(err);
    if (err.name === 'JsonWebTokenError') {
      return next(new AuthError('Необходима авторизация - ошибка верификации'));
    }
    return next(err);
  }

  req.user = payload; // записываем пейлоуд в объект запроса
  return next(); // пропускаем запрос дальше
};

module.exports = auth;
