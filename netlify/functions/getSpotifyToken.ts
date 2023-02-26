import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import queryString from 'query-string';
import dotenv from 'dotenv/config'

const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

let clientID = process.env.CLIENT_ID!.toString();

// CORS Redundancy Check
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

function randomStringGen(length:number) {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
let stateKey = 'spotify_auth_key'


app.get('/.netlify/functions/getSpotifyToken',(req, res) => {
  const state = randomStringGen(16)
  res.cookie(stateKey, state)

  res.redirect('https://accounts.spotify.com/authorize?' +
    queryString.stringify({
      response_type: 'code',
      client_id: clientID,
      redirect_uri: 'http://localhost:8888/.netlify/functions/getSpotifyAuth',
      state: state
  }));
});


module.exports.handler = serverless(app)