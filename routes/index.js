var express = require("express");
var router = express.Router({mergeParams: true});

var passport = require("passport");
var User = require("../models/user");

//Root route
router.get("/", (req,res)=>{
	res.render("landing");
});

//Auth Routes
router.get("/register", (req,res)=>{
	res.render("register");
});
//handle signup logic
router.post("/register", (req,res)=>{
	var newUser = new User({username: req.body.username});
	User.register(newUser,req.body.password, function(err,user){
		if(err){
			req.flash("error", err.message);
			return res.redirect("/register");
		} else{
			passport.authenticate("local")(req,res, function(){
				req.flash("success", "Welcome to Yelpcamp: "+user.username);
				res.redirect("/campgrounds");
			});
		}
	});
});

// show login in form
router.get("/login", (req,res)=>{
	res.render("login");
});
// handling login logic
router.post("/login",passport.authenticate("local", {
	successRedirect: "/campgrounds",
	failureRedirect: "/login",
	failureFlash: true,
	//successFlash: true
	}), (req,res)=>{
	//res.send("asdfasd");
});



// Log out Routes
router.get("/logout", (req,res)=>{
	req.logOut();
	req.flash("success", "Logged you out");
	res.redirect("/campgrounds");
});


module.exports = router;
