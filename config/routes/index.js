
/*
 * GET home page
 */
exports.index = function(req, res) {
  res.render('index', app_info)
};


/*
 * GET sobre
 */
exports.sobre = function(req, res) {
  res.render('sobre', app_info)
};