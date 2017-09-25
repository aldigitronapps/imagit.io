var fs = require('fs'),
    path = require('path'),
    sidebar = require('../helpers/sidebar'),
    Models = require('../models'),
    md5 = require('MD5');

module.exports = {
    index: function(req, res) {
        // declare our empty viewModel variable object:
        var viewModel = {
            image: {},
            comments: []
        };
        // find the image by searching the filename matching the url  parameter:
        Models.Image.findOne({ filename: { $regex: req.params.image_id } },
            function(err, image) {
                if (err) { throw err; }
                if (image) {
                    image.views = image.views + 1;
                    viewModel.image = image;
                    image.save();
                    // find any comments with the same image_id as the image:
                    Models.Comment.find({ image_id: image._id }, {}, {
                            sort: { 'timestamp': 1 }
                        },
                        function(err, comments) {
                            viewModel.comments = comments;
                            sidebar(viewModel, function(viewModel) {
                                res.render('image', viewModel);
                            });
                        }
                    );
                } else {
                    // if no image was found, simply go back to the
                    homepage: res.redirect('/');
                }
            });
    },
    create: function(req, res) {
        var saveImage = function() {
            var possible = 'abcdefghijklmnopqrstuvwxyz0123456789',
                imgUrl = '';
            for (var i = 0; i < 6; i += 1) {
                imgUrl += possible.charAt(Math.floor(Math.random() * possible.length));
            }

            // search for an image with the same filename by performing a find:
            Models.Image.find({ filename: imgUrl }, function(err, images) {
                if (images.length > 0) {
                    // if a matching image was found, try again (start over):
                    saveImage();
                } else {
                    var tempPath = req.files.file.path,
                        ext = path.extname(req.files.file.name).toLowerCase(),
                        targetPath = path.resolve('./public/upload/' + imgUrl +
                            ext);
                    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
                        fs.rename(tempPath, targetPath, function(err) {
                            if (err) { throw err; }
                            // create a new Image model, populate its details:
                            var newImg = new Models.Image({
                                title: req.body.title,
                                filename: imgUrl + ext,
                                description: req.body.description
                            });
                            // and save the new Image
                            newImg.save(function(err, image) {
                                res.redirect('/images/' + image.uniqueId);
                            });
                        });
                    } else {
                        fs.unlink(tempPath, function() {
                            if (err) { throw err; }
                            res.json(500, {
                                error: 'Only image files are allowed.'
                            });
                        });
                    }

                }
            });

        };
        saveImage();
    },
    like: function(req, res) {
        Models.Image.findOne({ filename: { $regex: req.params.image_id } },
            function(err, image) {
                if (!err && image) {
                    image.likes = image.likes + 1;
                    image.save(function(err) {
                        if (err) {
                            res.json(err);
                        } else {
                            res.json({ likes: image.likes });
                        }
                    });
                }
            });
    },
    comment: function(req, res) {
        Models.Image.findOne({ filename: { $regex: req.params.image_id } },
            function(err, image) {
                if (!err && image) {
                    var newComment = new Models.Comment(req.body);
                    newComment.gravatar = md5(newComment.email);
                    newComment.image_id = image._id;
                    newComment.save(function(err, comment) {
                        if (err) { throw err; }
                        res.redirect('/images/' + image.uniqueId + '#' +
                            comment._id);
                    });
                } else {
                    res.redirect('/');
                }
            });
    }
};