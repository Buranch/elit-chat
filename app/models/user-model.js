var db = require('../../config/database');
var dbFunc = require('../../config/db-function');

var userModel = {
   getAllUser:getAllUser,
   addUser:addUser,
   updateUser:updateUser,
   deleteUser:deleteUser,
   getUserById:getUserById,
   initDB: initDB,
   createUserTable: createUserTable,
   getUserByUsername: getUserByUsername,
   dropTableByName: dropTableByName,
   createConvTable: createConvTable,
   createMessageTable: createMessageTable
}

function getAllUser() {
    return new Promise((resolve,reject) => {
        db.query(`SELECT * From user`,(error,rows,fields)=>{
            if(!!error) {
                dbFunc.connectionRelease;
                reject(error);
            } else {
                dbFunc.connectionRelease;
                console.log('rows ', rows)
                resolve(rows[0]);
            }
       });
    });
}

function initDB() {
    console.log('initialBD');
    return new Promise((resolve, reject) => {
        db.query("CREATE DATABASE IF NOT EXISTS ChatApp;", (error, value) => {
            if(!!error) {
                console.log("error ", error);
                dbFunc.connectionRelease;
                reject("error");
            } else {
                dbFunc.connectionRelease;
                console.log('DB created');
                resolve(value)
            }
        })
    })
}

function createUserTable() {
    return new Promise((resolve, reject) => {
        db.query('CREATE TABLE IF NOT EXISTS user (username VARCHAR(255), password VARCHAR(255), clientImage VARCHAR(255))', (error, value) => {
            if(!!error) {
                console.log("error ", error);
                dbFunc.connectionRelease;
                reject("error");
            } else {
                dbFunc.connectionRelease;
                console.log('User Table created');
                resolve(value)
            }
        })
    })

}
function createConvTable() {
    return new Promise((resolve, reject) => {
        db.query('CREATE TABLE IF NOT EXISTS convs (id VARCHAR(255), pas_1 VARCHAR(255), pas_2 VARCHAR(255))', (error, value) => {
            if(!!error) {
                console.log("error ", error);
                dbFunc.connectionRelease;
                reject("error");
            } else {
                dbFunc.connectionRelease;
                console.log('Conv Table created');
                resolve(value)
            }
        })
    })

}


function createMessageTable() {
    return new Promise((resolve, reject) => {
        db.query('CREATE TABLE IF NOT EXISTS messages (convId VARCHAR(255), author VARCHAR(255), body VARCHAR(255), timestamp VARCHAR(255))', (error, value) => {
            if(!!error) {
                console.log("error ", error);
                dbFunc.connectionRelease;
                reject("error");
            } else {
                dbFunc.connectionRelease;
                console.log('Messages Table created');
                resolve(value)
            }
        })
    })

}


function dropTableByName(name) {
    return new Promise((resolve, reject) => {
        db.query('DROP TABLE '+name+";", (error, value) => {
            if(!!error) {
                console.log("error ", error);
                dbFunc.connectionRelease;
                reject("error");
            } else {
                dbFunc.connectionRelease;
                console.log('Table Dropped');
                resolve(value)
            }
        })
    })

    
}

function getUserByUsername(username) {
    return new Promise((resolve,reject) => {
        db.query("SELECT * FROM user WHERE username="+username,(error,rows,fields)=>{
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

function getUserById(id) {
    return new Promise((resolve,reject) => {
        db.query("SELECT * FROM test WHERE id ="+id.id,(error,rows,fields)=>{
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

function addUser(user) {
     return new Promise((resolve,reject) => {
         db.query("INSERT INTO test(name,age,state,country)VALUES('"+user.name+"','"+user.age+"','"+user.state+"','"+user.country+"')",(error,rows,fields)=>{
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


function updateUser(id,user) {
    return new Promise((resolve,reject) => {
        db.query("UPDATE test set name='"+user.name+"',age='"+user.age+"',state='"+user.state+"',country='"+user.country+"' WHERE id='"+id+"'",(error,rows,fields)=>{
            if(!!error) {
                dbFunc.connectionRelease;
                reject(error);
            } else {
                dbFunc.connectionRelease;
                resolve(rows);
            }
       });    
    })
}

function deleteUser(id) {
   return new Promise((resolve,reject) => {
        db.query("DELETE FROM test WHERE id='"+id+"'",(error,rows,fields)=>{
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


module.exports = userModel;

