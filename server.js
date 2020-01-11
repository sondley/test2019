// =================================================================
// get the packages we need ========================================
// =================================================================
var express = require("express");
var app = express();
const server = require("http").createServer(app);
//const io = require("socket.io").listen(server);

var socketIO = require("socket.io");
var socketIOHelper = require("./app/services/socket/socketio");
var CronJob = require("cron");

var bodyParser = require("body-parser");
var morgan = require("morgan");
var mongoose = require("mongoose");

const MongoClient = require("mongodb").MongoClient;
const cors = require("cors");

var jwt = require("jsonwebtoken"); // used to create, sign, and verify tokens
var config = require("./config"); // get our config file
var Utlisateurs = require("./app/models/user"); // get our mongoose model
var Eznas = require("./app/models/eznas"); // get our mongoose model
var UsersClients = require("./app/models/user-client"); // get our mongoose model
var UsersAdmins = require("./app/models/user-admin"); // get our mongoose model
var UsersAuth = require("./app/models/user-auth"); // get our mongoose model
var UsersDetaillants = require("./app/models/user-detaillant"); // get our mongoose model
var UsersSuper = require("./app/models/user-super"); // get our mongoose model
var AccountNumbers = require("./app/models/account-number"); // get our mongoose model
var BoulpikNumbers = require("./app/models/boulpik-number"); // get our mongoose model
var _BoulpikNumbers = require("./app/models/prime-boulpik"); // get our mongoose model
var city = require("./app/models/city"); // get our mongoose model
var transaction = require("./app/models/transaction"); // get our mongoose model

var InfoBoulpik = require("./app/models/info-boulpik"); // get our mongoose model

const errorHandler = require("./app/services/error/error");

// =================================================================
// configuration ===================================================
// =================================================================
var port = process.env.PORT || 8080; // used to create, sign, and verify tokens
mongoose.connect(config.database); // connect to database
//const url = "mongodb://127.0.0.1:27017";
//mongoose.connect(url);

/*MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
	if (err) return console.log(err);

	// Storing a reference to the database so you can use it later
	//db = client.db(dbName)
	console.log(`Connected MongoDB: ${url}`);
	//console.log(`Database: ${dbName}`)
});*/

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

/**Configuracion del Server Socket IO */

//var io = socketIO(server);
//socketIOHelper.set(io);
//var receivers = require("./app/services/socket/receivers.server.sockets");
//receivers.receivers(io);

//===========================
//Tirage Auto by Current Date

var schedule = require("node-schedule");
const cron = require("node-cron");

const servicesTirage = require("./app/services/generate/tirage");
//console.log("Date : ", new Date());
//var date = "00" + " " + "15" + " " + 19 + " " + 8 + " " + "*";

//cron.schedule(date, () => {
//console.log("running a task every minute");

var fecha = servicesTirage.fechaTirageActual().then(result => {
	//console.log("fecha : ", result);

	const numbers = result.split("/");
	const year = parseInt(numbers[2]);
	var month = parseInt(numbers[1]);
	var day = parseInt(numbers[0]);
	//day = day - 1;

	var date = "41" + " " + "9" + " " + 30 + " " + month + " " + "*";
	//var fechaTirache = day + "/" + month + "/" + year;

	//console.log("date : ", date);
	//console.log("result : ", result);

	//	var j = cron.schedule("12 4 9 8 *", function() {
	//console.log("The world is going to end today888888.");

	///////*MON CASH TEST
	cron.schedule(date, () => {
		console.log("The world is going to end today.");
		var executeTirage = servicesTirage.generateAutoTirage(result).then(response => {});
		var payNow = servicesTirage.payClient(result);
		console.log("The world is going to end today.");
	});
});

//});

// var j = schedule.scheduleJob((2019, 8, 9), function() {
// 	console.log("The world is going to end today.");
// });

// =================================================================
// start the server ================================================
// =================================================================
app.listen(port);
console.log("Magic happens at http://localhost:" + port);
