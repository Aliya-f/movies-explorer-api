const http2 = require('http2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const ConflictError = require('../errors/ConflictError');
const NotFoundError = require('../errors/NotFoundError');
const AuthError = require('../errors/AuthError');
const ValidationError = require('../errors/ValidationError');

require('dotenv').config();

const saltRounds = 10;
const { JWT_SECRET, NODE_ENV } = process.env;

// создание пользователя
module.exports.createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;

  bcrypt.hash(password, saltRounds)
    .then((hash) => User.create({
      name, email, password: hash,
    }))
    .then((newUser) => {
      res.status(http2.constants.HTTP_STATUS_CREATED).send({
        name: newUser.name, email: newUser.email,
      });
    })
    .catch((err) => {
      console.log(err);
      if (err.name === 'ValidationError') {
        next(new ValidationError(`Проверьте правильность заполнения полей ${Object.values(err.errors).map(() => err.message).join(', ')}`));
      } else if (err.code === 11000) {
        next(new ConflictError(`Пользователь с таким email: ${email} уже существует`));
      } else {
        next(err);
      }
    });
};

// изменение инфы профиля
module.exports.updateUser = (req, res, next) => {
  const { email, name } = req.body;
  const id = req.user._id;
  return User.findByIdAndUpdate(id, { email, name }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        return next(new NotFoundError(`Пользователь по указанному id: ${id} не найден.`));
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new ValidationError(`${Object.values(err.errors).map(() => err.message).join(', ')}`));
      }
      return next(err);
    });
};

// получает из запроса почту и пароль и проверяет их
module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return next(new AuthError(`Такого пользователя ${email} не существует`));
      }
      return bcrypt.compare(password, user.password)
        .then((correctPassword) => {
          if (!correctPassword) {
            return next(new AuthError('Неверный пароль'));
          }
          return user;
        });
    })
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key',
        { expiresIn: '7d' },
      );
      // console.log(token, 'при создании') // токен создался
      // console.log(NODE_ENV)
      // console.log(JWT_SECRET)
      return res.send({ token });
    })
    .catch(next);
};

// получениe информации о пользователе
module.exports.getUser = (req, res, next) => {
  // console.dir(req)
  const { _id } = req.user;
  return User.findById(_id)
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('user not found'));
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new ValidationError('Переданы некорректные данные'));
      }
      return next(err);
    });
};
