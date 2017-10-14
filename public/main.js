var user_name = "Null"

$(document).ready(function() {



    openModal(1);
    var clientsInfo = {};
    var roomJoined = {};

    var clientImage = '1.png';
    var currentlyChatting = "myMessages";
    console.log("jQuery working perfectlly");
    var socket = io();
    console.log("yea...practicingStream");

    //Join my Team requested
    $("#sent_img").mouseenter(function(){
      $("#sent_img").css("background-color", "dimgrey")

    });

    $("#sent_img").mouseleave(function(){
      $("#sent_img").css("background-color", "cadetblue")
    });
    //This is




    socket.on("join_request", function(theRoom, requester,last_msg,clientImage){
      console.log("-------------------join_request------------------------");
      console.log("roomJoined before ");
      console.log(roomJoined);
      console.log("the room "+theRoom);
      console.log("the requester "+requester);
      console.log("the last_msg "+last_msg);
      console.log("the clientImage "+clientImage);
      console.log("from join_request");
          console.log("Ahaha...."+requester+" is nagging me to join their "+theRoom+" room");
          socket.emit("subscribe", theRoom);
          //Here I'm tryng to modify the roomJoined variable

          roomJoined[theRoom] = {
            name : requester,
            img : clientImage,
            last_msg: last_msg
          };
          console.log("Constructed roomObject");
          console.log(roomJoined);

          joinedRoomChanged(theRoom);
          createUniqueDiv(theRoom);

          console.log("going to append a history");

          //Here add the room to the recent message panel

          console.log(socket.rooms);
          console.log("sending via room-message");
          /*
          socket.emit("room-message",{
            room: theRoom,
            message:"Hey im "+socket.io.engine.id+" subscribing for the first time to: "+theRoom
          });*/
          console.log("joinedRoom after ");
        console.log(roomJoined);
        console.log("-------------------end of join_request------------------------");

    });
      function getReadableFileSize(fileSizeInBytes) {

                var i = -1;
                var byteUnits = [
                    'kB',
                    'MB',
                    'GB',
                    'TB',
                    'PB',
                    'EB',
                    'ZB',
                    'YB'
                ];
                do
                {
                    fileSizeInBytes = fileSizeInBytes / 1024;
                    i++;

                }
                while (fileSizeInBytes > 1024)
                ;
                return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];

                }
    function prepareFileUploadingUI(name, size, sender, roomName){
        console.log("The roomName is "+roomName);
        $("#"+roomName).find("#intro_chat").css("display", "none");

      // var theSender = Object.keys(clientsInfo).find(key => clientsInfo[key].name == roomJoined[room].name);

        var lastIndex = name.lastIndexOf(".");

        var splited_name = name.substring(0,lastIndex).substring(0,24) + "."+ name.substring(lastIndex, name.length);
        var splited_name_own = name.substring(0,lastIndex).substring(0,12) + "."+ name.substring(lastIndex, name.length);
        //I feel like I wanna go home,
        console.log("100% file uploaded!!!");
        var uploaded_div_own = `<div class="list-group-item active noselect" id="myCard-own">
                              <div>
                                <a href="/file-uploaded/`+name+`" download><img src="/download.png"></a>

                              <p class="list-group-item-text" style="float: left;text-align: left;/* top: 41px; */padding-right: 16px;margin-top: 16px;">`+splited_name_own+`<br/><span style="
                             float: right;">`+getReadableFileSize(size)+`</span></p>
                              </div>
                            </div>`;

        var uploaded_div_other = `
                  <div style="float:left;">,
                  <div style="float: left;margin-right:5px;">
                      <img src="/1.png" alt="..." class="img-circle img-responsive" id="img-circle_chat" style="width: 39px">
                    </div>
                    <div class="list-group-item active noselect" id="myCard">
                                    <a href="/file-uploaded/`+name+`" download> <img src="/download.png" style="float: left;"></a>
                                    <p style="float: left;margin-left: 14px; margin-top: 3px;">`+splited_name+`<br><span style="float: left">`+getReadableFileSize(size)+`</span></p>
                                  </div></div>`;
      if(sender == socket.io.engine.id){
        $("#"+roomName).append(uploaded_div_own);

      }
      else{
        $("#"+roomName).append(uploaded_div_other);

      }
      var objDiv = document.getElementById(roomName);
      //animating scrolltop
      // objDiv.scrollTop= objDiv.scrollHeight;
      $("#"+roomName).animate({
          scrollTop: objDiv.scrollHeight
      }, 100);
    };
    function startUploading(name, id, size, roomName){
      //Here it should be restricted for myMessages
      //The function can take the roomAs an id and append it there

      // $("#myMessages").find("#intro_chat").css("display", "none");
      $("#"+roomName).find("#intro_chat").css("display", "none");

      var lastIndex = name.lastIndexOf(".");
      var splited_name_own = name.substring(0,lastIndex).substring(0,12) + "."+ name.substring(lastIndex, name.length);

      var uploading_div = `<div id="`+(id+1)+`"><div class="list-group-item active noselect" id="myCard-own">
                            <div>
                              <p style="float: left float: left; color: lightcyan; font-weight: 700; margin-bottom: 3px;">Uploading.. <span id="`+id+`"><span>
                            <p class="list-group-item-text" style="color: azure;float: left;text-align: left;/* top: 41px; */padding-right: 16px;">`+splited_name_own+`: <br/><span style="
                           float: right;">`+getReadableFileSize(size)+`</span></p>
                            </div>
                          </div></div>`;

        //Not only myMessages
        $("#"+roomName).append(uploading_div);
        var objDiv = document.getElementById(roomName);
        //animating scrolltop
        // objDiv.scrollTop= objDiv.scrollHeight;
        $("#myMessages").animate({
            scrollTop: objDiv.scrollHeight
        }, 100);
    }
    $("#attach").change(function(e){
      //Here I can emit the 'file-uploading' event to server
      //which tells receiver that the file is uploading..while for the sender
      //can see the progress

      var file = e.target.files[0];
      console.log("e is ");
      console.log(e);
      console.log("file is "+file);
      console.log(file);
      var stream = ss.createStream();
      console.log("Saying hello to server!!");
      var readOpts = {highWaterMark: Math.pow(2,16)};

      // socket.emit("hello",{size:file.size});
      var blobStream = ss.createBlobReadStream(file, readOpts);
      var size = 0;
      // let start = null;
      //Here I can start the file-uploading to server
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
      blobStream.on('data', function(chunk, enc, next){
        //From this I can send the progress
        size += chunk.length;
        // process.nextTick(()=> next())
        // next()
        var progress = Math.floor(size/file.size *100) + "%";
        if ($.inArray(fileType, ValidImageTypes) < 0) {
             // invalid file type code goes here.
             //The roomName should be passed as an argument
             socket.emit('file-uploading', socket.io.engine.id, file.name, progress, file.size, uniqueUploadId+1, currentlyChatting);
        }
        //Here I'll update the uploading content;
        //of the ID uniqueId
        $("#"+uniqueUploadId).text(progress);
        console.log(progress);
      });
      blobStream.on('end', function(){
        //Check the extension
        //Here I will finish what startUploading started by really displaying the file
        //This file-uploaded should be img uploaded
        //First check if the file is in image format

        if ($.inArray(fileType, ValidImageTypes) > 0) {
             // invalid file type code goes here.
             console.log("Haha this one is an image");
             //it should have a <from> and <to> argument
             socket.emit('image-uploaded', socket.io.engine.id, file.name, currentlyChatting);
           }else{
              console.log("elsed");
            //  prepareFileUploadingUI(file.name, size, from, uniqueUploadId);

           }
        console.log("Uploading done Fished!!");
      })
      blobStream.pipe(stream);
      ss(socket).emit("file", stream, {filename: file.name}, currentlyChatting);
    });

    socket.on("file-uploading", function(from, filename, progress, size, id, roomName){
      console.log("Fileuploading by "+from);
      console.log("Filename "+filename);
      console.log("percent "+progress);
      console.log("the roomName is: "+roomName);
      if(progress == "100%"){
        console.log("Invoking prepareFileUploadingUI");
        $("#"+id).remove();
        prepareFileUploadingUI(filename, size, from, roomName);
      }

    });
    //Going to render the uploaded image into the #myMessage div
    socket.on('image-uploaded', function(from, filename, roomName){
      console.log("The room name is: "+roomName);
      //I will append the image into the corresponsing room
      $("#myMessages").find("#intro_chat").css("display", "none");

      let myFloat = "";
      if(from == socket.io.engine.id){
        myFloat = "image-uploaded-own";
      }
      else{
        myFloat = "image-uploaded";
      }
      var myImg = new Image();
      var $img = $("<img download/>");
      $img.attr("src", '/file-uploaded/'+filename);
      $img.addClass(myFloat);
      $img.addClass("img-responsive");
      myImg.onload = function(){
        console.log(this.width + "x"+this.height);
        if(this.width < this.height){
          $img.css("height", "62%");
        }else{
          $img.css("height", "46%");

        }
      }
      myImg.src = "/file-uploaded/"+filename;

      console.log(myImg.clientWidth);
      /*
      var one_own = $([
          `<img src="/file-uploaded/`+filename+`" alt="..." id="uploaded-img" class="img-responsive img-circle"/>`].join("\n"));
*/

        $("#"+roomName).append($img);
        // $("#myMessages").append($img);
        var objDiv = document.getElementById(roomName);
        console.log("success!!");
        //animating scrolltop
        // objDiv.scrollTop= objDiv.scrollHeight;
        $("#"+roomName).animate({
            scrollTop: objDiv.scrollHeight
        }, 100);
        console.log("appended the img");
    })

    console.log("Jquery function going to give id " + user_name);
    socket.on("clientInfo", function(clients, lists) {
        console.log("IMMMMMITTTING CLIENT ");
        console.log("Latest connected");
        console.log(lists);
        console.log(clients);
        var mySet = new Set(lists);
        // console.log("my set ");
        console.log(mySet);
        console.log("Ul size before Leaving");
        console.log($("ul"));
        $("ul").empty();

        mySet.forEach(function(id) {
          if(clients[id] == undefined){
            console.log("you should stop it undefined");
            return
          }
          else{
            console.log("Not undefined ");
            console.log(clients[id]);
          }
            // $('ul').append('<li>' + id + '</li>');
            //Here provide each li with unique id
            $('ul').append(`<a href="#" ><li id="for_`+clients[id].name+`"> `+clients[id].name+`</li></a>`);
            $("#for_"+clients[id].name).click(function(){
              //Here attach the createNewJoinedRoom
              var too = Object.keys(roomJoined).find(key => roomJoined[key].name === clients[id].name);
              console.log("too");
              console.log(roomJoined);
              console.log(too);
              console.log("CreateNewJoinedRoom"+clients[id].name);
              if(too == undefined){
                createNewJoinedRoom(clients[id].name);
              }

            });
        });
        clientsInfo = clients;//This is the name of the client clients[id].name
    });
    socket.on("FreshUser", function(data){
      console.log("Fresh USER JOINED");
      $("#joined_now").html("("+data+" joined now!)");
      $("#joined_now").toggle("fade",1500);
      $("#joined_now").toggle("fade",1500);
      $("#joined_now").hide("fade");

      console.log(data);
    });

    //updating the last msg of the div's
    function updateTheLastMsg(theRoom, msg, sender){
      console.log("_____updateTheLastMsg__________");
        //chat_w_Ahaha
        //chat_w_ + receiver
        //Here if the currentlyChatting is not this room
        //add couple of class
        console.log(theRoom);
        console.log(roomJoined[theRoom]);
        console.log("the receiver "+roomJoined[theRoom].name);
        if(sender == socket.io.engine.id){
          sender = "You";
        }
        $("#chat_w_"+roomJoined[theRoom].name).find("p").html(sender +": "+msg.substring(0,25)+"...");
        // $("#chat_w_B").find("p").html("hell")
        //give as the receiver
        if(currentlyChatting !== theRoom){
          $("#chat_w_"+roomJoined[theRoom].name).find("h4").addClass("rooms_notified_header")
          $("#chat_w_"+roomJoined[theRoom].name).find("p").addClass("rooms_notified_p")

        }

    }

    function appendInChatRoom(id, msg, sender){
      console.log("-------appendInChatRoom---------");
      console.log("the id "+id);
      console.log("the message "+msg);
      // If the header need here it is
      // `<h4 class="list-group-item-heading">` + id + `</h4>`,
      var theCard = "myCard-room";
      if(sender == socket.io.engine.id){
        theCard = "myCard-own";
        console.log("ITSOWN");
      }

      var one = $([
          `<div class="list-group-item active noselect" id="`+theCard+`">
            `,
          `<p class="list-group-item-text" style="color:azure;">` + msg + `</p>`,
          `</div>`,
      ].join("\n"));
      $("#"+id).find("#intro_chat").css("display", "none");
      $("#"+id).append(one);
      var objDiv = document.getElementById(id);
      //animating scrolltop
      // objDiv.scrollTop= objDiv.scrollHeight;
      $("#"+id).animate({
          scrollTop: objDiv.scrollHeight
      }, 100);
      // one.toggle( "slide", {direction: "right"},200);
      // Here I'm trying to send send it privately


      console.log("-------end appendInChatRoom---------");

    }


    socket.on("room-message", function(data){
      if(data.message == ""){
        return;
      }
      //Here I also need to update my joimedRoom object


      console.log("-----------------room-message--------------------------");
      //Here render the data in room-message panel
      //The data should have the room name
      //The message
      console.log("the data argument");
      console.log(data);
      console.log("Message arrived to room");
      console.log("joined room");
      console.log(roomJoined);
      var thisRoom = data.room;
      console.log("this room "+thisRoom);

      roomJoined[thisRoom].last_msg = data.message;
      //Haha, this wasn't the smartest idea
      // joinedRoomChanged(thisRoom);
      //In order to alter the last_msg on the joinedRoom div's
      //I need to find them on id and update the html()
      //Here i can also append the you and the other guy
      updateTheLastMsg(thisRoom, data.message, data.sender);
      /*
      if(data.sender == undefined){
        data.sender = socket.io.engine.id;
      }*/

      var one = $([
        `<div class="list-group-item active noselect" id="room_message_card">
                <div class="notify_img">
                    <img src="/`+data.clientImage+`" alt="..." class="img-circle img-responsive" id="img-circle_chat">
                </div>
                <div style="float: left; padding-left: 14px;">
                    <h4 class="list-group-item-heading">`+data.sender+`</h4>
                    <p class="list-group-item-text" style="padding: 7px;">`+data.message.substring(0,18)+`</p>
                </div>
                <div>
                  <img src="/notify_2.png" alt="..." class="img-circle img-responsive" id="img-circle_chat">
                </div>
            </div>
        </div>`].join("\n"));

      appendInChatRoom(data.room, data.message, data.sender);
      console.log(data);
      console.log(data.room);
      console.log(data.message);

      one.css("display", "none");
      $('#myRoomMessages').append(one);
      var objDiv = document.getElementById('myRoomMessages');
      //animating scrolltop
      // objDiv.scrollTop= objDiv.scrollHeight;
      $("#myRoomMessages").animate({
          scrollTop: objDiv.scrollHeight
      }, 100);
      one.toggle( "slide", {direction: "right"},200);

      console.log("-----------------end of room-message--------------------------");

    });

    //Client side private message
    //Will render the message into myMessages div with different colour
    socket.on("private_message", function(from, msg , clientImage){
      // console.log("Private Message Arrived from: "+from);
      // console.log("Private Message Arrived saying: "+msg);
    });
    socket.on("connect", function() {
        console.log(socket.io.engine.id);
        // socket.io.engine.id= "new ID";
        console.log("Connection established message from CLIENT_SIDE ");
        console.log("New ID:- " + socket.io.engine.id);
        socket.emit("news", socket.io.engine.id);
        return socket.io.engine;
    });
    $("#signed_button").click(function(){
      if($('input[name=fb]:checked').val() == undefined){
        console.log("You should return and select again");
        $("#validate_error").css("display", "block");
        return;
      }
      console.log("checked value");
      console.log($('input[name=fb]:checked').val());
      clientImage = $('input[name=fb]:checked').val() + '.png';
      socket.emit("login", socket.io.engine.id);

      //Here i will get the name value
      // hidden the current background and light up the container
      // it's will be cool if it has some interval
      // and show the online status
      setTimeout(function(){
        let user_name = $("#signed").val();
        console.log(user_name);
        // $("#online_status").html(user_name);
        $("#profile_name").html(user_name);

        $("#megarja").remove();
        $("#myModal").css("display", "none");
        $(".container").css("display", "block");
        $("#username_display").css("display","block");
        $("#hello").html("Hello, "+user_name);
        console.log("clientImage "+clientImage);
        $("#intro_image").attr( "src", "/"+clientImage);
        $("#profile_pic").attr( "src", "/"+clientImage);

        var old = socket.io.engine.id;
        socket.io.engine.id = user_name;
        socket.emit("clientInfo", old, socket.io.engine.id, clientImage);
        console.log("SocketID in register " + socket.io.engine.id);
        $('#input_area').val("");

        $("#online_status").html("Master Chat");
        $("#current_chat_img").attr("src", "/main_chat.png");
      }, 500);
      //So far so good
      console.log("SignedUP clicked!");
    });

    socket.on('news', function(data) {
        console.log("News received: " + data);
        name = data;

    });
    $("#target").submit(function() {
        console.log("Hey you registered");
    });


    $("#input_area").on('input', function(){
            //Typing
            // console.log("Some one is typing");
            socket.emit("typing", socket.io.engine.id);
            $("#"+socket.io.engine.id).css("display", "inline");
            // pass the user ID
            // socket.emit("typing", socket.io.engine.id);
    });
    socket.on("typing", function(name, myBool){
          //Find and render who is typing on the list
          // console.log("MSG FROM SERVER, "+name+" is typing......");
          if(myBool){
            // console.log("Continue typing........"+name);

          }
          else{
              // console.log("CRuSH THE FADING --------Typing for "+name);
              $("#"+name).hide("fade");
              $("#"+name).css("color", "ghostwhite");

              return;
          }
          $("li:contains("+name+")").html(name+" <span id="+name+" class= \"typing\"> is typing...</span>");
          $("#"+name).css('display','inline');
          $("#"+name).delay( 800 ).fadeOut( 400 );
          $("#"+name).css("color", "darkgrey");

        });
        $(document).keypress(function(e){
          if(e.which == 13){
            $("#sent_img").trigger('click');
            e.preventDefault();
          }
        });
    $("#sent_img").click(function() {
        console.log("-------------form-submittion--------------------");
        console.log($('#input_area').val());
        if($('#input_area').val().trim() === ""){
          $("#message_error").css("display", "inline");
          $("#message_error").html("(The message is empty!)");
          return;
          // return false;
        }
        // else if($('#input_area').val() !== "" && currentlyChatting == "myMessages"){
          else if($('#input_area').val() !== "" && currentlyChatting == "myMessages"){

          //This means the message is for the master-room
          $("#message_error").css("display", "none");
          //This happens when the currentlyChatting is myMessages
          socket.emit('chat message', socket.io.engine.id, $('#input_area').val(), clientImage);
          $('#input_area').val('');
          $("#room_create").val('');
          return;
        }
        else{
            //Just only sends the message
            $("#message_error").css("display", "none");
            console.log("ConnectedClients so far");
            console.log(clientsInfo);
            console.log(clientsInfo[Object.keys(clientsInfo)[1]]);
            //after gotting the receving client
            //Here I will ask for the receiver to join my room
            // "join_request", "theReceiverId", "the-room-name"
            //sending join requested

            console.log("Sending join request to ");
            console.log("first clientInfo");
            console.log("Got it, only emmetting left");
            //Keep rooms that this socket connected
            let receiver =  roomJoined[currentlyChatting].name;
            // let receiver =  $('#room_create').val().trim();
            //The brank new function
            console.log("The brand new function");
            createNewJoinedRoom(receiver);
            }
        return;
    });


    //The joinedRoomChanged
    function joinedRoomChanged(room){

      console.log("---Joined Room Changed------------------");
      console.log("The received room");
      console.log(clientsInfo);
      var profImg = "1.png"
      profImgA = Object.keys(clientsInfo).find(key => clientsInfo[key].name == roomJoined[room].name);
      console.log(clientsInfo[profImg]);
      profImg = clientsInfo[profImgA].clientImage;
/*
      Object.keys(clientsInfo).forEach(function(client){
        console.log(client);
        if(clientsInfo[client].name == roomJoined[room].name){
          profImg = clientsInfo[client].clientImage;
        }
      });*/
      console.log(document.getElementById("chat_w_"+roomJoined[room].name));
      console.log(roomJoined[room]);
      var one = `<div class="one_room_joined" id="chat_w_`+roomJoined[room].name+`">
          <img src="/`+profImg+`" class="img-circle img-responsive" style="width: 72px; opacity: 1; float: left; margin-right: 11px; font-weight: bold" />
          <h4 style="margin-bottom: 4px; font-weight: 600">`+roomJoined[room].name+`</h4>
          <p style="  font-style:italic;font-size: small; font-family: cursive;">Starting chatting with `+roomJoined[room].name+`</p>
      </div>
      `;
      if(document.getElementById("chat_w_"+roomJoined[room].name) == null){
        $(".roomJoined_display").append(one);
      }
      $("#chat_w_"+roomJoined[room].name).click(function(){
        console.log(roomJoined[room].name+" room is clicked!");
        joinedRoomClick(room);
        $("#chat_w_"+roomJoined[room].name).find("p").removeClass("rooms_notified_p")
        $("#chat_w_"+roomJoined[room].name).find("h4").removeClass("rooms_notified_header")

        $("#chat_w_"+roomJoined[room].name).css("background-color", "lightgray");
        $("#chat_w_"+roomJoined[room].name).siblings().css("background-color","#eef2f1");
        currentlyChatting = room;//This is the current room;
        var sprofImgA = Object.keys(clientsInfo).find(key => clientsInfo[key].name == roomJoined[room].name);
        // console.log(clientsInfo[profImg]);
        var profImgD = clientsInfo[sprofImgA].clientImage;
        $("#online_status").html(roomJoined[room].name);
        $("#current_chat_img").attr("src", "/"+profImgD)

        console.log("Currently chatting in room: "+currentlyChatting);

      });
      console.log("-end of joind room changed------------------");

    }

    //Trying to makes sense our of the room cilck
    $("#mainChatRoom").click(function(){
      $("#mainChatRoom").find("h4").removeClass("rooms_notified_header")
      $("#mainChatRoom").find("p").removeClass("rooms_notified_p")

      $("#myMessages").css("display", "block");
      $(".myMessages").not("#myMessages").css("display","none")
      $("#mainChatRoom").css("background-color", "lightgray");
      console.log("------mainChatRoom clicked----------");
      currentlyChatting =  "myMessages";
      console.log("currentlyChatting in myMessages");
      $("#online_status").html("Master Chat");
      $("#current_chat_img").attr("src", "/main_chat.png");
      $("#mainChatRoom").siblings().css("background-color", "#eef2f1");//normal
    });

    function joinedRoomClick(theRoom){
      console.log("Room: "+theRoom +" is clicked");
      //Here I display only this room
      //And shout down the rest
       $("#"+theRoom).css("display", "block");

       $(".myMessages").not("#"+theRoom).css("display","none")
    }


    socket.on('chat message', function(from, msg, clientsImage) {
        var one = $([
            `<div style="float:left; margin-right: 200px;">`,
            `<div style="float: left;">
                <img src="/`+clientsImage+`" alt="..." class="img-circle img-responsive" id="img-circle_chat" style="width: 39px">
              </div>
              <div class="list-group-item active noselect" id="myCard" style="float: none; margin-left:42px; margin-top:14px">
              `,
            `<h5 class="list-group-item-heading" style="font-weight: 700">` + from + `</h5>`,
            `<p class="list-group-item-text"  style="color:azure;">` + msg + `</p>`,
            `</div>`,
            `</div>`
        ].join("\n"));

          var one_own = $([
              `<div class="list-group-item active noselect" id="myCard-own">
                `,
              `<div>`,
              `<p class="list-group-item-text" style="text-align: left;">` + msg + `</p>`,
              `</div>`,
              `</div>`,
              `</div>`
          ].join("\n"));
        one.css("display", "none");
        if($("#intro_chat").css("display") != "none"){
              $("#intro_chat").css("display", "none");
              // $("#myMessages").css("background-color", "white");
        }
        if(from == socket.io.engine.id){
          //meaning this is sent from this client
          //then add another class
          $('#myMessages').append(one_own);
        }
        else{
          $('#myMessages').append(one);
        }
        if(currentlyChatting !== "myMessages"){
          $("#mainChatRoom").find("h4").addClass("rooms_notified_header")
          $("#mainChatRoom").find("p").addClass("rooms_notified_p")
        }
        $("#mainChatRoom").find("p").html(from +": "+msg.substring(0,25)+"...");

        $('#myMessages').effect("fadeIn");

        $('.myMessages').not("#myMessages").effect("hide");

        var objDiv = document.getElementById('myMessages');
        //animating scrolltop
        // objDiv.scrollTop= objDiv.scrollHeight;
        $("#myMessages").animate({
            scrollTop: objDiv.scrollHeight
        }, 100);
        one.toggle( "slide", {direction: "right"},200);
        // Here I'm trying to send send it privately



    });
    function createUniqueDiv(theRoom){
      console.log("-------createUniqueDiv-------------");
      console.log(roomJoined[theRoom]);
      var one = `<div class="myMessages" id="`+theRoom+`">
                      </div>`;
      //This unique div should append to left_side
      //Any Div that already appended in left_side and havve
      //Display status , visible should toggle into hidden
      $("#chat_rooms").append(one);
      console.log("-------end of createUniqueDiv-------------");

    }
    function createNewJoinedRoom(theNameOfThePerson){
          //Here I will check if it's already exist
          //if exist return there is nothing to do here
          //if not create new one
          //But I only need the of the li which leads into creation of new one
          // if(theNameOfThePerson == roomJoined[])

          let receiver = theNameOfThePerson;
          // let receiver = roomJoined[currentlyChatting].name;
          var roomName = socket.io.engine.id +"_" + receiver;
          var roomNameReverse = receiver+"_"+socket.io.engine.id;
          console.log("rooms the socket already subscribed");
          console.log(roomJoined);
          console.log("room name");
          console.log(roomName);
          console.log(roomJoined[roomName]);
          //Yea, this is the most powerful line
          if(roomJoined[roomName] == undefined && roomJoined[roomNameReverse] == undefined){
              //Both of them didn't exist
              //so what are you waiting for create one
              console.log("This conversation is virgin :D");
              console.log("before going room already joined");
              console.log(roomJoined);
              //when it's the first time
              //two things should end Here
              //The room creation and The invitaion for the other dude
              //so that we don't worry about it later.
              console.log("Nice, Creating for the first time");
              console.log("subscribing to "+roomName);
              //hhehehehehe, there we go inventing the roomName
              socket.emit("subscribe", roomName);
              //So, I'm leaving some info about the created roomName
              roomJoined[roomName] = {};
              console.log("created new room");
              console.log(roomJoined[roomName]);
              console.log("Preparing the roomName "+roomJoined);
              roomJoined[roomName] = {
                name : receiver,
                img : clientImage,//This image has to be the receiver's
                last_msg: $('#input_area').val()
              };
              console.log("Joined new Group with "+receiver);
              console.log(roomJoined);
              socket.emit("join_request", roomJoined[roomName].name, socket.io.engine.id, roomName, $('#input_area').val(),clientImage);
              //Here I'm notifying the new room is created
              //This also go with the join_request emitation
              createUniqueDiv(roomName);
              /*
              socket.emit("room-message", {
                room: roomName,
                message: $('#input_area').val(),
                clientImage: clientImage,
                sender: socket.io.engine.id
              });*/

              console.log(roomName);
              //After this we notify the new room creation
              //Here I'm notifying the new room is created
              //This also go with the join_request emitation

              joinedRoomChanged(roomName);
              //Here it is also cool to create the a function who handles the
              //Unique DIV for this room,
              //The div will have a class of myMessages and the Id of the room_name
              //Also this need to be annoced for room_messasge render to haunt and find this
                return;
                }
                else{
                  console.log("sendToRoom");
                  sendToRoom(receiver)

                }              //Here split into another function which takes the roomName and the roomNameReverse
            }

            function sendToRoom(receiver){
              var roomName = socket.io.engine.id +"_" + receiver;
              var roomNameReverse = receiver+"_"+socket.io.engine.id;
              if(roomJoined[roomName] == undefined || roomJoined[roomNameReverse] == undefined){
                    console.log("Aha....one of them already exists");
                    if(roomJoined[roomName] == undefined){
                      console.log("hey roomName is loser");
                      // var correcto = roomNameReverse;
                      var correcto = roomJoined[roomNameReverse].name;
                    }
                    else{
                      console.log("hey roomNameReverse is loser");
                      // var correcto = roomName;
                      var correcto = roomJoined[roomName].name;
                    }
                    console.log(Object.keys(roomJoined).forEach(function(the_room){
                          console.log("iterating through the_room");
                          console.log(the_room);
                          console.log(typeof(the_room));
                          if(roomJoined[the_room].name == correcto){
                            console.log("yea.....the roomId is: "+the_room);


                            socket.emit("room-message", {
                              room: the_room,
                              message: $('#input_area').val(),
                              clientImage: clientImage,
                              sender: socket.io.engine.id
                            });
                          }
                    }));
                }
                else{
                      //this means this people already meet once and
                      //they don't need to invite each other so just post to the room
                      console.log("Ohh there is already a group with this name");
                      socket.emit("room-message", {
                        room: roomName,
                        message: $('#input_area').val(),
                        clientImage: clientImage,
                        sender: socket.io.engine.id
                      });
                    }
                    console.log("roomJoined after on message");
                    console.log(roomJoined);
                    // socket.emit("create", "the-room-name");

                // console.log(Object.keys(clientsInfo));
                // console.log(socket.rooms);
                // socket.emit('private_message',socket.io.engine.id, Object.keys(clientsInfo)[1], $('#input_area').val(), clientImage)
                $('#input_area').val('');
                $("#room_create").val('');
                // return false;
                return;
            }

    // var modal = document.getElementById('myModal');
    //------------------Modal
    function openModal(n){
      if(n == 0){
          $(".dropdown").html("<h2>Game Over </h2><br> <h4>Level: "+level+"</h4> <br><p>Score: "+score+"</p>");
          n = 1;
          $("#startButton").text("Try Again");
          $("#welcome").text("Result");

      }
      // var modal = document.getElementById('myModal');
        $("#myModal").css("display", "block");
        var span = document.getElementsByClassName("close")[0];

        // modal.style.display = "block";

        span.onclick = function() {
            closeModal(gameStage);
            //modal.style.display = "none";
        }

    }
    function insideJqueryClick(){
      console.log("inside jquery clicked!");
    }
});
function justClick(){
  console.log("just click clicke!");
  insideJqueryClick();
}
