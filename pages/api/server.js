// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios')
const app = express();
const querystring = require('querystring');

let clientID = process.env.CLIENT_ID.toString();
let clientSecret = process.env.CLIENT_SECRET.toString();

app.get('/' , (req, res) =>{
  res.send('listening on port 8080')
})

//Allow CORS middleware
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

function randomStringGen(length) {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

let stateKey = 'spotify_auth_key'


//Token request. Redirects back to spotify auth, then server/auth.
app.get('/token',(req, res) => {
  const state = randomStringGen(16)
  res.cookie(stateKey, state)

  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: clientID,
      redirect_uri: 'http://localhost:8080/auth',
      state: state
  }));
});

//Auth request. Redirects from server/auth to spotify auth, then to frontend/access_token
app.get('/auth',(req, res) => {
  let code = req.query.code || null;

  axios({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    data:
      querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: 'http://localhost:8080/auth',
      }),
    headers: {
      'Authorization': `Basic ${new Buffer.from(`${clientID}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
    .then(response => {
      if (response.status == 200){
        const { access_token } = response.data;
        const { refresh_token } = response.data
        res.redirect('http://localhost:3000/home?' +
          querystring.stringify({
            accessToken: access_token,
            refreshToken: refresh_token,
          })
        )
      } else {
        res.send(response)
      }
    })
    .catch(err => {
      res.send(err)
    })
})

app.get('/tokenRefresh', (req, res) => {
  const {refresh_token} = req.query

  axios({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    data:
      querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      }),
    headers: {
      'Authorization': `Basic ${new Buffer.from(`${clientID}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
  .then(response => {
    res.send(response)
  })
  .catch(error => {
    res.send(error)
  })
})

app.listen(8080, (err) => {
  if (err) throw err
  console.log('listening on port 8080')
})

