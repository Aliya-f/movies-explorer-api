const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const validationRegex = require('../utils/validationRegex');

const {
  getMovies,
  createMovie,
  deleteMovieById,
} = require('../controllers/movie');

// возвращает все сохранённые текущим пользователем фильмы
router.get('/', getMovies);

// создаёт фильм с переданными в теле country, director, duration,
//  year, description, image, trailer, nameRU, nameEN и thumbnail, movieId
router.post(
  '/',
  celebrate({
    body: Joi.object().keys({
      country: Joi.string().required(),
      director: Joi.string().required(),
      duration: Joi.number().required(),
      year: Joi.string().required(),
      description: Joi.string().required(),
      image: Joi.string().required().regex(validationRegex),
      trailer: Joi.string().required().regex(validationRegex),
      thumbnail: Joi.string().required().regex(validationRegex),
      movieId: Joi.number().required(),
      nameRU: Joi.string().required(),
      nameEN: Joi.string().required(),
    }),
  }),
  createMovie,
);

// // удаляет сохранённый фильм по id
router.delete(
  '/:id',
  celebrate({
    params: Joi.object({
      id: Joi.string().length(24).hex(),
    }),
  }),
  deleteMovieById,
);

module.exports = router;
