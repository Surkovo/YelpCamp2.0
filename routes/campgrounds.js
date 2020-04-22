var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

// Index route
router.get("/", (req,res)=>{
	Campground.find({}, function(err,allCampgrounds){
		if(err){
			console.log(err);
		} else{
			res.render("campgrounds/index",{campgrounds: allCampgrounds});
		}
	});
});

//CREATE new campground

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
	// get data from form and add to campgrounds array
	var name = req.body.name;
	var image = req.body.image;
	var desc = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	}
	geocoder.geocode(req.body.location, function (err, data) {
	  if (err || !data.length) {
		console.log(err);
		req.flash('error', 'Invalid address');
		return res.redirect('back');
	  }
	  var lat = data[0].latitude;
	  var lng = data[0].longitude;
	  var location = data[0].formattedAddress;
	  var newCampground = {name: name, image: image, description: desc, author:author, location: location, lat: lat, lng: lng};
	  // Create a new campground and save to DB
	  Campground.create(newCampground, function(err, newlyCreated){
		  if(err){
			  console.log(err);
		  } else {
			  //redirect back to campgrounds page
			  console.log(newlyCreated);
			  res.redirect("/campgrounds");
		  }
	  });
	});
  });
// router.post("/",middleware.isLoggedIn, (req,res)=>{
// 	var name = req.body.name;
// 	var price = req.body.price;
// 	var image = req.body.image;
// 	var desc = req.body.description;
// 	var author = {
// 		id: req.user._id,
// 		username: req.user.username
// 	};
// 	var newCampground = {name: name, price: price,image: image, description: desc, author:author};
// 	// create new campground and save to db;
// 	Campground.create(newCampground, function(err,allCampgrounds){
// 		if(err){
// 			console.log(err);
// 		} else{
// 			// redirect back to get page
// 			res.redirect("/campgrounds");
// 		}
// 	});
// });
//SHOW new campground 
router.get("/new",middleware.isLoggedIn, (req,res)=>{
	res.render("campgrounds/new");
});

//SHOW shows more infor about one campground
router.get("/:id", (req, res)=>{
	// find the campground with provided ID
	Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
		if(err){
			console.log(err);
		} else{
			console.log(foundCampground);
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership,(req,res)=>{
	Campground.findById(req.params.id, (err, foundCampground)=>{
		res.render("campgrounds/edit",{campground:foundCampground});
	});
});

//UPDATE CAMPGROUND ROUTE
// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
	geocoder.geocode(req.body.location, function (err, data) {
	  if (err || !data.length) {
		console.log(err);
		req.flash('error', 'Invalid address');
		return res.redirect('back');
	  }
	  req.body.campground.lat = data[0].latitude;
	  req.body.campground.lng = data[0].longitude;
	  req.body.campground.location = data[0].formattedAddress;
  
	  Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
		  if(err){
			  req.flash("error", err.message);
			  res.redirect("back");
		  } else {
			  req.flash("success","Successfully Updated!");
			  res.redirect("/campgrounds/" + campground._id);
		  }
	  });
	});
  });
// router.put("/:id", middleware.checkCampgroundOwnership,(req,res)=>{
// 	//find and update correct campground
// 	Campground.findByIdAndUpdate(req.params.id,req.body.campground, (err, updatedCampground)=>{
// 		if(err){
// 			res.redirect("/campgrounds");
// 		} else{
// 			res.redirect("/campgrounds/" + req.params.id)
// 		}
// 	})
// 	// redirect to show page
// });

//DESTROY CAMPGROUND
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findByIdAndRemove(req.params.id, (err, campgroundRemoved) => {
        if (err) {
            console.log(err);
        }
        Comment.deleteMany( {_id: { $in: campgroundRemoved.comments } }, (err) => {
            if (err) {
                console.log(err);
            }
            res.redirect("/campgrounds");
        });
    })
});

module.exports = router;