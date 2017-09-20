module.exports = {
    index: function(req, res) {
        res.render('image');
    },
    create: function(req, res) {
        res.send("The image:create POST Controller");
    },
    like: function(req, res) {
        res.send("The image:like Post Controller");
    },
    comment: function(req, res) {
        res.send("The image:comment POST controller")
    }
};