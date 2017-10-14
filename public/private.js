$(document).ready(function() {
  fetch("\PrivateChat").then(
    res => {
      console.log("Fetched express ");
      console.log(res);

    }
  );
  console.log("Hell, Yeah")
  var socket = io();

  socket.io.engine.id = "Biruk";
  console.log("handshake----------sessoion");
  console.log(socket.handshake);
  console.log("Id: "+socket.io.engine.id);
  // socket.emit('private_message',req.session.userdata, "Another Mother", "Corrna Behagerrrr", "/1.png");


  //The arguments are the socket.id,receving_id,the_msg, the_img
  socket.on("private_message", function(from, msg , clientImage){
    console.log("Private Message Arrived from: "+from);
    console.log("Private Message Arrived saying: "+msg);
    $("#myCard").css("background-color", "red");
  });
});
