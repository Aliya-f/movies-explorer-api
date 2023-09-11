const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
// const validationRegex = require('../utils/validationRegex');
const { getUser, updateUser } = require('../controllers/user');

router.get(
  '/me',
  celebrate({
    params: Joi.object().keys({
      id: Joi.string().alphanum().length(24).hex(),
    }),
  }),
  getUser,
);

router.patch(
  '/me',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
    }),
  }),
  updateUser,
);

module.exports = router;
