var express = require('express');

var router = express.Router();
//var routes = require('../data/routes');


router.get('/:params*', (req, res, next) => {
        console.log('url', req.url);
        res.render('index', {
        title: req.params.model,
        hasAccess: true,
        total: 3,
        route: req.url,
        params: JSON.stringify(req.params),
        color: 'red'
    });
});

module.exports = router;
