var express = require('express');

var bodyParser = require('body-parser');

var MongoClient = require('mongodb').MongoClient;

var bcrypt = require('bcrypt');

var nodemailer = require('nodemailer');

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
	  
    var smtpTransport = nodemailer.createTransport({
	    service: "Gmail",
	    auth: {user: "mygymproapp@gmail.com", pass: "Exceptions123?"}
    });

    var rand, mailOptions, host, link;
	  
    app.get('/send',function(req,res){
        rand=Math.floor((Math.random() * 100) + 54);
    host=req.get('host');
    link="http://"+req.get('host')+"/verify?id="+rand;
    mailOptions={
        to : req.query.to,
        subject : "Please confirm your Email account",
        html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"
    }
    console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, function(error, response){
     if(error){
            console.log(error);
        res.end("error");
     }else{
            console.log("Message sent: " + response.message);
        res.end("sent");
         }
      });
    });
  }
  catch(e)
  {
    error = e.toString();
  }
  
  res.status(200).json({Error:error});
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
