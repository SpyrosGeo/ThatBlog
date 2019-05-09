var express    = require("express");
var mongoose   = require("mongoose");
var bodyParser = require("body-parser");
var  app       = express();
mongoose.connect("mongodb://localhost/Sadblog", {
  useNewUrlParser: true
});
app.set ("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

//SCHEMA model config
var blogSchema = new mongoose.Schema({
  title:String,
  image:String,
  body: String,
  created:{type:Date,default:Date.now}
});

var Blog = mongoose.model("Blog",blogSchema);
Blog.create({
  title:"My second Post",
  image:"https://images.unsplash.com/photo-1471871480126-59ab253c49e9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80",
  body:"what a post!!"
});
//RESTful Routes[]

app.get("/",function(req, res) {
  res.redirect("/blogs");
});
app.get("/blogs",function(req, res) {
  Blog.find({},function(err,blogs) {
    if (err) {
      console.log('err', err);
    } else {
res.render("index",{blogs:blogs});
    }
  })
});


app.listen(8080, function() {
  console.log("server is up");
});
