var express = require('express');

var bodyParser = require('body-parser');

var MongoClient = require('mongodb').MongoClient;

var bcrypt = require('bcrypt');

var nodemailer = require('nodemailer');

var rand = 0;

var app = express();

var conn = 'mongodb+srv://mainaccess:securepassword@cop4331-large-project-l2dqk.mongodb.net/MyGymPro?retryWrites=true&w=majority';

var client = new MongoClient(conn);
client.connect();

app.use(bodyParser.json());

app.get('/', (req, res) =>
{
  res.send('The server is running.');
});

app.post('/api/signup', async (req, res) =>
{
  var error = '';
  
  const {username, email, password} = req.body;
	
  var hashedPassword = bcrypt.hashSync(password, 8);
  
  const newUser = {Username:username, Email:email, Password:hashedPassword, isVerified:0}
  
  try
  {
    const db = client.db();
	  
    const checkUsernameExistence = await db.collection('Users').find({Username:username}).toArray();
    const checkEmailExistence = await db.collection('Users').find({Email:email}).toArray();
	 
    if (checkUsernameExistence.length > 0)
    {
    res.status(403).json({Error:"Username already exists."});
    process.exit();
    }
    else if (checkEmailExistence.length > 0)
    {
    res.status(403).json({Error:"Email address already exists."});
    process.exit();
    }
	  
    const result = db.collection('Users').insertOne(newUser);

    var transporter = nodemailer.createTransport(
    {
      service: "gmail",
      auth: {user: "mygymproapp@gmail.com", pass: "Exceptions123?"}
    });
    
    rand = Math.floor((Math.random() * 100) + 54);

    var link = "http://my-gym-pro.herokuapp.com/api/verifyemail/?id=" + rand + "&username=" + username;
	  
    mailOptions = 
    {
      from: "mygymproapp@gmail.com",
      to : email.toString(),
      subject : "Please confirm your MyGymPro account.",
      html : "<br>Please click on the link to verify your email.<br> <a href="+link+">CLICK HERE</a>"
    }
	  
    transporter.sendMail(mailOptions);
  }
  catch(e)
  {
    error = e.toString();
  }
  
  res.status(200).json({Error:error});
});

app.get('/api/verifyemail', async (req, res) =>
{
    if (req.query.id == rand)
    {
      res.send("Your email has been verified.");
      const db = client.db();
      db.collection('Users').update({Username:req.query.username}, {$set:{isVerified:1}});
    }
});

app.post('/api/login', async (req, res) =>
{
  var error = '';
	
  const {username, password} = req.body;
  
  try
  {
    const db = client.db();
    const result = db.collection('Users').find({Username:username}).toArray();
    
    res.json({res:result});
	  process.exit();
    
    if (result.length == 0)
    {
      res.status(403).json({Error:'Username does not exist.'});
      process.exit();
    }
    
    if (result[0].isVerified == 0)
    {
      res.status(403).json({Error:'You must verify your email before logging in.'});
      process.exit();
    }
	  
    var hashedPassword = result[0].Password;
    if (bcrypt.compareSync(password, hashedPassword))
    {
      var id = result[0]._id;
      res.status(200).json({id:id, Error:error});
    }
    else
    {
      res.status(403).json({Error:'Incorrect password.'});
    }
  }
  catch(e)
  {
    error = e.toString();
    res.status(200).json({Error:error});
  }
});  
  
   
app.post('/api/createpost', async (req, res) =>
{
  var error = '';
  
  const {userID, title, description, date} = req.body;
  
  const newPost = {UserID:userID, Title:title, Description:description, Date:date};
  
  try
  {
  const db = client.db();
  const result = db.collection('Posts').insertOne(newPost);
  }
  catch(e)
  {
    error = e.toString();
  }
  
  res.status(200).json({Error:error});
});

app.post('/api/deletepost', async (req, res) =>
{
  var error = '';
  
  const {description} = req.body;
  
  try
  {
  const db = client.db();
  const result = db.collection('Posts').deleteOne({Description:description});
  }
  catch(e)
  {
    error = e.toString();
  }
  
  res.status(200).json({Error:error});
});

