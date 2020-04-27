const express = require("express");
const router = express.Router({mergeParams: true});

const passport = require("passport");
const User = require("../models/user");

//Root route
router.get("/", (req,res)=>{
	res.render("landing");
});

//Auth Routes
router.get("/register", (req,res)=>{
	res.render("register");
});
//handle signup logic
router.post("/register", async (req,res)=>{
	try {
		let newUser = new User({username: req.body.username});
		let user = await User.register(newUser,req.body.password)
		passport.authenticate("local")(req,res, ()=>{
				req.flash("success", "Welcome to Yelpcamp: "+user.username);
				res.redirect("/campgrounds");
				});
	} catch(err){
		req.flash("error", err.message);
		return res.redirect("/register");	
	}
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
