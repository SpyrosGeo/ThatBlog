var express = require("express");
var mongoose = require("mongoose");
var passport = require('passport');
var LocalStrategy = require('passport-local');
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var expressSanitizer = require("express-sanitizer");
var app = express();
//Models Require
var Blog = require("./models/blog");
var User = require("./models/user");


mongoose.connect("mongodb://localhost/Sadblog", {
  useNewUrlParser: true
});
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());
/////////////////////////////////////////
mongoose.set('useFindAndModify', false);
////////////////////////////////////////
app.use(require("express-session")({
  secret:"kiba",
  resave:false,
  saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//Use current user in every Route
app.use(function(req,res,next){
  res.locals.currentUser = req.user;
  next();
});




//INDEX
app.get("/", function(req, res) {
  res.redirect("/blogs");
});
app.get("/blogs", function(req, res) {
  Blog.find({}, function(err, blogs) {
    if (err) {
      console.log('err', err);
    } else {
      res.render("index", {
        blogs: blogs
      });
    }
  })
});
//NEW route
app.get("/blogs/new", function(req, res) {
  res.render("new");
});
//CREATE route
app.post("/blogs",isLoggedIn,function(req, res) {
  var title = req.body.blog.title;
  var image = req.body.blog.image;
  var body  = req.body.blog.body;
  var created = req.body.blog.created;
  var author = {
    id:req.user._id,
    username:req.user.username
  }
  req.body.blog.body = req.sanitize(req.body.blog.body);
  var addBlog = {
    title:title,
    image:image,
    body:body,
    created:created,
    author:author
  }
  Blog.create(addBlog, function(err, newBlog) {
    if (err) {
      res.render("new");
    } else {
      res.redirect("/blogs");
    }
  });
});
//SHOW route
app.get("/blogs/:id", function(req, res) {
  Blog.findById(req.params.id, function(err, foundBlog) {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.render("show", {
        blog: foundBlog
      });
    }
  });
});
//EDIT route
app.get("/blogs/:id/edit",isLoggedIn,function(req, res) {
  Blog.findById(req.params.id, function(err, foundBlog) {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.render("edit", {
        blog: foundBlog
      });
    }
  });
});
//UPDATE Route
app.put("/blogs/:id", function(req, res) {
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog) {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs/" + req.params.id);
    }
  });
});
//DELETE route
app.delete("/blogs/:id",isLoggedIn ,function(req, res) {
  Blog.findByIdAndRemove(req.params.id, function(err) {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs");
    }
  });
});
//Register Route
app.get("/register",function (req,res) {
  res.render("register");
});


app.post("/register",function (req, res) {
  var newUser = new User({username: req.body.username});
  User.register(newUser,req.body.password,function (err,user) {
    if (err) {
      console.log('err:', err);
      return res.render("register");
    }
    passport.authenticate("local")(req, res,function () {
      console.log('user', user.username);
      res.redirect("/blogs");
    });
  });
});
//LOGIN routes
app.get("/login",function (req, res) {
  res.render("login");
});
app.post("/login",passport.authenticate("local",{
  successRedirect:"/blogs",
  failureRedirect:"/login"

}),function(req, res) {
  // res.send("login logic hrouterens");
});

app.get("/logout",function (req, res) {
  //comes with the packages that are installed
  req.logout();
  res.redirect("/blogs");
});

//Middleware
    function isLoggedIn(req, res, next){
      if (req.isAuthenticated()) {
        return next();
      } else {
        res.redirect("/login");
      }
    }

app.listen(8080, function() {
  console.log("server is up");
});
