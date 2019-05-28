const authenticService = require('../services/authentic.service');

const jwt = require('jsonwebtoken');

function init(router) {
    router.route('/login')
        .post(authentic); 
    router.route('/signup')
          .post(signup); 
}

function authentic(req,res) {
  var authenticData=req.body;
  
  //Validating the input entity

   authenticService.authentic(authenticData).then((data) => {
   if(data) {
      var username = data.username;
      const token = jwt.sign({username},'my_secret_key',{ expiresIn: 60*60*24 });
      res.json({
        "success":true,
        "data":data,
        "token":token
      });
    }
  }).catch((err) => {
    mail.mail(err);
    res.json(err);
  });

}


function signup(req,res) {
  var signUpData=req.body;
  
  //Validating the input entity


   authenticService.signup(signUpData).then((data) => {
    if(data) {
       res.json({
         "success":true,
         "data":data
       });
     }
   }).catch((err) => {
     mail.mail(err);
     res.json(err);
   });

}



module.exports.init = init;



