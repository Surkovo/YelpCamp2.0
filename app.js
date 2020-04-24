require('dotenv').config();

const 	express = require("express");
const	bodyParser = require("body-parser");
const 	mongoose = require("mongoose");
const 	flash	= require("connect-flash");
const 	passport = require("passport");
const 	LocalStrategy = require("passport-local");
const 	methodOverride = require("method-override");
const 	Campground = require("./models/campground");
const	Comment = require("./models/comment");
const 	User = require("./models/user");
const 	seedDB = require("./seeds");

//Requring Routes
const 	commentRoutes = require("./routes/comments");
const 	campgroundRoutes = require("./routes/campgrounds");
const 	indexRoutes = require("./routes/index");

const app = express();
// mongoose.connect(process.env.DATABASEURL,{useNewUrlParser: true,useCreateIndex: true});

const url = process.env.DATABASEURL || "mongodb://localhost:27017/yelp_camp_2";

console.log(url);

mongoose.connect(url,
	{useNewUrlParser: true, 
	useCreateIndex: true,
	useUnifiedTopology: true
	}).then(()=>{
		console.log("Connected to Mongo DB Atlas")
	}).catch(err =>{
		console.log("ERROR: ", err.messege)
	});

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
//seedDB();  // seed the database

//PASSPORT CONFIGURATION

app.use(require("express-session")({
	secret:"Ebi is fiesty",
	resave: false,
	saveUninitialized: false
	}));

app.locals.moment = require('moment');

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use("/",indexRoutes);
app.use("/campgrounds",campgroundRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);


app.listen(process.env.PORT || 3000, process.env.IP, ()=>{
	console.log("YelpCamp Server has started")
});


