console.log('mysql loading');
var mysql = require('mysql');
// var connection = mysql.createConnection({
//   host     : 'localhost',
//   user     : 'root',
//   password : 'password',
//   insecureAuth : true
// });
 
// connection.connect(function(err) {
//     if(err) throw err;
//     console.log('Connected');
//     const createDB = 'CREATE DATABASE IF NOT EXISTS ChatApp;'
//     // creating DB
//     connection.query(createDB, function(err, result) {
//         if(err) throw err;
//         console.log('Database Created');
//     });

//     connection.query("use ChatApp", function(err, result) {
//         if(err) throw err;
//         console.log("ChatApp DB selected");
//     })

//     // Create Login Table
//     connection.query('CREATE TABLE IF NOT EXISTS Login (name VARCHAR(255), password VARCHAR(255))', function (error, results, fields) {
//       if (error) throw error;
//       console.log('Login Table created');
//     });

//     // Insert into Table 
//     // connection.query("INSERT INTO Login (name, password) VALUES ('Buranch', 'passw0rd')", function(err, results) {
//     //     if(err) throw err;
//     //     console.log('1 record inserted');
//     // });

//     connection.query("SELECT * From Login", function(err, results) {
//         if(err) throw err;
//         console.log('results ', results);
//     })

//     connection.end();
// });
//  require('./app/models/user-model.js').initDB();
// require('./app/models/user-model.js').dropTableByName('messages');
// require('./app/models/user-model.js').createUserTable();
//  require('./app/models/user-model.js').getAllUser();

// require('./app/models/user-model.js').createConvTable();
// require('./app/models/user-model.js').createMessageTable();

// SignUp
// require('./app/models/authentic.model').signup({username: 'buranch2', password: 'buranch'})
// .then(data => console.log('data ', data))
// .catch(e => console.log('e ', e));

// require('./app/models/authentic.model.js').authentic({username: 'buranch2', password: 'buranch'})
// .then(data => console.log('data ', data))
// .catch(e => console.log('e ', e));


// require('./app/models/chat-model.js').createConv({id: 'user1_user_2', pass_1: 'user1', pass_2: 'user2'})
// .then(data => console.log('data ', data))
// .catch(e => console.log('e ', e));

require('./app/models/chat-model.js').getAllMessages()
.then(data => console.log('data ', data))
.catch(e => console.log('e ', e));

// require('./app/models/chat-model.js').addMessage({convId: 'user1_user_2', author: 'user_1', body: 'this is the body', timestamp: ''+ new Date()})
// .then(data => console.log('data ', data))
// .catch(e => console.log('e ', e));
