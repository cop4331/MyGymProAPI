const express = require('express');

const bodyParser = require('body-parser');

const MongoClient = require('mongodb').MongoClient;

const app = express();

const client = new MongoClient('mongodb+srv://mainaccess:securepassword@cop4331-large-project-l2dqk.mongodb.net/MyGymPro?retryWrites=true&w=majority');
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