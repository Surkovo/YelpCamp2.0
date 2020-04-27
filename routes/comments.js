var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");


// comments new route
router.get("/new", middleware.isLoggedIn, async (req,res)=>{
	try{
		let campground = await Campground.findById(req.params.id)
		res.render("comments/new",{campground: campground});
	} catch(err){
		console.log(err);
		res.redirect("/campgrounds");
	}
});

//comment save route
router.post("/", middleware.isLoggedIn, async (req, res)=>{
	//lookup campgroun using listen
	try{
		let campground = await Campground.findById(req.params.id)
		let comment = await Comment.create(req.body.comment)
		//add username and id to comment
		comment.author.id = req.user._id;
		comment.author.username = req.user.username;
		await comment.save();
		campground.comments.push(comment);
		await campground.save();
		req.flash("success","Successfully added comment");
		res.redirect("/campgrounds/" + campground._id); 
	} catch(err){
		console.log(err)
		req.flash("error","Something went wrong");
	}
});

//COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, async (req,res)=>{
	try{
		let foundComment = await Comment.findById(req.params.comment_id)
		res.render("comments/edit", {campground_id:req.params.id, comment:foundComment});
	} catch(err){
		res.redirect("back");
	}
});

//UPDATE ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, async (req,res)=>{
	try{
		let updatedComment = await Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment)
		res.redirect("/campgrounds/" + req.params.id)
	} catch(err){
		console.log(err);
		res.redirect("back");
	}
});
// COMMENT DESTROY ROUTE

router.delete("/:comment_id", middleware.checkCommentOwnership, async (req,res)=>{
	try {
		let removedComment = await Comment.findByIdAndRemove(req.params.comment_id)
		req.flash("success","Comment deleted.");
		res.redirect("/campgrounds/"+ req.params.id);
	} catch(err){
		console.log(err);
		res.redirect("back");
	}
	
});

module.exports = router;
