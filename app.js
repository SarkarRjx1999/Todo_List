const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://DaaddyJi:Rhituraj1999@todolist.e8kpb.mongodb.net/todolistDB" ,{useNewUrlParser:true ,useUnifiedTopology: true});

const itemSchema = {
  name : String 
}

const Item= mongoose.model("Item", itemSchema);

const item1 = new Item({
  name : "Welcome"
});
const item2 = new Item({
  name : "New"
});
const item3 = new Item({
  name : "User"
});

const defaultItems = [item1,item2,item3];  //default items

//for new list
const listSchema = {
  name : String,
  items : [itemSchema]
}
const List = mongoose.model("List" ,listSchema);
//end

app.get("/", function(req, res) {
  Item.find({},function(err,foundItems) {
    if(foundItems.length===0){
      Item.insertMany(defaultItems, function(err){
  if(err){
    console.log(err);
         }
  else{
    console.log("bravoo");
      }
         });
   res.redirect("/");  //to redirect to home after process
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
       }

  });
  
});

//adding new item
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;  //new list name

  const item = new Item({
    name : itemName
  });

//redirecting to new list after adding
  if(listName==="Today")
  {
    item.save(); 
    res.redirect("/");
  }
  else{
    List.findOne({name : listName} , function (err , foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
});
//end

//for deleting items
app.post("/delete" ,function (req,res) {
  const checkItemId = req.body.Checkbox;
  const listName = req.body.ListName;

  if(listName==="Today"){
    Item.findByIdAndDelete(checkItemId,function (err) {
      if(!err){
      console.log("Deleted");
      res.redirect("/");
      }
    });
  }
else{
List.findOneAndUpdate({name:listName},{$pull:{items :{_id:checkItemId}}},function (err,foundList) {
    if(!err){
      res.redirect("/"+listName);
    }
  });
}

});
//end


//adding a new custom route 
app.get("/:customList",function (req,res) {
  const CustomList =  _.capitalize(req.params.customList);

//checking if a list exists or not
  List.findOne({name : CustomList},function (err , foundList) {
  if(!err ){
    if(!foundList)
    {
     //Create a newe list
      const lists = new List({
      name : CustomList,
      items : defaultItems
      });
      lists.save();
      res.redirect("/" + CustomList);
    }
    else{
     // show an existing list
     res.render("List" , {listTitle: foundList.name , newListItems: foundList.items})
    }
  }

  })
//end

 
})


//-------------------------------------------------------------------------------------------//

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started on port 3000 successfully");
});
