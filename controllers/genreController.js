const validator = require('express-validator');

const Genre = require('../models/genre');
const Book = require('../models/book');

const async = require('async');

// list of genres
exports.genre_list = (req, res) => {
  Genre.find()
    .sort([['name', 'ascending']])
    .exec((err, genres) => {
      if (err) return err;

      res.render('genre_list', {
        title: 'Genres',
        genres: genres,
      });
    });
};

// specific genre
exports.genre_detail = (req, res, next) => {
  async.parallel(
    {
      genre: (callback) => Genre.findById(req.params.id).exec(callback),
      genre_books: (callback) =>
        Book.find({ genre: req.params.id }).exec(callback),
    },
    (err, results) => {
      if (err) return next(err);

      if (results.genre == null) {
        let err = new Error('Genre not found');
        err.status = 404;
        return next(err);
      }

      res.render('genre_detail', {
        title: 'Genre Details',
        genre: results.genre,
        genre_books: results.genre_books,
      });
    }
  );
};

// genre create form
exports.genre_create_get = (req, res, next) => {
  res.render('genre_form', { title: 'Create Genre' });
};

// genre create
exports.genre_create_post = [
  validator.body('name', 'Genre name required').isLength({ min: 1 }).trim(),
  validator.sanitizeBody('name').escape(),

  (req, res, next) => {
    let errors = validator.validationResult(req);

    let genre = new Genre({ name: req.body.name });

    if (!errors.isEmpty()) {
      res.render('genre_form', {
        title: 'Create Genre',
        genre: genre,
        errors: errors.array(),
      });
      return;
    } else {
      // check if genre with same name already exists
      Genre.findOne({ name: req.body.name }).exec((err, found_genre) => {
        if (err) return next(err);

        if (found_genre) {
          res.redirect(found_genre.url);
        } else {
          genre.save((err) => {
            if (err) return next(err);

            res.redirect(genre.url);
          });
        }
      });
    }
  },
];

// genre delete form
exports.genre_delete_get = function (req, res) {
  async.parallel(
    {
      genre: (callback) => Genre.findById(req.params.id).exec(callback),
      genre_books: (callback) =>
        Book.find({ genre: req.params.id }).exec(callback),
    },
    (err, results) => {
      if (err) return next(err);

      if (results.genre == null) res.redirect('/catalog/genres');

      res.render('genre_delete', {
        title: 'Delete Genre',
        genre: results.genre,
        genre_books: results.genre_books,
      });
    }
  );
};

// genre delete
exports.genre_delete_post = (req, res) => {
  async.parallel(
    {
      genre: (callback) => Genre.findById(req.body.genreid).exec(callback),
      genre_books: (callback) => {
        Book.find({ genre: req.body.genreid }).exec(callback);
      },
    },
    (err, results) => {
      if (err) return next(err);

      if (results.genre_books.length > 0) {
        res.render('genre_delete', {
          title: 'Delete Genre',
          genre: results.genre,
          genre_books: results.genre_books,
        });
        return;
      } else {
        Genre.findByIdAndRemove(
          req.body.genreid,
          (deleteGenre = (err) => {
            if (err) return next(err);

            res.redirect('/catalog/genres');
          })
        );
      }
    }
  );
};
