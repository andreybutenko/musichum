const keys = require('./keys.js');
const REDIRECT_URI = 'http://localhost:3000/result';

const SpotifyWebApi = require('spotify-web-api-node');

const express = require('express');
const app = express();
const port = 3000;

// http://localhost:3000/login
app.get('/login', function(req, res) {
  const scopes = ['user-read-private', 'user-read-email',
    'user-library-modify', 'user-library-read',
    'user-top-read', 'user-read-recently-played', 'user-read-currently-playing',
    'user-read-playback-state', 'user-modify-playback-state'];

  const spotifyApi = new SpotifyWebApi({
    clientId: keys.clientId,
    redirectUri: REDIRECT_URI
  });
  
  const authorizeUri = spotifyApi.createAuthorizeURL(scopes);
  res.redirect(authorizeUri);
});

app.get('/result', function(req, res) {
  const spotifyApi = new SpotifyWebApi({
    clientId: keys.clientId,
    clientSecret: keys.secret,
    redirectUri: REDIRECT_URI
  });

  spotifyApi.authorizationCodeGrant(req.query.code).then(
    function(data) {
      console.log('The token expires in ' + data.body['expires_in']);
      console.log('The access token is ' + data.body['access_token']);
      console.log('The refresh token is ' + data.body['refresh_token']);
  
      // Set the access token on the API object to use it in later calls
      spotifyApi.setAccessToken(data.body['access_token']);
      spotifyApi.setRefreshToken(data.body['refresh_token']);

      spotifyApi.getMyCurrentPlaybackState().then(
        function(data) {
          if(Object.keys(data.body).length == 0) {
            res.send('Not playing anything! <a href="/login">Refresh...</a>');
          }
          else {
            res.send(
              '<a href="/login">Refresh...</a><br/>' + 
              `Now playing ${data.body.item.name} on your ${data.body.device.name} ${data.body.device.type}`  +
              '<pre>' + JSON.stringify(data.body, null, 4) + '</pre>'
            );
          }
        },
        function(err) {
          res.send(JSON.stringify(err) + '<br/><a href="/login">again</a>');
        }
      )
    },
    function(err) {
      res.send(JSON.stringify(err) + '<br/><a href="/login">again</a>');
    }
  );

  console.log(req.query.code)

});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))