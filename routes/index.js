const express = require('express');
const router = express.Router();

// homepage route
router.get('/', (req, res, next) => res.redirect('/catalog'));

module.exports = router;
