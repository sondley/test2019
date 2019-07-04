// =================================================================
// get the packages we need ========================================
// =================================================================
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var morgan = require("morgan");
var mongoose = require("mongoose");
const cors = require("cors");

var jwt = require("jsonwebtoken"); // used to create, sign, and verify tokens
var config = require("./config"); // get our config file
var Utlisateurs = require("./app/models/user"); // get our mongoose model
var UsersClients = require("./app/models/user-client"); // get our mongoose model
var UsersAdmins = require("./app/models/user-admin"); // get our mongoose model
var UsersAuth = require("./app/models/user-auth"); // get our mongoose model
var UsersDetaillants = require("./app/models/user-detaillant"); // get our mongoose model
var UsersSuper = require("./app/models/user-super"); // get our mongoose model
var AccountNumbers = require("./app/models/account-number"); // get our mongoose model
var BoulpikNumbers = require("./app/models/boulpik-number"); // get our mongoose model
var BoulpikNumbers = require("./app/models/prime-boulpik"); // get our mongoose model

var InfoBoulpik = require("./app/models/info-boulpik"); // get our mongoose model

// var Lotteries = require("./app/models/lottery"); // get our mongoose model
// var _TransactionsCredits = require("./app/models/transaction-credit");

const errorHandler = require("./app/services/error/error");

// const Nexmo = require("nexmo");

// const nexmo = new Nexmo(
// 	{
// 		apiKey: "9ae301ef",
// 		apiSecret: "M18mcma1GcwqXbMP"
// 	},
// 	{ debug: true }
// );

// nexmo.message.sendSms("50942739456", "50935192562", "Heloo Serdjee , se Sondley", (err, responseData) => {
// 	if (err) {
// 		console.log(err);
// 	} else {
// 		console.log(JSON.stringify(responseData, null, 2));
// 	}
// });

// const accountSid = "ACe37c730a83daa723e74a7ddbd1944d47";
// const authToken = "a1348c85cf2d5bb9d6390273240831a8";
// const client = require("twilio")(accountSid, authToken);

// client.messages
// 	.create({
// 		body: "Mr Serdjee Mondesir, quelqu'un est en train de pirater votre Telephone.#Hacker",
// 		from: "+13365257626",
// 		to: "+50942739456"
// 	})
// 	.then(message => console.log("sondley : ", message.sid));

// var request = require("request");

// request.post(
// 	"https://textbelt.com/text",
// 	{
// 		form: {
// 			phone: "+50942739456",
// 			message: "Hello world",
// 			key: "textbelt"
// 		}
// 	},
// 	function(err, httpResponse, body) {
// 		if (err) {
// 			console.error("Error:", err);
// 			return;
// 		}
// 		console.log(JSON.parse(body));
// 		console.log("Bingo ");
// 	}
// );

// =================================================================
// configuration ===================================================
// =================================================================
var port = process.env.PORT || 8080; // used to create, sign, and verify tokens
mongoose.connect(config.database); // connect to database
app.set("superSecret", config.secret); // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});
app.use(errorHandler);

// use morgan to log requests to the console
app.use(morgan("dev"));

var routesUsers = require("./app/routes/user"); //importing route
//var routesLotteries = require("./app/routes/lottery"); //importing route

routesUsers(app); //register the route
//routesLotteries(app); //register the route

// =================================================================
// start the server ================================================
// =================================================================
app.listen(port);
console.log("Magic happens at http://localhost:" + port);
