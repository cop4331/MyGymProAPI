var express = require('express');

var bodyParser = require('body-parser');

var MongoClient = require('mongodb').MongoClient;

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
  
  const newUser = {Username:username, Email:email, Password:password, isVerified:0}
  
  try
  {
    const db = client.db();
    const result = db.collection('Users').insertOne(newUser);
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

app.listen(process.env.PORT);
