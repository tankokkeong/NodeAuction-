exports.error_404_page = function(req, res){
    res.status(404).render('404', { title: '404' });
}

exports.no_script_page = function(req, res){
    res.render("noscript");
    res.end();
}