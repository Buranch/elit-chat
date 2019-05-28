var db = require('../../config/database');
var dbFunc = require('../../config/db-function');
const bcrypt = require('bcrypt');

var authenticModel = {
    authentic: authentic,
    signup: signup
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
                db.query("INSERT INTO user(username,password)VALUES('" + user.username + "', SHA2('" + user.password + "', 256))", (error, rows, fields) => {
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



