//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/wikiDB", {useNewUrlParser: true});

const articleSchema = {
  title: String,
  content: String
};

const Article = mongoose.model("Article", articleSchema);

///////////////////////////////////Requests Targetting all Articles////////////////////////
//chained routing
app.route("/articles") //route to all articles

.get(function(req, res){
  Article.find(function(err, foundArticles){//found articles will save the array
    if (!err) {
      res.send(foundArticles);
    } else {
      res.send(err);
    }
  });
})


//in postman route is set to localhost:3000/articles
//set the post method
//go to body->url encoded->now set the key values
//set it to post in postman run the app and press  send request on postman and check your datbase
.post(function(req, res){

  const newArticle = new Article({//new element of articles
    title: req.body.title,//title and content are the key variables used in postman->body->url encoded-
    content: req.body.content
  });

  newArticle.save(function(err){
    if (!err){
      res.send("Successfully added a new article.");
    } else {
      res.send(err);
    }
  });
})   //see here there is no ; but at the end of chaining for this route we will have to use ;

.delete(function(req, res){

  Article.deleteMany(function(err){//this will delete the complete collection as we have not mentioned the condition
    if (!err){
      res.send("Successfully deleted all articles.");
    } else {
      res.send(err);
    }
  });
});//note ; used to end the chaining and not used earlier

////////////////////////////////Requests Targetting A Specific Article////////////////////////

app.route("/articles/:articleTitle")

.get(function(req, res){
//articleTitle in our url is what we have set our title so if title contains spaces then in url it should be coded as %20
//but in postman space also works fine
  Article.findOne({title: req.params.articleTitle}, function(err, foundArticle){
    if (foundArticle) {     //this is the way to check whether found article is there or not if not then return null value
      //when you have some doubt regarding these things console.log(); those things
      res.send(foundArticle);
    } else {
      res.send("No articles matching that title was found.");
    }
  });
})
//put function replaces the complete document of a collection with a new value
//again we need to go to body and url encoded
.put(function(req, res){
//note if we update i.e in second condn put inly the one field it will remove
//the other field completly and the document will have only one key value pair

  Article.update(
    {title: req.params.articleTitle},//which articles do we want to update we can put many conditions by , seperated
    {title: req.body.title, content: req.body.content},//by what value we want to update we can put one field value also
    {overwrite: true},//to over write the mongodb styles check stackoverflow documentation
    //this provides the mongodb to overwrite the specified conditions and if we do not write this then it will work as patch
    //and only update the particular field
    function(err){
      if(!err){
        res.send("Successfully updated the selected article.");
      }
    }
  );
})

.patch(function(req, res){

  Article.update(
    {title: req.params.articleTitle},//condition for which we want an update
  // {$set:  {title: req.body.title, content: req.body.content} },//this is the most basic style of updating only given field
    {$set: req.body},//now whatever are the things to set will be mapped on the basis of input
    //so it also provides a shorthand and dynamic eaviour
    function(err){
      if(!err){
        res.send("Successfully updated article.");
      } else {
        res.send(err);
      }
    }
  );
})

.delete(function(req, res){

  Article.deleteOne(
    {title: req.params.articleTitle},//condn to check which document to delete title refers to key from database
    function(err){
      if (!err){
        res.send("Successfully deleted the corresponding article.");
      } else {
        res.send(err);
      }
    }
  );
});



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
