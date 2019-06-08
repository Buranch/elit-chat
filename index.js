var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var ss = require('socket.io-stream');
var path = require('path');
var bodyParser = require('body-parser');
var fs = require("fs");
var mkdirp = require('mkdirp')
var chatModel = require('./app/models/chat-model');
require('./mysql');
var dbfunc = require('./config/db-function');
const authenticService = require('./app/services/authentic.service');




dbfunc.connectionCheck.then((data) =>{
  console.log(data);
}).catch((err) => {
   console.log(err);
});

// Initializing Database
require('./app/models/user-model').initializeMysql();
// Setting up the cors
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
next();
});

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
const clientsInfo = {};
var io = require('socket.io')(http);
app.use(express.static(__dirname + '/public'));
//session SharedSession
app.io = io;
var session = require("express-session")({
  secret: "my-secret",
  resave: true,
  saveUnintialized: true
});
var sharedsession = require('express-socket.io-session');

app.use(session);
io.use(sharedsession(session,{
  autoSave: true
}));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/views/index.html');
});

app.post('/login', function(req, res) {
  console.log('login');
  var loginData = {username: req.body.username, password: req.body.password};
  authenticService.authentic(loginData).then((data) => {
    if(data) {
        if(data.length > 0) {
          res.json({
            "success":true,
            "data":data
          });
        } else {
          res.json({
            "success":false,
            "data":data
          });
        }
     }
   }).catch((err) => {
     res.json(err);
   });
})


app.post('/signup', function(req, res) {
  console.log('req.body', req.body.username);
  var signUpData = {username: req.body.username, password: req.body.password, clientImage: req.body.clientImage};
  authenticService.signup(signUpData).then((data) => {
    if(data) {
       res.json({
         "success":true,
         "data":data
       });
     }
   }).catch((err) => {
     res.json(err);
   });
});


app.post('/message', function(req, res){
  console.log('adding message');
  chatModel.addMessage({convId: req.body.convId, author: req.body.author, body: req.body.body, timestamp: req.body.timestamp})
  .then(data => res.send({
    success: true,
    data
  }))
  .catch(err => res.send({ success: false, error: err}));

});

app.get('/userinfo', function(req, res) {
  authenticService.getUserInfoByUsername(req.query.username)
  .then(data => res.send({
    success: true,
    data
  }))
  .catch(err => res.send({ success: false, error: err}));

});

app.post('/conv', function(req, res){
  console.log('creatiing conv', req.body);
  chatModel.createConv({id: req.body.id, pass_1: req.body.pass_1, pass_2: req.body.pass_2 })
  .then(data => res.send({
    success: true,
    data
  }))
  .catch(err => res.send({ success: false, error: err}));
})

app.get('/conv', function(req, res){
  console.log('getting conv username', req.query.username);
  chatModel.getConvsByUsername(req.query.username)
  .then(data => res.send({
    success: true,
    data
  }))
  .catch(err => res.send({ success: false, error: err}));
})


app.get('/message', function(req, res){
  console.log('getting conv', req.query.convid);
  chatModel.getMessagesByConv(req.query.convid)
  .then(data => res.send({
    success: true,
    data
  }))
  .catch(err => res.send({ success: false, error: err}));
})

io.on('connection', function(socket, next) {
    if(socket.handshake.session.userdata !== undefined){
      console.log("Some One Already Logged In");
    }else{
      console.log("Ohh You are the first User to Login");
    }
    socket.on('subscribe', function(room){
      //Joining a room which subscribed on clien
      //before just joining again let's check if they already
      //regitered and if there is a subscribed room Already
      //checking if the room already existed
      if(io.sockets.adapter.rooms[room] == undefined){
        console.log("You the first one to subscribe a group called "+room);
      }else{
        // there is already a group name with name "room";
        socket.join(room);
        return false;
      }
      socket.join(room);
      return true;
    });
    socket.on("join_request", function(to,from, room,last_msg, clientImage){
      //here we also need the first message
      //yea.....I need the exact id here
      //let say to is the name_id of the socket, so I need to conver it into
      //id
      var too = Object.keys(clientsInfo).find(key => clientsInfo[key].name === to);
      io.sockets.in(too).emit("join_request", room, clientsInfo[socket.id].name, last_msg, clientImage);
      var data = {room: room,
          message: last_msg,
          clientImage:clientImage,
          sender:from
      };
      io.sockets.in(too).emit("room-message", data);

  })
    //Emitting an event to room-1
    //Here you can control the events comming from the client side
    //And you can also broadcast message for particular socket or all.
    socket.on("login", function(userdata){
      console.log("Loggning........");
      //Accept a login event with user's data
      socket.handshake.session.userdata = userdata;
      socket.handshake.session.save();
    });
    socket.on("logout", function(socket){
      //Accept a login event with user's data
      if(socket.handshake.session.userdata){
        delete socket.handshake.session.userdata;
        socket.handshake.session.save();
      }

    });
    io.emit("list_connected", Object.keys(io.sockets.sockets), clientsInfo);

    socket.on('hello', function(data){
    console.log(data);
    });

    ss(socket).on("file", function(stream, name){
      console.log(name.filename);
      var writeOpts = {highWaterMark: Math.pow(2,16)};
      //Here make a director for each message according to their room
      //Making directory
      var ws = fs.createWriteStream("public/file-uploaded/"+name.filename, writeOpts);
      stream.pipe(ws)
      ws.on("finish", function(){
        console.log("File Saved into the server");
      });
    });
    socket.on('chat message', function(from, msg, clientImage) {
      io.emit('chat message', from,msg, clientImage);
      io.emit("typing", from, false);
  });
  socket.on('connect', function(client){
    io.emit("clientInfo", clientsInfo);
  });

//This one is for file-uploading
socket.on('file-uploading', function(from, name, progress, size, id, roomName){
  io.emit("file-uploading", from, name, progress, size, id, roomName);

});
socket.on('image-uploaded', function(from, filename, roomName){
  io.emit('image-uploaded', from , filename, roomName);
});


// Typing detection

socket.on("typing", function(msg){
      let d = msg;
      //Broadcast who is typing
      io.emit("typing", d, true);
});

socket.on("private_message", function(from, to, msg, clientImage){
  //This will broadcast the message to particular client (to)
  socket.join(to)
});



socket.on("room-message", function(data){
      //Here it would be awesome if i could be able to
      //other socket to subscribe to a room;
      // Checking if room exists server
      // what is the sent data
      
      if(data.room in socket.rooms){
        // There is exist a room: data.room
      }else{
        console.log("sorry there is no room called "+data.room);
        console.log("perhaps you need to subscribe one");
      }
      io.sockets.to(data.room).emit("room-message",
      { room: data.room,
        message: data.message,
        clientImage:data.clientImage,
        sender: data.sender
      });
});

  socket.on('clientInfo', function(old, newOne, clientImage){
     //Here I'm making the clientsInfo an object which
    //will store the Name and the Image
    clientsInfo[old] = {
      name: newOne,
      clientImage: clientImage
    };
    io.emit("clientInfo", clientsInfo, Object.keys(io.sockets.sockets));
    //Emitting the new connected socket
    io.emit("FreshUser", newOne);
  })

  socket.on('disconnect', function(data){
    console.log("some one disconnected "+data);
    io.emit("list_connected", Object.keys(io.sockets.sockets));
    io.emit("clientInfo", clientsInfo, Object.keys(io.sockets.sockets));
  })


});

http.listen(3000, function() {
    console.log("Listening to 3000 port");
})
