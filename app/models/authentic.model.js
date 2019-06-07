var db = require('../../config/database');
var dbFunc = require('../../config/db-function');

var authenticModel = {
    authentic: authentic,
    signup: signup,
    getUserInfoByUsername: getUserInfoByUsername
}

function authentic(authenticData) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM user WHERE username='${authenticData.username}' AND password=SHA2("${authenticData.password}", 256)`, (error, rows, fields) => {
            if (error) {
                reject(error);
            } else {
                console.log('rows authenticated ', rows);        
                resolve(rows);
            }
        });
    });

}

function getUserInfoByUsername(username) {
    console.log('getUserInfo ', username);
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM user WHERE username=${username}`, (error, rows, fields) => {
            if (error) {
                reject(error);
            } else {
                console.log('rows info ', rows);        
                resolve(rows);
            }
        });
    });
}

function signup(user) {
    return new Promise((resolve, reject) => {
        db.query("SELECT * FROM user WHERE username='"+user.username+"'", (error, rows, fields) => {
            if (error) {
                dbFunc.connectionRelease;
                reject(error);
            } else if(rows.length>0) {
                dbFunc.connectionRelease;
                reject({"success":false,"message":"user already exist ! try with different user"});
            } else {
                db.query("INSERT INTO user(username,password,clientImage)VALUES('" + user.username + "', SHA2('" + user.password + "', 256), '" +user.clientImage+ "')", (error, rows, fields) => {
                    if (error) {
                        dbFunc.connectionRelease;
                        reject(error);
                    } else {
                        dbFunc.connectionRelease;
                        console.log('User succesffully registered', rows);
                        resolve(rows);
                    }
                });
            }
        });
    });
}

module.exports = authenticModel;



