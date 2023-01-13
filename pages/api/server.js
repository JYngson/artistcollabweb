// server.js
require('dotenv').config()
const express = require('express')
const app = express();
const querystring = require('querystring');

app.get('/' , function (req, res){
  res.send('listening on port 8080')
})

app.get('/auth', function(req, res) {
  let clientID = 'a4a59d570aa44c9c9c6448f19d72beb5'
  let redirect_uri = 'http://localhost:3000';
  
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: clientID,
      redirect_uri: redirect_uri,
  }));
});


app.listen(8080, (err) => {
  if (err) throw err
  console.log('listening on port 8080')
})

