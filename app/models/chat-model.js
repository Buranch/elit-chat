var db = require('../../config/database');
var dbFunc = require('../../config/db-function');


var chatModel = {
    createConv: createConv,
    addMessage: addMessage,
    getAllConvs: getAllConvs,
    getAllMessages: getAllMessages
};


function createConv(conv) {
    return new Promise((resolve,reject) => {
        db.query("SELECT * FROM convs WHERE id='"+conv.id+"'", (error, rows, fields) => {
            if (error) {
                dbFunc.connectionRelease;
                reject(error);
            } else if(rows.length>0) {
                dbFunc.connectionRelease;
                console.log('already exist');
                reject({"success":false,"message":"conv already exist ! try with different conv"});
            } else {
                    db.query("INSERT INTO convs(id,pas_1,pas_2)VALUES('"+conv.id+"','"+conv.pass_1+"','"+conv.pass_2+"')",(error,rows,fields)=>{
                    if(error) {
                        dbFunc.connectionRelease;
                        reject(error);
                    } else {
                        dbFunc.connectionRelease;
                        resolve(rows);
                    }
                    });
                }
            });
        });
}


function getAllConvs() {
    return new Promise((resolve,reject) => {
        db.query("SELECT * FROM convs",(error,rows,fields)=>{
            if(!!error) {
                dbFunc.connectionRelease;
                reject(error);
            } else {
                dbFunc.connectionRelease;
                resolve(rows);
            }
       });
    });  
}

function getAllMessages() {
    return new Promise((resolve,reject) => {
        db.query("SELECT * FROM messages",(error,rows,fields)=>{
            if(!!error) {
                dbFunc.connectionRelease;
                reject(error);
            } else {
                dbFunc.connectionRelease;
                resolve(rows);
            }
       });
    });  
}


function addMessage(message) {
    return new Promise((resolve,reject) => {
        db.query("INSERT INTO messages(convId,author,body, timestamp)VALUES('"+message.convId+"','"+message.author+"','"+message.body+"','"+message.timestamp+"')",(error,rows,fields)=>{
           if(error) {
               dbFunc.connectionRelease;
               reject(error);
           } else {
               dbFunc.connectionRelease;
               resolve(rows);
           }
         });
       });
}



module.exports = chatModel;
