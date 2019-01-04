var express = require('express');
var path = require('path');
var engines = require('ejs');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser')
var uri = 'mongodb://so1234:so1234@ds147684.mlab.com:47684/iot';
var app = express();

var crypto = require('crypto');
mongoose.connect(uri);
var db = mongoose.connection;
var  secret = "asdfghjklpoiuytrewqzxcvbnm"
db.on('error', console.error.bind(console, 'connection error:'));
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
app.use(cookieParser());

var check = function(req, res){
  if(req.cookies.auth !== undefined){
    return true;
  }
  else{
      return false;
    }
}

app.get('/', function(req, res){
  if(req.cookies.auth === undefined){
    res.render('login',{
      err: false
    });
  }
  else{
    jwt.verify(req.cookies.auth , secret , (err, decode) =>{
      if(!err){
        var usre1;
        userModel.find({username: decode}, (err, result) => {
          if(err){
            res.redirect('/login');
          }
            var user1 = result[0];
            res.render('dashboard', {user1});
        });
      }
      else{
        res.render('login',{
          err: false
        });
      }
    })
  }
});


app.get('/logout', function(req, res){
  res.clearCookie("auth");
  res.render('login',{
    err: false
  });
});

app.get('/login', function(req, res){
  if(check(req, res)){
    res.redirect('/');
  }
  else{
    res.render('login', {
      err: false
    });
  }
});
app.get('/login/err', function(req, res){
  if(check(req, res)){
    res.redirect('/');
  }
  else{
    res.render('login', {
      err: true
    });
  }
});
app.get('/signup', function(req, res){
  if(check(req, res)){
    res.redirect('/');
  }
  else{
    res.render('signup', {
      err: false
    });
  }
});

app.get('/signup/err', function(req, res){
  if(check(req, res)){
    res.redirect('/');
  }
  else{
    res.render('signup', {
      err: true
    });
  }
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
      var jwtToken = jwt.sign(user, secret);
      res.cookie('auth', jwtToken);
      res.render('dashboard', {user1});
    }
    else{
      res.redirect('/login/err');
    }
  });
});


app.listen(5000, function(){
  console.log('server started on port 5000...');
});
