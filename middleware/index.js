const Campground = require("../models/campground");
const Comment = require("../models/comment");

const middlewareObj = {};

middlewareObj.checkCommentOwnership = async (req,res,next) => {
	if(req.isAuthenticated()){
		try{
			let foundComment = await Comment.findById(req.params.comment_id)
			// does user own campground
			if(foundComment.author.id.equals(req.user._id)){
					next();
					} else {
						req.flash("error","You don't have permission to do that.");
						res.redirect("back");
					}
		} catch(err){
		res.redirect("back");
		}
	} else{
		req.flash("error","You need to be logged in to do that.");
		res.redirect("back");
	}
};


middlewareObj.isLoggedIn = (req,res,next)=>{
	if(req.isAuthenticated()){
		return next();
    } 
    req.flash("error","You need to be logged in to do that.");
	res.redirect("/login");
};


middlewareObj.checkCampgroundOwnership = async (req,res,next)=>{
	if(req.isAuthenticated()){
		try{
			let foundCampground = await Campground.findById(req.params.id)
			// does user own campground
			if(foundCampground.author.id.equals(req.user._id)){
				next();
			} else {
				req.flash("error","You don't have permission");
				res.redirect("back");
			}
		} catch(err){
			req.flash("error","Couldn't find campground");
			res.redirect("back");
		}
	} else{
		req.flash("error","You need to be logged in to do that.");
		res.redirect("back");
	}
};


module.exports = middlewareObj;