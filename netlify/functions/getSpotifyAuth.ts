import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import queryString from 'query-string';
import axios from 'axios';
import dotenv from 'dotenv/config';

const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

let clientID = process.env.CLIENT_ID!.toString();
let clientSecret = process.env.CLIENT_SECRET!.toString();

app.get('/.netlify/functions/getSpotifyAuth',(req, res) => {
  let code = req.query.code || null;

  axios({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    data:
      queryString.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: 'http://localhost:8888/.netlify/functions/getSpotifyAuth',
      }),
    headers: {
      'Authorization': `Basic ${Buffer.from(`${clientID}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
    .then(response => {
      if (response.status == 200){
        const { access_token } = response.data;
        const { refresh_token } = response.data
        res.redirect('http://localhost:3000/?' +
          queryString.stringify({
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

module.exports.handler = serverless(app)