var express = require('express');
var router = express.Router();
var indexCtrl = require('../controllers/index');

router.get('/', indexCtrl.render);
router.post('/search-yelp', indexCtrl.searchYelp);

module.exports = router;
