const express = require("express");
const router = express.Router({mergeParams: true});
const Campground = require("../models/campground");
const Comment = require("../models/comment");
const middleware = require("../middleware");
const NodeGeocoder = require('node-geocoder');
 
const options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
const geocoder = NodeGeocoder(options);

// Index route
router.get("/", async (req,res)=>{
	try{
		let allCampgrounds = await Campground.find({});
		res.render("campgrounds/index",{campgrounds: allCampgrounds});
	} catch(err){
		console.log(err);
	}
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, async function(req, res){
	// get data from form and add to campgrounds array
	let name = req.body.name;
	let image = req.body.image;
	let desc = req.body.description;
	let author = {
		id: req.user._id,
		username: req.user.username
	}
	try{
		geocoder.geocode(req.body.location, async (err, data) =>{
			if (err || !data.length) {
			  console.log(err);
			  req.flash('error', 'Invalid address');
			  return res.redirect('back');
			}
			let lat = data[0].latitude;
			let lng = data[0].longitude;
			let location = data[0].formattedAddress;
			let newCampground = {name: name, image: image, description: desc, author:author, location: location, lat: lat, lng: lng};
			// Create a new campground and save to DB
			let newlyCreated = await Campground.create(newCampground)
			//redirect back to campgrounds page
			console.log(newlyCreated);
			req.flash("success","Successfully Created!");
			res.redirect("/campgrounds");
		});
	} catch(err){
		console.log(err);
		req.flash('error', 'Invalid address');
		return res.redirect('back');
	}
});

//SHOW new campground 
router.get("/new",middleware.isLoggedIn, (req,res)=>{
	res.render("campgrounds/new");
});

//SHOW shows more info about one campground
router.get("/:id", async (req, res)=>{
	try{ 
		// find the campground with provided ID
		let foundCampground = await Campground.findById(req.params.id).populate("comments");
		console.log(foundCampground);
		res.render("campgrounds/show", {campground: foundCampground});
	} catch(err){
		console.log(err);
	}
});


//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, async (req,res)=>{
	try {
		let foundCampground = await Campground.findById(req.params.id);
		res.render("campgrounds/edit",{campground:foundCampground});
	} catch(err){
		console.log(err)
	}
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, (req, res) => {
	try{
			geocoder.geocode(req.body.location, async (err, data)=>{
			if (err || !data.length) {
				console.log(err);
				req.flash('error', 'Invalid address');
				return res.redirect('back');
			}
			req.body.campground.lat = data[0].latitude;
			req.body.campground.lng = data[0].longitude;
			req.body.campground.location = data[0].formattedAddress;
		
			let campground = await Campground.findByIdAndUpdate(req.params.id, req.body.campground);
			req.flash("success","Successfully Updated!");
			res.redirect("/campgrounds/" + campground._id);
		});
	} catch(err){
		req.flash("error", err.message);
		res.redirect("back");
	}
});

//DESTROY CAMPGROUND
router.delete("/:id", middleware.checkCampgroundOwnership, async (req, res) => {
	try {
		let campgroundRemoved = await Campground.findByIdAndRemove(req.params.id)
		await Comment.deleteMany( {_id: { $in: campgroundRemoved.comments } });
		res.redirect("/campgrounds");
	} catch(err){
		console.log(err)
	}
});

module.exports = router;