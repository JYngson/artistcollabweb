import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import querystring from 'querystring'
import axios from 'axios';
import dotenv from 'dotenv'

const app = express()
dotenv.config()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

let clientID = process.env.CLIENT_ID!.toString();
let clientSecret = process.env.CLIENT_SECRET!.toString();

app.get('/.netlify/functions/getSpotifyAuth',(req, res) => {
  let code = req.query.code || null;

  axios({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    data:
      querystring.stringify({
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

exports.hander = serverless(app)