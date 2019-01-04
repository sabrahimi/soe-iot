var express = require('express');
var path = require('path');
var engines = require('ejs');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var uri = 'mongodb://so1234:so1234@ds147684.mlab.com:47684/iot';
var app = express();
var crypto = require('crypto');
mongoose.connect(uri);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
var secret = '0';
var loggedin = [];
var usersSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
    },
    users: Array,
    password: String,
    channel: String
});

var userModel = mongoose.model('users', usersSchema);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'statics')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({secret: 'ssshhhhh'}));


app.get('/', function(req, res){
  res.render('login',{
    err: false
  });
});

app.get('/', function(req, res){
  res.render('login',{
    err: false
  });
});

app.get('/logout', function(req, res){
  res.render('login',{
    err: false
  });
});

app.get('/login', function(req, res){
  res.render('login', {
    err: false
  });
});
app.get('/login/err', function(req, res){
  res.render('login', {
    err: true
  });
});
app.get('/signup', function(req, res){
  res.render('signup', {
    err: false
  });
});

app.get('/signup/err', function(req, res){
  res.render('signup', {
    err: true
  });
});

app.post('/signup/user', function(req, res){
  var newUser = new userModel({
    username: req.body.username,
    users: [],
    password: req.body.password,
    channel: req.body.channelId
  });
  newUser.password = crypto.createHash('md5').update(newUser.password).digest("hex");
  newUser.users = req.body.users;
  newUser.save(function(err){
    if(err){
      delete newUser;
      res.redirect('/signup/err');
    }
    else{
      res.redirect('/');
    }
  });
});

app.post('/login/user', function(req, res){
  var user = req.body.username;
  var pass = req.body.password;
  var valid = false;
  pass = crypto.createHash('md5').update(pass).digest("hex");
  userModel.find({username: user}, (err, result) => {
    if(err){
      res.redirect('/login/err');
    }
    else if(result[0] !== undefined){
      if(result[0].username == user){
        if(result[0].password == pass){
          valid = true;
        }
      }
    }
    if(valid){
      var user1 = result[0];
      var token = jwt.sign({ user1 }, secret);
      res.render('dashboard', {user1, token});
    }
    else{
      res.redirect('/login/err');
    }
  });
});

app.get('/dashboard', function(req, res){
  res.render('dashboard', {token: undefined});
  console.log(req.headers);
});

app.listen(5000, function(){
  console.log('server started on port 5000...');
});
