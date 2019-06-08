var user_name = "Null";

$(document).ready(function() {
  openModal(1);
  var clientsInfo = {};
  var roomJoined = {};

  var clientImage;
  var myImage = null;
  var currentlyChatting = "myMessages";
  var socket = io();

  //Join my Team requested
  $("#sent_img").mouseenter(function() {
    $("#sent_img").css("background-color", "dimgrey");
  });

  $("#sent_img").mouseleave(function() {
    $("#sent_img").css("background-color", "#8c57c3");
  });
  //This is

  socket.on("join_request", function(
    theRoom,
    requester,
    last_msg,
    clientImage
  ) {
    socket.emit("subscribe", theRoom);

    roomJoined[theRoom] = {
      name: requester,
      clientImage,
      last_msg: last_msg
    };

    joinedRoomChanged(theRoom);
 
  });
  function getReadableFileSize(fileSizeInBytes) {
    var i = -1;
    var byteUnits = ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    do {
      fileSizeInBytes = fileSizeInBytes / 1024;
      i++;
    } while (fileSizeInBytes > 1024);
    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
  }
  function prepareFileUploadingUI(name, size, sender, roomName) {
    $("#" + roomName)
      .find("#intro_chat")
      .css("display", "none");

    var lastIndex = name.lastIndexOf(".");

    var splited_name =
      name.substring(0, lastIndex).substring(0, 24) +
      "." +
      name.substring(lastIndex, name.length);
    var splited_name_own =
      name.substring(0, lastIndex).substring(0, 12) +
      "." +
      name.substring(lastIndex, name.length);
    var uploaded_div_own =
      `<div class="list-group-item active noselect" id="myCard-own">
                              <div>
                                <a href="/file-uploaded/` +
      name +
      `" download><img src="/download.png"></a>

                              <p class="list-group-item-text" style="float: left;text-align: left;/* top: 41px; */padding-right: 16px;margin-top: 16px;">` +
      splited_name_own +
      `<br/><span style="
                             float: right;">` +
      getReadableFileSize(size) +
      `</span></p>
                              </div>
                            </div>`;

    var uploaded_div_other =
      `
                  <div style="float:left;">,
                  <div style="float: left;margin-right:5px;">
                      <img src="/1.png" alt="..." class="img-circle img-responsive" id="img-circle_chat" style="width: 39px">
                    </div>
                    <div class="list-group-item active noselect" id="myCard">
                                    <a href="/file-uploaded/` +
      name +
      `" download> <img src="/download.png" style="float: left;"></a>
                                    <p style="float: left;margin-left: 14px; margin-top: 3px;">` +
      splited_name +
      `<br><span style="float: left">` +
      getReadableFileSize(size) +
      `</span></p>
                                  </div></div>`;
    if (sender == socket.io.engine.id) {
      $("#" + roomName).append(uploaded_div_own);
    } else {
      $("#" + roomName).append(uploaded_div_other);
    }
    var objDiv = document.getElementById(roomName);

    $("#" + roomName).animate(
      {
        scrollTop: objDiv.scrollHeight
      },
      100
    );
  }
  function startUploading(name, id, size, roomName) {
    //Here it should be restricted for myMessages
    //The function can take the roomAs an id and append it there

    $("#" + roomName)
      .find("#intro_chat")
      .css("display", "none");

    var lastIndex = name.lastIndexOf(".");
    var splited_name_own =
      name.substring(0, lastIndex).substring(0, 12) +
      "." +
      name.substring(lastIndex, name.length);

    var uploading_div =
      `<div id="` +
      (id + 1) +
      `"><div class="list-group-item active noselect" id="myCard-own">
                            <div>
                              <p style="float: left float: left; color: lightcyan; font-weight: 700; margin-bottom: 3px;">Uploading.. <span id="` +
      id +
      `"><span>
                            <p class="list-group-item-text" style="color: azure;float: left;text-align: left;/* top: 41px; */padding-right: 16px;">` +
      splited_name_own +
      `: <br/><span style="
                           float: right;">` +
      getReadableFileSize(size) +
      `</span></p>
                            </div>
                          </div></div>`;

    //Not only myMessages
    $("#" + roomName).append(uploading_div);
    var objDiv = document.getElementById(roomName);
    //animating scrolltop
    // objDiv.scrollTop= objDiv.scrollHeight;
    $("#myMessages").animate(
      {
        scrollTop: objDiv.scrollHeight
      },
      100
    );
  }
  $("#attach").change(function(e) {
    //Here We can emit the 'file-uploading' event to server
    //which tells receiver that the file is uploading..while for the sender
    //can see the progress

    var file = e.target.files[0];
    var stream = ss.createStream();
    var readOpts = { highWaterMark: Math.pow(2, 16) };

    var blobStream = ss.createBlobReadStream(file, readOpts);
    var size = 0;
    // let start = null;
    //Here We can start the file-uploading to server
    //which notify the other user that the file is being UPLOADED
    var uniqueUploadId = Date.now();
    var fileType = file["type"];
    //For file don't the uploading

    var ValidImageTypes = ["image/gif", "image/jpeg", "image/png"];
    if ($.inArray(fileType, ValidImageTypes) < 0) {
      // invalid file type code goes here.
      startUploading(file.name, uniqueUploadId, file.size, currentlyChatting);
    }
    //you can create function to display the current uploading
    blobStream.on("data", function(chunk, enc, next) {
      //From this I can send the progress
      size += chunk.length;

      var progress = Math.floor((size / file.size) * 100) + "%";
      if ($.inArray(fileType, ValidImageTypes) < 0) {
        // invalid file type code goes here.
        //The roomName should be passed as an argument
        socket.emit(
          "file-uploading",
          socket.io.engine.id,
          file.name,
          progress,
          file.size,
          uniqueUploadId + 1,
          currentlyChatting
        );
      }
      //Here I'll update the uploading content;
      //of the ID uniqueId
      $("#" + uniqueUploadId).text(progress);
      console.log(progress);
    });
    blobStream.on("end", function() {
      //Check the extension
      //Here I will finish what startUploading started by really displaying the file
      //This file-uploaded should be img uploaded
      //First check if the file is in image format

      if ($.inArray(fileType, ValidImageTypes) > 0) {
        // invalid file type code goes here.
        console.log("Haha this one is an image");
        //it should have a <from> and <to> argument
        socket.emit(
          "image-uploaded",
          socket.io.engine.id,
          file.name,
          currentlyChatting
        );
      } else {
        console.log("elsed");
        //  prepareFileUploadingUI(file.name, size, from, uniqueUploadId);
      }
      console.log("Uploading done Fished!!");
    });
    blobStream.pipe(stream);
    ss(socket).emit("file", stream, { filename: file.name }, currentlyChatting);
  });

  socket.on("file-uploading", function(
    from,
    filename,
    progress,
    size,
    id,
    roomName
  ) {
    if (progress == "100%") {
      console.log("Invoking prepareFileUploadingUI");
      $("#" + id).remove();
      prepareFileUploadingUI(filename, size, from, roomName);
    }
  });
  //Going to render the uploaded image into the #myMessage div
  socket.on("image-uploaded", function(from, filename, roomName) {
    //I will append the image into the corresponsing room
    $("#myMessages")
      .find("#intro_chat")
      .css("display", "none");

    let myFloat = "";
    if (from == socket.io.engine.id) {
      myFloat = "image-uploaded-own";
    } else {
      myFloat = "image-uploaded";
    }
    var myImg = new Image();
    var $img = $("<img download/>");
    $img.attr("src", "/file-uploaded/" + filename);
    $img.addClass(myFloat);
    $img.addClass("img-responsive");
    myImg.onload = function() {
      console.log(this.width + "x" + this.height);
      if (this.width < this.height) {
        $img.css("height", "62%");
      } else {
        $img.css("height", "46%");
      }
    };
    myImg.src = "/file-uploaded/" + filename;

    console.log(myImg.clientWidth);
    /*
      var one_own = $([
          `<img src="/file-uploaded/`+filename+`" alt="..." id="uploaded-img" class="img-responsive img-circle"/>`].join("\n"));
*/

    $("#" + roomName).append($img);
    // $("#myMessages").append($img);
    var objDiv = document.getElementById(roomName);
    console.log("success!!");
    //animating scrolltop
    // objDiv.scrollTop= objDiv.scrollHeight;
    $("#" + roomName).animate(
      {
        scrollTop: objDiv.scrollHeight
      },
      100
    );
    console.log("appended the img");
  });

  socket.on("clientInfo", function(clients, lists) {
    var mySet = new Set(lists);
    $("ul").empty();

    mySet.forEach(function(id) {
      if (clients[id] == undefined) {
        console.log("you should stop it undefined");
        return;
      } else {
        console.log("Not undefined ");
        console.log(clients[id]);
      }
      //Here provide each li with unique id
      $("ul").append(
        `<a href="#" ><li id="for_` +
          clients[id].name +
          `"> ` +
          clients[id].name +
          `</li></a>`
      );
      $("#for_" + clients[id].name).click(function() {
        //Here attach the createNewJoinedRoom
        var too = Object.keys(roomJoined).find(
          key => roomJoined[key].name === clients[id].name
        );
        if (too == undefined) {
          createNewJoinedRoom(clients[id].name);
        }
      });
    });
    clientsInfo = clients; //This is the name of the client clients[id].name
  });
  socket.on("FreshUser", function(data) {
    $("#joined_now").html("(" + data + " joined now!)");
    $("#joined_now").toggle("fade", 1500);
    $("#joined_now").toggle("fade", 1500);
    $("#joined_now").hide("fade");
  });

  //updating the last msg of the div's
  function updateTheLastMsg(theRoom, msg, sender) {
    console.log("_____updateTheLastMsg__________");
    //chat_w_Ahaha
    //chat_w_ + receiver
    //Here if the currentlyChatting is not this room
    //add couple of class
    if (sender == socket.io.engine.id) {
      sender = "You";
    }
    $("#chat_w_" + roomJoined[theRoom].name)
      .find("p")
      .html(sender + ": " + msg.substring(0, 25) + "...");
    // $("#chat_w_B").find("p").html("hell")
    //give as the receiver
    if (currentlyChatting !== theRoom) {
      $("#chat_w_" + roomJoined[theRoom].name)
        .find("h4")
        .addClass("rooms_notified_header");
      $("#chat_w_" + roomJoined[theRoom].name)
        .find("p")
        .addClass("rooms_notified_p");
    }
  }

  function appendInChatRoom(id, msg, sender) {
    // If the header need here it is
    // `<h4 class="list-group-item-heading">` + id + `</h4>`,
    var theCard = "myCard-room";
    if (sender == socket.io.engine.id) {
      theCard = "myCard-own";
    }

    var one = $(
      [
        `<div class="list-group-item active noselect" id="` +
          theCard +
          `">
            `,
        `<p class="list-group-item-text" style="color:azure;">` + msg + `</p>`,
        `</div>`
      ].join("\n")
    );
    $("#" + id)
      .find("#intro_chat")
      .css("display", "none");
    $("#" + id).append(one);
    var objDiv = document.getElementById(id);

    $("#" + id).animate(
      {
        scrollTop: objDiv.scrollHeight
      },
      100
    );
    // Here I'm trying to send send it privately
    console.log("-------end appendInChatRoom---------");
  }

  socket.on("room-message", function(data) {
    if (data.message == "") {
      return;
    }
    //Here I also need to update my joimedRoom object

    //Here render the data in room-message panel
    //The data should have the room name
    //The message
    var thisRoom = data.room;

    roomJoined[thisRoom].last_msg = data.message;
    //Haha, this wasn't the smartest idea
    // joinedRoomChanged(thisRoom);
    //In order to alter the last_msg on the joinedRoom div's
    //I need to find them on id and update the html()
    //Here i can also append the you and the other guy
    updateTheLastMsg(thisRoom, data.message, data.sender);

    var one = $(
      [
        `<div class="list-group-item active noselect" id="room_message_card">
                <div class="notify_img">
                    <img src="contacts/` +
          data.clientImage +
          `" alt="..." class="img-circle img-responsive" id="img-circle_chat">
                </div>
                <div style="float: left; padding-left: 14px;">
                    <h4 class="list-group-item-heading">` +
          data.sender +
          `</h4>
                    <p class="list-group-item-text" style="padding: 7px;">` +
          data.message.substring(0, 18) +
          `</p>
                </div>
                <div>
                  <img src="/notify_2.png" alt="..." class="img-circle img-responsive" id="img-circle_chat">
                </div>
            </div>
        </div>`
      ].join("\n")
    );

    appendInChatRoom(data.room, data.message, data.sender);

    one.css("display", "none");
    $("#myRoomMessages").append(one);
    var objDiv = document.getElementById("myRoomMessages");

    $("#myRoomMessages").animate(
      {
        scrollTop: objDiv.scrollHeight
      },
      100
    );
    one.toggle("slide", { direction: "right" }, 200);
  });

  //Client side private message
  //Will render the message into myMessages div with different colour
  socket.on("private_message", function(from, msg, clientImage) {
    // console.log("Private Message Arrived from: "+from);
    // console.log("Private Message Arrived saying: "+msg);
  });
  socket.on("connect", function() {
    socket.emit("news", socket.io.engine.id);
    return socket.io.engine;
  });
  $("#login_here").click(function() {
    $("#pass-2").css("display", "none");
    $("#signed_button").text("Login");
    $("#profile-placeholder-wrapper").css("opacity", 0);
  });

  function signupHandler() {
    // prepare the object send API request
    // handle the response, either successful or error
    // may be do something with socket

    var username = $("#username").val();
    var pass1 = $("#pass-1").val();
    var pass2 = $("#pass-2").val();

    if (!$("input[name=fb]:checked").val()) {
      $("#validate_error").css("display", "block");
      $("#validate_error").text(
        "Please select one profile picture and try again"
      );
      return console.log("Please select one pics");
    }

    if (pass1 === pass2) {
      // continue registerign
      $.ajax({
        method: "POST",
        url: "http://localhost:3000/signup",
        data: {
          username,
          password: pass1,
          clientImage: $("input[name=fb]:checked").val() || "boy"
        }
      }).done(function(msg) {
        console.log("server response ", msg);
        // alert( "Data Saved: " + msg );
        if (msg.success) {
          console.log("Successfully Registered");
          console.log("login here");
          $("#validate_error").css("display", "block");
          $("#validate_error").text(
            username + " is successfully registered, Please Login Now"
          );
          setTimeout(function() {
            $("#pass-2").css("display", "none");
            $("#pass-1").val("");
            $("#username").val("");
            $("#signed_button").text("Login");
          }, 200);
        } else {
          $("#validate_error").css("display", "block");
          $("#validate_error").text(
            "Registeration is failed, Please Try again"
          );
        }
      });
    } else {
      // show error
      $("#validate_error").css("display", "block");
      $("#validate_error").text("Password Don't Match");
    }
  }

  function prepareChatWindow(clientImage) {
    clientImage = clientImage;
    myImage = clientImage;
    //Here i will get the name value
    // hidden the current background and light up the container
    // it's will be cool if it has some interval
    // and show the online status
    socket.emit("login", socket.io.engine.id);

    setTimeout(function() {
      let user_name = $("#username").val();
      // $("#online_status").html(user_name);
      $("#profile_name").html(user_name);

      $("#megarja").remove();
      $("#myModal").css("display", "none");
      $(".container").css("display", "block");
      $("#username_display").css("display", "block");
      $("#hello").html("Hello, " + user_name);
      $("#intro_image").attr("src", "contacts/" + clientImage);
      $("#profile_pic").attr("src", "contacts/" + clientImage);

      var old = socket.io.engine.id;
      socket.io.engine.id = user_name;
      socket.emit("clientInfo", old, socket.io.engine.id, clientImage);
      $("#input_area").val("");
      $("#online_status").html("Master Chat");
      $("#current_chat_img").attr("src", "/main_chat.png");
      getConvsByUsername(user_name);
    }, 500);
  }

  function loginHandler() {
    var username = $("#username").val();
    var pass1 = $("#pass-1").val();

    $.ajax({
      method: "POST",
      url: "http://localhost:3000/login",
      data: { username, password: pass1 }
    }).done(function(msg) {
      console.log("server response ", msg);
      // alert( "Data Saved: " + msg );
      if (msg.success) {
        console.log("Successfully Logged In");
        $("#validate_error").css("display", "block");
        $("#validate_error").text(username + " is successfully Login");
        prepareChatWindow(msg.data[0].clientImage + ".png");
      } else {
        $("#validate_error").css("display", "block");
        $("#validate_error").text("Login failed, Please Try again");
      }
    });
  }

  $("#signed_button").click(function() {
    if ($("#signed_button").text() === "Login") {
      return loginHandler();
    } else {
      return signupHandler();
    }
  });

  socket.on("news", function(data) {
    name = data;
  });

  $("#input_area").on("input", function() {
    //Typing
    socket.emit("typing", socket.io.engine.id);
    $("#" + socket.io.engine.id).css("display", "inline");
  });

  socket.on("typing", function(name, myBool) {
    //Find and render who is typing on the list
    if (myBool) {
      console.log("Continue typing........" + name);
    } else {
      // console.log("CRuSH THE FADING --------Typing for "+name);
      $("#" + name).hide("fade");
      $("#" + name).css("color", "ghostwhite");

      return;
    }
    $("li:contains(" + name + ")").html(
      name + " <span id=" + name + ' class= "typing"> is typing...</span>'
    );
    $("#" + name).css("display", "inline");
    $("#" + name)
      .delay(800)
      .fadeOut(400);
    $("#" + name).css("color", "darkgrey");
  });
  $(document).keypress(function(e) {
    if (e.which == 13) {
      $("#sent_img").trigger("click");
      e.preventDefault();
    }
  });
  $("#sent_img").click(function() {
    console.log("-------------form-submittion--------------------");
    console.log($("#input_area").val());
    if (
      $("#input_area")
        .val()
        .trim() === ""
    ) {
      $("#message_error").css("display", "inline");
      $("#message_error").html("(The message is empty!)");
      return;
      // return false;
    } else if (
      $("#input_area").val() !== "" &&
      currentlyChatting == "myMessages"
    ) {
      //This means the message is for the master-room
      $("#message_error").css("display", "none");
      //This happens when the currentlyChatting is myMessages
      socket.emit(
        "chat message",
        socket.io.engine.id,
        $("#input_area").val(),
        clientImage
      );
      $("#input_area").val("");
      $("#room_create").val("");
      return;
    } else {
      //Just only sends the message
      $("#message_error").css("display", "none");

      //after gotting the receving client
      //Here I will ask for the receiver to join my room
      // "join_request", "theReceiverId", "the-room-name"
      //sending join requested
      //Keep rooms that this socket connected
      let receiver = roomJoined[currentlyChatting].name;
      createNewJoinedRoom(receiver);
    }
    $("#input_area").val("");
    $("#room_create").val("");
    return;
  });

  //The joinedRoomChanged

  async function joinedRoomFromDB(room, id) {
    // room must've .name
    var one =
      `<div class="one_room_joined" id="chat_w_` +
      room.name +
      `">
          <img src="contacts/` +
      room.clientImage +
      `" class="img-circle img-responsive" style="width: 72px; opacity: 1; float: left; margin-right: 11px; font-weight: bold" />
          <h4 style="margin-bottom: 4px; font-weight: 600">` +
      room.name +
      `</h4>
          <p style="  font-style:italic;font-size: small; font-family: cursive;">Starting chatting with ` +
      room.name +
      `</p>
      </div>
      `;
    if (document.getElementById("chat_w_" + room.name) == null) {
      $(".roomJoined_display").append(one);
    }

    socket.emit("subscribe", room.id);

    roomJoined[room.id] = {
      name: room.name,
      clientImage: room.clientImage,
      last_msg: "from DB"
    };

    joinedRoomChanged(room.id);
    createUniqueDiv(room.id);
    // Update the Last Message of the conv
    // here you can render the messages
    await getMessagesByConv(room.id).then(data => {
      data = data.data;
      data.forEach((el, index) => {
        if (index === data.length - 1) {
          updateTheLastMsg(room.id, el.body, el.author);
        }
        appendInChatRoom(el.convId, el.body, el.author);
      });
    });

    $("#chat_w_" + room.name).click(function() {
      joinedRoomClick(room.id);
      $("#chat_w_" + room.name)
        .find("p")
        .removeClass("rooms_notified_p");
      $("#chat_w_" + room.name)
        .find("h4")
        .removeClass("rooms_notified_header");

      $("#chat_w_" + room.name).css("background-color", "lightgray");
      $("#chat_w_" + room.name)
        .siblings()
        .css("background-color", "#eef2f1");
      currentlyChatting = room.id; //This is the current room;
      $("#online_status").html(room.name);
      $("#current_chat_img").attr("src", "contacts/" + room.clientImage);
    });
  }

  function joinedRoomChanged(room) {
    console.log(document.getElementById("chat_w_" + roomJoined[room].name));
    console.log(roomJoined[room]);
    var one =
      `<div class="one_room_joined" id="chat_w_` +
      roomJoined[room].name +
      `">
          <img src="contacts/` +
      roomJoined[room].clientImage +
      `" class="img-circle img-responsive" style="width: 72px; opacity: 1; float: left; margin-right: 11px; font-weight: bold" />
          <h4 style="margin-bottom: 4px; font-weight: 600">` +
      roomJoined[room].name +
      `</h4>
          <p style="  font-style:italic;font-size: small; font-family: cursive;">Starting chatting with ` +
      roomJoined[room].name +
      `</p>
      </div>
      `;
    if (document.getElementById("chat_w_" + roomJoined[room].name) == null) {
      $(".roomJoined_display").append(one);
    }
    $("#chat_w_" + roomJoined[room].name).click(function() {
      joinedRoomClick(room);
      $("#chat_w_" + roomJoined[room].name)
        .find("p")
        .removeClass("rooms_notified_p");
      $("#chat_w_" + roomJoined[room].name)
        .find("h4")
        .removeClass("rooms_notified_header");

      $("#chat_w_" + roomJoined[room].name).css(
        "background-color",
        "lightgray"
      );
      $("#chat_w_" + roomJoined[room].name)
        .siblings()
        .css("background-color", "#eef2f1");
      currentlyChatting = room; //This is the current room;
      $("#online_status").html(roomJoined[room].name);
      $("#current_chat_img").attr(
        "src",
        "contacts/" + roomJoined[room].clientImage
      );
    });
  }

  //Trying to makes sense our of the room cilck
  $("#mainChatRoom").click(function() {
    $("#mainChatRoom")
      .find("h4")
      .removeClass("rooms_notified_header");
    $("#mainChatRoom")
      .find("p")
      .removeClass("rooms_notified_p");

    $("#myMessages").css("display", "block");
    $(".myMessages")
      .not("#myMessages")
      .css("display", "none");
    $("#mainChatRoom").css("background-color", "lightgray");
    currentlyChatting = "myMessages";
    $("#online_status").html("Master Chat");
    $("#current_chat_img").attr("src", "/main_chat.png");
    $("#mainChatRoom")
      .siblings()
      .css("background-color", "#eef2f1"); //normal
  });

  function joinedRoomClick(theRoom) {
    console.log("Room: " + theRoom + " is clicked");
    //Here I display only this room
    //And shout down the rest
    $("#" + theRoom).css("display", "block");
    $(".myMessages")
      .not("#" + theRoom)
      .css("display", "none");
  }

  socket.on("chat message", function(from, msg, clientsImage) {
    var one = $(
      [
        `<div style="float:left; margin-right: 200px;">`,
        `<div style="float: left;">
                <img src="/` +
          clientsImage +
          `" alt="..." class="img-circle img-responsive" id="img-circle_chat" style="width: 39px">
              </div>
              <div class="list-group-item active noselect" id="myCard" style="float: none; margin-left:42px; margin-top:14px">
              `,
        `<h5 class="list-group-item-heading" style="font-weight: 700">` +
          from +
          `</h5>`,
        `<p class="list-group-item-text"  style="color:azure;">` + msg + `</p>`,
        `</div>`,
        `</div>`
      ].join("\n")
    );

    var one_own = $(
      [
        `<div class="list-group-item active noselect" id="myCard-own">
                `,
        `<div>`,
        `<p class="list-group-item-text" style="text-align: left;">` +
          msg +
          `</p>`,
        `</div>`,
        `</div>`,
        `</div>`
      ].join("\n")
    );
    one.css("display", "none");
    if ($("#intro_chat").css("display") != "none") {
      $("#intro_chat").css("display", "none");
    }
    if (from == socket.io.engine.id) {
      //meaning this is sent from this client
      //then add another class
      $("#myMessages").append(one_own);
    } else {
      $("#myMessages").append(one);
    }
    if (currentlyChatting !== "myMessages") {
      $("#mainChatRoom")
        .find("h4")
        .addClass("rooms_notified_header");
      $("#mainChatRoom")
        .find("p")
        .addClass("rooms_notified_p");
    }
    $("#mainChatRoom")
      .find("p")
      .html(from + ": " + msg.substring(0, 25) + "...");

    $("#myMessages").effect("fadeIn");

    $(".myMessages")
      .not("#myMessages")
      .effect("hide");

    var objDiv = document.getElementById("myMessages");
    $("#myMessages").animate(
      {
        scrollTop: objDiv.scrollHeight
      },
      100
    );
    one.toggle("slide", { direction: "right" }, 200);
  });
  function createUniqueDiv(theRoom) {
    console.log("-------createUniqueDiv-------------");
    var one =
      `<div class="myMessages" id="` +
      theRoom +
      `">
                      </div>`;
    //This unique div should append to left_side
    //Any Div that already appended in left_side and havve
    //Display status , visible should toggle into hidden
    $("#chat_rooms").append(one);
    console.log("-------end of createUniqueDiv-------------");
  }

  function getMessagesByConv(conv) {
    return $.ajax({
      method: "GET",
      url: `http://localhost:3000/message?convid="${conv}"`
    })
      .done(function(msg) {
        if (msg.success) {
          return msg.data;
        } else {
          return msg;
        }
      })
      .catch(err => err);
  }

  async function getConvsByUsername(username) {
    return $.ajax({
      method: "GET",
      url: `http://localhost:3000/conv?username="${username}"`
    })
      .done(function(msg) {
        if (msg.success) {
          console.log("message ", msg);
          msg.data.forEach(data => {
            console.log("convs data ", data);
            var otherMember =
              socket.io.engine.id === data.pas_1 ? data.pas_2 : data.pas_1;
            getUserInfo(otherMember).then(otherUserInfo => {
              joinedRoomFromDB({
                name: otherMember,
                id: data.id,
                clientImage: otherUserInfo.data[0].clientImage + ".png"
              });
            });
          });
          return msg;
        } else {
          return msg;
        }
      })
      .catch(err => err);
  }

  function createConvAjaxCall(id, pass_1, pass_2) {
    // data should look like {id: 'conv_id', pass_1: 'user_1', pass_2: 'pasword}

    return $.ajax({
      method: "POST",
      url: "http://localhost:3000/conv",
      data: { id, pass_1, pass_2 }
    })
      .done(function(msg) {
        // alert( "Data Saved: " + msg );
        if (msg.success) {
          console.log("message ", msg);
          return msg;
        } else {
          console.log("conv creation failed");
          return msg;
        }
      })
      .catch(err => err);
  }

  function getUserInfo(username) {
    return $.ajax({
      method: "GET",
      url: `http://localhost:3000/userinfo?username="${username}"`
    })
      .done(function(res) {
        if (res.success) {
          return res.data;
        } else {
          return res;
        }
      })
      .catch(err => console.log("err while trying to load user info ", err));
  }

  function addMessageAjaxCall(convId, author, body, timestamp) {
    return $.ajax({
      method: "POST",
      url: "http://localhost:3000/message",
      data: { convId, author, body, timestamp }
    })
      .done(function(msg) {
        if (msg.success) {
          console.log("message ", msg);
          return msg;
        } else {
          console.log("Message addition failed");
          return msg;
        }
      })
      .catch(err => err);
  }

  async function createNewJoinedRoom(theNameOfThePerson) {
    //Here I will check if it's already exist
    //if exist return there is nothing to do here
    //if not create new one
    //But I only need the of the li which leads into creation of new one
    // if(theNameOfThePerson == roomJoined[])

    let receiver = theNameOfThePerson;

    var roomName =
      socket.io.engine.id > receiver
        ? socket.io.engine.id + "_" + receiver
        : receiver + "_" + socket.io.engine.id;
    //Yea, this is the most powerful line
    if (!roomJoined[roomName]) {
      //Both of them didn't exist
      //so what are you waiting for create one
      //when it's the first time
      //two things should end Here
      //The room creation and The invitaion for the other dude
      //so that we don't worry about it later.
      const convCreation = await createConvAjaxCall(
        roomName,
        socket.io.engine.id,
        receiver
      );
      socket.emit("subscribe", roomName);
      //So, I'm leaving some info about the created roomName
      roomJoined[roomName] = {};
      console.log(roomJoined[roomName]);
      console.log("Preparing the roomName " + roomJoined);
      getUserInfo(receiver).then(msg => {
        if (!msg.success) return;

        roomJoined[roomName] = {
          name: receiver,
          clientImage: msg.data[0].clientImage + ".png", //This image has to be the receiver's
          last_msg: $("#input_area").val()
        };
        console.log("Joined new Group with " + receiver);
        console.log(roomJoined);
        socket.emit(
          "join_request",
          roomJoined[roomName].name,
          socket.io.engine.id,
          roomName,
          $("#input_area").val(),
          myImage
        );
        //Here I'm notifying the new room is created
        //This also go with the join_request emitation
        createUniqueDiv(roomName);
        //After this we notify the new room creation
        //Here I'm notifying the new room is created
        //This also go with the join_request emitation
        joinedRoomChanged(roomName);
        //Here it is also cool to create the a function who handles the
        //Unique DIV for this room,
        //The div will have a class of myMessages and the Id of the room_name
        //Also this need to be annoced for room_messasge render to haunt and find this
      });
      return;
    } else {
      console.log("sendToRoom");
      //Here split into another function which takes the roomName and the roomNameReverse
      sendToRoom(receiver);
    } 
  }

  function sendToRoom(receiver) {
    // You can add a message here
    var roomName =
      socket.io.engine.id > receiver
        ? socket.io.engine.id + "_" + receiver
        : receiver + "_" + socket.io.engine.id;
    if (roomJoined[roomName]) {
      // Aha....one of them already exists;

      var correcto = roomJoined[roomName].name;

      return Object.keys(roomJoined).forEach(function(the_room) {
        if (roomJoined[the_room].name == correcto) {
          console.log("The roomId is: " + the_room);
          // here call addMessage ajax;
          // the_room is convID
          // we've sender

          addMessageAjaxCall(
            the_room,
            socket.io.engine.id,
            $("#input_area").val(),
            "" + new Date()
          )
            .then(data => console.log("message resnpose", data))
            .catch(err => console.log("err ", err));

          socket.emit("room-message", {
            room: the_room,
            message: $("#input_area").val(),
            clientImage: clientImage,
            sender: socket.io.engine.id
          });
        }
      });
    } else {
      //this means this people already meet once and
      //they don't need to invite each other so just post to the room
      socket.emit("room-message", {
        room: roomName,
        message: $("#input_area").val(),
        clientImage: clientImage,
        sender: socket.io.engine.id
      });
    }
    $("#input_area").val("");
    $("#room_create").val("");
    return;
  }

  function openModal(n) {
    if (n == 0) {
      $(".dropdown").html(
        "<h2>Game Over </h2><br> <h4>Level: " +
          level +
          "</h4> <br><p>Score: " +
          score +
          "</p>"
      );
      n = 1;
      $("#startButton").text("Try Again");
      $("#welcome").text("Result");
    }
    // var modal = document.getElementById('myModal');
    $("#myModal").css("display", "block");
    var span = document.getElementsByClassName("close")[0];

    span.onclick = function() {
      closeModal(gameStage);
    };
  }
});
