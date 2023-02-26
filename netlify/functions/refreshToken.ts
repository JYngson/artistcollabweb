import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import queryString from 'query-string';
import axios from 'axios';
import dotenv from 'dotenv/config'

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

app.get('/tokenRefresh', (req, res) => {
  const refreshToken = req.query.refreshToken
  axios({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    data:
      queryString.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      }),
    headers: {
      'Authorization': `Basic ${Buffer.from(`${clientID}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
  .then(response => {
      const { access_token } = response.data;
      res.redirect('http://localhost:3000/home?' +
        queryString.stringify({
          accessToken: access_token,
        })
      )
  })
  .catch(err => {
    res.send(err)
  })
})

module.exports.hander = serverless(app)