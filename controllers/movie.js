const http2 = require('http2');
const Movie = require('../models/movie');
const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');

module.exports.getMovies = (req, res, next) => {
  const owner = req.user._id;
  Movie.find({ owner })
    .then((movies) => res.send({ data: movies }))
    .catch((err) => next(err));
};

module.exports.createMovie = (req, res, next) => {
  const {
    country, director, duration, year, description, image, trailer, nameRU, nameEN,
    thumbnail, movieId,
  } = req.body;
  const owner = (req.user._id); // _id станет доступен

  return Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner,
  })
    .then((film) => res.status(http2.constants.HTTP_STATUS_CREATED).send({ data: film }))
    .catch((err) => {
      console.log(err.stack);
      if (err.name === 'ValidationError') {
        return next(new ValidationError(`Проверьте правильность заполнения полей ${Object.values(err.errors).map(() => err.message).join(', ')}`));
      }
      return next(err);
    });
};

module.exports.deleteMovieById = (req, res, next) => {
  const { _id } = req.user;
  return Movie.findById(req.params.id)
    .then((film) => {
      if (!film) {
        throw new NotFoundError('Такого фильма не существует');
      }
      if (film.owner.toString() !== _id) {
        throw new ForbiddenError('Вы не можете удалить данный фильм');
      }
      return Movie.findByIdAndRemove(req.params.id)
        .then(() => {
          res.status(http2.constants.HTTP_STATUS_OK).send({ message: 'Фильм успешно удален' });
        })
        .catch((err) => next(err));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new ValidationError('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};
