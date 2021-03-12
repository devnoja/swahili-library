const { body, validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');

const BookInstance = require('../models/bookinstance');
const Book = require('../models/book');

const async = require('async');

// list of BookInstances
exports.bookinstance_list = (req, res) => {
  BookInstance.find()
    .populate('book')
    .exec((err, bookinstances) => {
      if (err) return next(err);

      res.render('bookinstance_list', {
        title: 'Book Copies',
        banner: 'Copies in our library',
        bookinstances: bookinstances,
      });
    });
};

// specific BookInstance.
exports.bookinstance_detail = (req, res, next) => {
  BookInstance.findById(req.params.id)
    .populate('book')
    .exec((err, bookinstance) => {
      if (err) return next(err);

      if (bookinstance == null) {
        let err = new Error('Book copy not found');
        err.status = 404;
        return next(err);
      }

      res.render('bookinstance_detail', {
        title: 'Copy: ' + bookinstance.book.title,
        bookinstance: bookinstance,
      });
    });
};

// BookInstance create form
exports.bookinstance_create_get = (req, res, next) => {
  Book.find({}, 'title').exec((err, books) => {
    if (err) return next(err);

    res.render('bookinstance_form', {
      title: 'Create BookInstance',
      book_list: books,
    });
  });
};

// bookInstance create
exports.bookinstance_create_post = [
  body('book', 'Book must be specified').isLength({ min: 1 }).trim(),
  body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim(),
  body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),

  sanitizeBody('book').escape(),
  sanitizeBody('imprint').escape(),
  sanitizeBody('status').trim().escape(),
  sanitizeBody('due_back').toDate(),

  // process request after validation and sanitization.
  (req, res, next) => {
    let errors = validationResult(req);

    const bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });

    if (!errors.isEmpty()) {
      Book.find({}, 'title').exec((err, books) => {
        if (err) return next(err);

        res.render('bookinstance_form', {
          title: 'Create Book Instance',
          book_list: books,
          selected_book: bookinstance.book._id,
          errors: errors.array(),
          bookinstance: bookinstance,
        });
      });
      return;
    } else {
      bookinstance.save((err) => {
        if (err) return next(err);

        res.redirect(bookinstance.url);
      });
    }
  },
];

// bookInstance delete form
exports.bookinstance_delete_get = (req, res) => {
  BookInstance.findById(req.params.id).exec((err, copy) => {
    if (err) return next(err);

    if (copy == null) res.redirect('/catalog/bookinstances');

    res.render('bookinstance_delete', {
      title: 'Delete Copy',
      copy: copy,
    });
  });
};

// bookInstance delete
exports.bookinstance_delete_post = (req, res) => {
  BookInstance.findByIdAndRemove(
    req.body.copyid,
    (deletCopy = (err) => {
      if (err) return next(err);
      res.redirect('/catalog/bookinstances');
    })
  );
};

// bookInstance update form
exports.bookinstance_update_get = (req, res, next) => {
  async.parallel(
    {
      copy: (callback) => BookInstance.findById(req.params.id).exec(callback),
      book: (callback) => Book.find(callback),
    },
    (err, results) => {
      if (err) return next(err);

      res.render('bookinstance_form', {
        title: 'Update Copy',
        bookinstance: results.copy,
        book_list: results.book,
      });
    }
  );
};

// bookinstance update
exports.bookinstance_update_post = [
  body('book', 'Book must be specified').isLength({ min: 1 }).trim(),
  body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim(),
  body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),

  sanitizeBody('book').escape(),
  sanitizeBody('imprint').escape(),
  sanitizeBody('status').trim().escape(),
  sanitizeBody('due_back').toDate(),

  (req, res, next) => {
    let errors = validationResult(req);

    const bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      Book.find({}, 'title').exec((err, books) => {
        if (err) return next(err);

        res.render('bookinstance_form', {
          title: 'Create Book Instance',
          book_list: books,
          selected_book: bookinstance.book._id,
          errors: errors.array(),
          bookinstance: bookinstance,
        });
      });
      return;
    } else {
      BookInstance.findByIdAndUpdate(
        req.params.id,
        bookinstance,
        {},
        (err, thebookinstance) => {
          if (err) return next(err);

          res.redirect(thebookinstance.url);
        }
      );
    }
  },
];
