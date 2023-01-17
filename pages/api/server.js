// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios')
const app = express();
const querystring = require('querystring');

let redirect_uri = 'http://localhost:8080/auth';
let clientID = process.env.CLIENT_ID.toString();
let clientSecret = process.env.CLIENT_SECRET.toString();

app.get('/' , (req, res) =>{
  res.send('listening on port 8080')
})

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:8080"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
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

app.get('/token',(req, res) => {
  const state = randomStringGen(16)
  res.cookie(stateKey, state)

  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: clientID,
      redirect_uri: redirect_uri,
      state: state
  }));
});

app.get('/auth',(req, res) => {
  let code = req.query.code || null;

  axios({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    data:
      querystring.stringify({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirect_uri,
      }),
    headers: {
      "Authorization": `Basic ${new Buffer.from(`${clientID}:${clientSecret}`).toString('base64')}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
    .then(response => {
      if (response.status == 200){
        const { access_token, token_type } = response.data;
        const { refresh_token } = response.data

        axios.get(`http://localhost:8080/tokenRefresh?refresh_token=${refresh_token}`)
          .then(response => {
            res.send(`<pre>${JSON.stringify(response.data, null, 2)}</pre>`)
          })
          .catch(err => {
            res.send(err)
          })
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
        grant_type: "refresh_token",
        refresh_token: refresh_token
      }),
    headers: {
      "Authorization": `Basic ${new Buffer.from(`${clientID}:${clientSecret}`).toString('base64')}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
  .then(response => {
    res.send(`${response} Refresh Endpoint Successful`)
  })
  .catch(error => {
    res.send(error)
  })
})

app.listen(8080, (err) => {
  if (err) throw err
  console.log('listening on port 8080')
})

