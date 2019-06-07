console.log("here there ");
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

require('./app/models/user-model').createUserTable();
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
next();
});

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
//session addition
// var RedisStore = require("connect-redis")(session)
//adding socket io
const clientsInfo = {};
var io = require('socket.io')(http);
var $ = require('jquery');
app.use(express.static(__dirname + '/public'));
//session SharedSession
app.io = io;
var session = require("express-session")({
  secret: "my-secret",
  resave: true,
  saveUnintialized: true
});
var sharedsession = require('express-socket.io-session');
/*
var sessionMiddleware = session({
  store: new RedisStore({}),
  secret: "keyboard cat",
});*/
app.use(session);
io.use(sharedsession(session,{
  autoSave: true
}));

app.get('/', function(req, res) {
    // res.send('<body>Hello world </body>');
    res.sendFile(__dirname + '/public/views/index.html');
    console.log("-----------Session succesfull!-------------");
    // console.log(req.session);
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


app.get('/PrivateChat', function(req, res) {

    // res.send('<body>Hello world </body>');
    // res.json({'name':req.session.userdata});

    // req.app.io.emit("Greeting", "Hello, there ");
    res.sendFile(__dirname + '/private_chat.html');

    req.app.io.emit('private_message',req.session.userdata, "Another Mother", "Corrna Behagerrrr", "/1.png");
    // req.userdata ="Biruk";
    /*console.log("PrivateChat is started!");
    console.log(clientsInfo);
    console.log("But the Id is");
    console.log(req.session.userdata);
    */

});

io.on('connection', function(socket, next) {
    console.log("next");
    console.log(next);
    console.log("session shake hand");
    console.log(socket.handshake.session);
    console.log("Hand Shake userData");
    console.log();
    if(socket.handshake.session.userdata !== undefined){
      console.log("Some One Already Logged In");
    }else{
      console.log("Ohh You are the first Ethiopian to Login");
    }
    socket.on('subscribe', function(room){
      //Joining a room which subscribed on clien
      //before just joining again let's check if they already
      //regitered and if there is a subscribed room Already
      console.log("------------subscribe-------------");
      console.log("list of rooms so far ");
      //checking if the room already existed
      if(io.sockets.adapter.rooms[room] == undefined){
        console.log("You the first one to subscribe a group called "+room);
      }else{
        console.log("Oww men...there is already a group name with name "+room);
        console.log("Look for other group, Good luck!! llz");
        socket.join(room);

        return false;
      }
/*
      ss(socket).on("file", function(stream, data){
        console.log("the stream is");
        console.log(stream);
        console.log("the data is ");
        console.log(data);
      });
  */
      console.log(io.sockets.adapter.rooms[room]);
      console.log("-----or---------");
      console.log(socket.rooms);

        console.log("Joining a room subscribed in client side");
        console.log("the_room ",room)

      console.log("the_id ",socket.id)
      console.log(room);
      socket.join(room);
      console.log("------------end-of-subscribe-------");
      return true;
    });
    socket.on("join_request", function(to,from, room,last_msg, clientImage){
      //here we also need the first message
      //yea.....I need the exact id here
      //let say to is the name_id of the socket, so I need to conver it into
      //id

      var too = Object.keys(clientsInfo).find(key => clientsInfo[key].name === to);
      console.log("clientsInfo");
      console.log(clientsInfo);
      console.log("too");
      console.log(too);
      console.log('socket id ', socket.id);
      console.log("server join request for "+to+" to join room: "+room);
      console.log("which gently requested from "+clientsInfo[socket.id].name);
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
    console.log("a user connected "+socket.id);
    console.log("ClientsINFO---------");
    console.log(clientsInfo);
    // io.emit('this', { will: 'be received y everyone'});
    socket.on("login", function(userdata){
      console.log("Loggning........");
      //Accept a login event with user's data
      socket.handshake.session.userdata = userdata;
      socket.handshake.session.save();
      console.log("data");
      console.log(socket.handshake.session);

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
    console.log("data");
    console.log(data);
    });

    ss(socket).on("file", function(stream, name){
      console.log(name.filename);
      var writeOpts = {highWaterMark: Math.pow(2,16)};
      //Here make a director for each message according to their room
      //Making directory
      mkdirp('/garbage2/', function(err) {
          if (err)
              console.log(err)
          else
              console.log("pow!")
      });

      var ws = fs.createWriteStream("public/file-uploaded/"+name.filename, writeOpts);
      stream.pipe(ws)
      ws.on("finish", function(){
        console.log("File Saved into the server");
      });
    });
      // console.log(socket.id);
    // console.log("Socket: "+socket);
    // console.log(io.sockets.sockets);

    socket.on('chat message', function(from, msg, clientImage) {
      io.emit('chat message', from,msg, clientImage);
      io.emit("typing", from, false);
      // console.log('I received a private message by ', from, ' saying ', msg);
  });
  socket.on('connect', function(client){
    io.emit("clientInfo", clientsInfo);

    console.log("Connect server side requested client");
    console.log(client);
  });

//This one is for file-uploading
socket.on('file-uploading', function(from, name, progress, size, id, roomName){
  console.log("from "+from);
  console.log("file-uploading with the name "+name);
  console.log("the progress "+progress);

  io.emit("file-uploading", from, name, progress, size, id, roomName);

});
socket.on('image-uploaded', function(from, filename, roomName){
  console.log("file uploaded from "+from);
  console.log("a file with the name "+filename);
  console.log("ROOOOOOOOOM NAME"+roomName);
  io.emit('image-uploaded', from , filename, roomName);
});


// Typing detection

socket.on("typing", function(msg){
      let d = msg;
      // console.log(msg +" is typing.....");
      //Broadcast who is typing
      io.emit("typing", d, true);
});

socket.on("private_message", function(from, to, msg, clientImage){
  //This will broadcast the message to particular client (to)
  console.log("Server side private_message");
  console.log("Going to send "+msg+" from "+from+" to "+to);
  // console.log("list of rooms");
  // console.log(io.sockets.adapter.rooms[Object.keys(clientsInfo)[1]]);
  console.log("Clients info");
  socket.join(to)
  // console.log(clientsInfo);
  // io.sockets.in(to).emit("private_message", from, msg, clientImage);

});



socket.on("room-message", function(data){
      console.log("---------on room-message---------------");
      //Here it would be awesome if i could be able to
      //other socket to subscribe to a room;
      console.log("Checking if room exists server");
      console.log("what is the sent data");
      console.log(data);
      console.log("list of rooms");
      console.log(socket.rooms);
      console.log(data.room in socket.rooms);
      if(data.room in socket.rooms){
        console.log("Yea, there is exist a room: "+data.room);
      }else{
        console.log("sorry there is no room called "+data.room);
        console.log("perhaps you need to subscribe one");
      }
      console.log("Room message sent to server");
      console.log("data.room");
      console.log(data.room);
      console.log("data.message");
      console.log(data.message);
      io.sockets.to(data.room).emit("room-message",
      { room: data.room,
        message: data.message,
        clientImage:data.clientImage,
        sender: data.sender
      });

      /*
      socket.broadcast.to(data.room).emit("room-message",
      { message: data.message} );
      io.sockets.in(data.room).emit("room-message",
      { message: data.message} );
*/
    console.log("------------end-of-room-message-----------------");
});

  socket.on('clientInfo', function(old, newOne, clientImage){
    console.log("The INFO old "+old);
    console.log("The INFO new "+newOne);
    console.log("The very clientImage is "+clientImage);
    //Here I'm making the clientsInfo an object which
    //will store the Name and the Image
    clientsInfo[old] = {
      name: newOne,
      clientImage: clientImage
    };
    console.log("clientsInfo UPDATED");
    console.log(clientsInfo);
    io.emit("clientInfo", clientsInfo, Object.keys(io.sockets.sockets));
    //Emitting the new connected socket
    io.emit("FreshUser", newOne);
  })

  socket.on('disconnect', function(data){
    console.log("some one disconnected "+data);
    io.emit("list_connected", Object.keys(io.sockets.sockets));
    io.emit("clientInfo", clientsInfo, Object.keys(io.sockets.sockets));
    // io.emit("FreshUser", newOne);

  })


});
//Emitting event to io

console.log("Client count " + io.engine.clientsCount);

http.listen(3000, function() {
    console.log("Listening to 3000 port");
    console.log("I swear to God");
})
