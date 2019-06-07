var authenticModel = require("../models/authentic.model");


var authenticService = {
    authentic: authentic,
    signup:signup,
    getUserInfoByUsername:getUserInfoByUsername
}

function authentic(authenticData) {
    return new Promise((resolve,reject) => {
        authenticModel.authentic(authenticData).then((data)=>{
            resolve(data);
        }).catch((err) => {
            reject(err);
        })
    })
   
}

function signup(signUpData) {
    
    return new Promise((resolve,reject) => {
        authenticModel.signup(signUpData).then((data)=>{
            resolve(data);
        }).catch((err) => {
            reject(err);
        })
    })
   
}

function getUserInfoByUsername(username) {
    return new Promise((resolve,reject) => {
        authenticModel.getUserInfoByUsername(username).then((data)=>{
            resolve(data);
        }).catch((err) => {
            reject(err);
        })
    })
}



module.exports = authenticService;

