const { body, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

var BookInstance = require("../models/bookinstance");
var Book = require("../models/book");

var async = require("async");

// Display list of all BookInstances.
exports.bookinstance_list = function(req, res) {
  BookInstance.find()
    .populate("book")
    .exec(function(err, bookinstances) {
      if (err) {
        return next(err);
      }
      res.render("bookinstance_list", {
        title: "Book Copies",
        banner: "Copies in our library",
        bookinstances: bookinstances
      });
    });
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function(req, res, next) {
  BookInstance.findById(req.params.id)
    .populate("book")
    .exec(function(err, bookinstance) {
      if (err) {
        return next(err);
      }
      if (bookinstance == null) {
        var err = new Error("Book copy not found");
        err.status = 404;
        return next(err);
      }
      res.render("bookinstance_detail", {
        title: "Copy: " + bookinstance.book.title,
        bookinstance: bookinstance
      });
    });
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function(req, res, next) {
  Book.find({}, "title").exec(function(err, books) {
    if (err) {
      return next(err);
    }
    // Successful, so render.
    res.render("bookinstance_form", {
      title: "Create BookInstance",
      book_list: books
    });
  });
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
  // Validate fields.
  body("book", "Book must be specified")
    .isLength({ min: 1 })
    .trim(),
  body("imprint", "Imprint must be specified")
    .isLength({ min: 1 })
    .trim(),
  body("due_back", "Invalid date")
    .optional({ checkFalsy: true })
    .isISO8601(),

  // Sanitize fields.
  sanitizeBody("book").escape(),
  sanitizeBody("imprint").escape(),
  sanitizeBody("status")
    .trim()
    .escape(),
  sanitizeBody("due_back").toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a BookInstance object with escaped and trimmed data.
    var bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages.
      Book.find({}, "title").exec(function(err, books) {
        if (err) {
          return next(err);
        }
        // Successful, so render.
        res.render("bookinstance_form", {
          title: "Create book-instance",
          book_list: books,
          selected_book: bookinstance.book._id,
          errors: errors.array(),
          bookinstance: bookinstance
        });
      });
      return;
    } else {
      // Data from form is valid.
      bookinstance.save(function(err) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to new record.
        res.redirect(bookinstance.url);
      });
    }
  }
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function(req, res) {
  BookInstance.findById(req.params.id).exec(function(err, copy) {
    if (err) {
      return next(err);
    }
    if (copy == null) {
      res.redirect("/catalog/bookinstances");
    }
    // Successful
    res.render("bookinstance_delete", {
      title: "Delete copy",
      copy: copy
    });
  });
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function(req, res) {
  BookInstance.findByIdAndRemove(req.body.copyid, function deletCopy(err) {
    if (err) {
      return next(err);
    }
    res.redirect("/catalog/bookinstances");
  });
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function(req, res, next) {
  async.parallel(
    {
      copy: function(callback) {
        BookInstance.findById(req.params.id).exec(callback);
      },
      book: function(callback) {
        Book.find(callback);
      }
    },
    function(err, results) {
      if (err) {
        return next(err);
      }
      // Successful, so render.
      res.render("bookinstance_form", {
        title: "Update Copy",
        bookinstance: results.copy,
        book_list: results.book
      });
    }
  );
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = function(req, res) {
  res.send("NOT IMPLEMENTED: BookInstance update POST");
};