app.post('/api/getallposts', async (req, res) =>
{
  var error = '';
  var ret = {};
  
  try
  {
  const db = client.db();
  const results = await db.collection('Posts').find({}).toArray();
  ret = JSON.stringify(results);
  }
  catch(e)
  {
    error = e.toString();
  }
  
  res.status(200).json({Posts:ret, Error:error});
});

app.post('/api/createreply', async (req, res) =>
{
  var error = '';
  
  const {postID, userID, description, date} = req.body;
  
  const newReply = {PostID:postID, UserID:userID, Description:description, Date:date};
  
  try
  {
  const db = client.db();
  const result = db.collection('Replies').insertOne(newReply);
  }
  catch(e)
  {
    error = e.toString();
  }
	
  res.status(200).json({Error:error});
});

app.post('/api/deletereply', async (req, res) =>
{
  var error = '';	
	
  const {description} = req.body;
  
  try
  {
  const db = client.db();
  const result = db.collection('Replies').deleteOne({Description:description});
  }
  catch(e)
  {
    error = e.toString();
  }
  
  res.status(200).json({Error:error});
});

app.post('/api/getallreplies', async (req, res) =>
{
  var error = '';
  var ret = {};
	
  try
  {
  const db = client.db();
  const results = await db.collection('Replies').find({}).toArray();
  ret = JSON.stringify(results);
  }
  catch(e)
  {
    error = e.toString();
  }
  
  res.status(200).json({Replies:ret, Error:error});
});

app.post('/api/poststepdata', async (req, res) =>
{
  var error = '';
	
  const {userID, date, numSteps, distanceTraveled, caloriesBurned, dailyGoal} = req.body;
  
  const stepData = {UserID:userID, Date:date, Steps:numSteps, Distance:distanceTraveled, Calories:caloriesBurned, Goal:dailyGoal};
  
  try
  {
  const db = client.db();
  const result = db.collection('Steps').insertOne(stepData);
  }
  catch(e)
  {
    error = e.toString();
  }
  
  res.status(200).json({Error:error});
});

app.post('/api/getstepdata', async (req, res) =>
{
  var error = '';
  var ret = {};

  const {userID} = req.body;
  
  try
  {
  const db = client.db();
  const results = await db.collection('Steps').find({UserID:userID}).toArray();
  ret = JSON.stringify(results);
  }
  catch(e)
  {
    error = e.toString();
  }

  res.status(200).json({StepData:ret, Error:error});
});

app.post('/api/getalltemplates', async (req, res) =>
{
  var error = '';
  var ret = {};
	
  try
  {
  const db = client.db();
  const results = await db.collection('Templates').find({}).toArray();
  ret = JSON.stringify(results);
  }
  catch(e)
  {
    error = e.toString();
  }
  
  res.status(200).json({Templates:ret, Error:error});
});

app.post('/api/createcustomworkout', async (req, res) =>
{
  var error = '';	
	
  const {userID, customWorkout} = req.body;
  
  const newWorkout = {UserID:userID, Workout:customWorkout}
  
  try
  {
  const db = client.db();
  const result = db.collection('CustomWorkouts').insertOne(newWorkout);
  }
  catch(e)
  {
    error = e.toString();
  }
  
  res.status(200).json({Error:error});
});

app.post('/api/deletecustomworkout', async (req, res) =>
{
  var error = '';	
	
  const {workout} = req.body;
  
  try
  {
  const db = client.db();
  const result = db.collection('CustomWorkouts').deleteOne({Workout:workout});
  }
  catch(e)
  {
    error = e.toString();
  }
  
  res.status(200).json({Error:error});
});

app.post('/api/getallcustomworkouts', async (req, res) =>
{
  var error = '';
  var ret = {};
	
  const {userID} = req.body;
  
  try
  {
  const db = client.db();
  const results = await db.collection('CustomWorkouts').find({UserID:userID}).toArray();
  ret = JSON.stringify(results);
  }
  catch(e)
  {
    error = e.toString();
  }
  
  res.status(200).json({Workouts:ret, Error:error});
});

app.listen(process.env.PORT);
