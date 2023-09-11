const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const userRouter = require('./users');
const movieRouter = require('./movies');
const { createUser, login } = require('../controllers/user');
const auth = require('../middlewares/auth');
// const validationRegex = require('../utils/validationRegex');
// const { userCreationValidation, loginValidation } = require('../middlewares/joiValidation');
const NotFoundError = require('../errors/NotFoundError');
// const { info } = require('../utils/config');

router.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),
  createUser,
);

router.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),
  login,
);

router.use(auth);

router.use('/users', userRouter);
router.use('/movies', movieRouter);

module.exports = router;
