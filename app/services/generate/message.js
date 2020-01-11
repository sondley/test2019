const expressJwt = require("express-jwt");
const { secret } = require("../../../config");
const jwt = require("jsonwebtoken");

var moment = require("moment");
var request = require("request");
var countryCode = "+509";
const ServicesGenerateNumber = require("./boulpik-number");
const ServicesSearch = require("../search/search");
var mongoose = require("mongoose"),
	User = mongoose.model("Userslottos"),
	UserNormal = mongoose.model("UsersClients");

module.exports = {
	sendEmail,
	sendSMS,
	addSenderMessageUsersTransferCredit,
	addReceiverMessageUsersTransferCredit,
	addReceiverMessageUsersTransferCreditSystem,
	addMessageUsersRechargeCreditSystem,
	addMessageUsersBuyBoulpik,
	addMessageUsersSharingBoulpik,
	addMessageUsersNewDraw
};

const nodeMailer = require("nodemailer");

var transporter = nodeMailer.createTransport({
	service: "Gmail",
	auth: {
		user: "boulpikpaw@gmail.com",
		pass: "boulpikpaw1234"
	}
});

const Nexmo = require("nexmo");

const nexmo = new Nexmo({
	apiKey: "d44a662d",
	apiSecret: "aNR3ByYOLYXxd9po"
});

async function sendEmail(emailUser) {
	var mailOptions = {
		from: "Remitente",
		to: emailUser,
		subject: "BoulpikDigital",
		text: "Use your secret Id: 123-46-3425"
	};
	return transporter.sendMail(mailOptions, function(error, info) {
		if (error) {
			console.log("err.message : ", error.message);
			return { data: "", success: false, message: error.message };
		} else {
			console.log("Email sent");
			return { data: info, success: true, message: "message sent" };
		}
	});
}

//idenvoyeur, envoyeur, envfonction, receveur, recfonction, genre: genre, idreceveur, balance, credit: _credit

async function addSenderMessageUsersTransferCredit(ObjectMessage) {
	var idUser = ObjectMessage.idenvoyeur;
	var user = await User.findById(idUser);

	var arrMessage = user.message;

	var objMessage = {};
	var type = "Credit";
	var ammount = ObjectMessage.balance;
	var person = ObjectMessage.receveur;
	var boulpik = "";
	var draw = "";
	var newDate = "";

	var data = {};
	data = Object.assign({}, { ammount, person, boulpik, draw, newDate });
	var code = "6000";

	objMessage = Object.assign({}, { type: type, code: code, data: data });
	arrMessage.push(objMessage);
	var _addMessageUser = await ServicesGenerateNumber.updateMessageUsers(idUser, arrMessage);
}

async function addReceiverMessageUsersTransferCredit(ObjectMessage) {
	var idUser = ObjectMessage.idreceveur;
	var user = await User.findById(idUser);

	var arrMessage = user.message;

	var objMessage = {};
	var type = "Credit";
	var ammount = ObjectMessage.balance;
	var person = ObjectMessage.envoyeur;
	var boulpik = "";
	var draw = "";
	var newDate = "";

	var data = {};
	data = Object.assign({}, { ammount, person, boulpik, draw, newDate });
	var code = "6011";

	objMessage = Object.assign({}, { type: type, code: code, data: data });
	arrMessage.push(objMessage);
	var _addMessageUser = await ServicesGenerateNumber.updateMessageUsers(idUser, arrMessage);
}

async function addReceiverMessageUsersTransferCreditSystem(ObjectMessage) {
	var idUser = value._id;
	var user = await User.findById(idUser);

	var arrMessage = user.message;

	var objMessage = {};
	var type = "";
	var text = "";
	var data = [];
	var code = "6011";

	objMessage = Object.assign({}, { type: type, text: text });
	arrMessage.push(objMessage);
	//var _addMessageUser = await ServicesGenerateNumber.updateMessageUsers(idUser, arrMessage);
}

async function addMessageUsersSharingBoulpik(boulpik, _idUser, draw) {
	var user = await User.findById(_idUser);

	var arrMessage = user.message;

	var objMessage = {};
	var type = "Boulpik";
	var ammount = 0;
	var person = "System";
	var boulpik = boulpik;
	var draw = draw;
	var newDate = "";

	var data = {};
	data = Object.assign({}, { ammount, person, boulpik, draw, newDate });
	var code = "6006";

	objMessage = Object.assign({}, { type: type, code: code, data: data });
	arrMessage.push(objMessage);
	var _addMessageUser = await ServicesGenerateNumber.updateMessageUsers(_idUser, arrMessage);
}

async function addMessageUsersBuyBoulpik(ObjectMessage, boulpik, draw) {
	var idUser = ObjectMessage.idenvoyeur;
	var user = await User.findById(idUser);

	var arrMessage = user.message;

	var objMessage = {};
	var type = "Boulpik";
	var ammount = ObjectMessage.balance;
	var person = ObjectMessage.envoyeur;
	var boulpik = boulpik;
	var draw = draw;
	var newDate = "";

	var data = {};
	data = Object.assign({}, { ammount, person, boulpik, draw, newDate });
	var code = "6005";

	objMessage = Object.assign({}, { type: type, code: code, data: data });
	arrMessage.push(objMessage);
	var _addMessageUser = await ServicesGenerateNumber.updateMessageUsers(idUser, arrMessage);
}

async function addMessageUsersRechargeCreditSystem(ObjectMessage) {
	var idUser = value._id;
	var user = await User.findById(idUser);

	var arrMessage = user.message;

	var objMessage = {};
	var type = "";
	var text = "";
	var data = [];
	var code = "6009";

	objMessage = Object.assign({}, { type: type, text: text });
	arrMessage.push(objMessage);
	//var _addMessageUser = await ServicesGenerateNumber.updateMessageUsers(idUser, arrMessage);
}

async function addMessageUsersNewDraw(ObjectMessage) {
	//get all Users.
	var allClient = await User.find({ role: "User" });
	console.log("allClient.length : ", allClient.length);

	for (var i = 0; i < allClient.length; i++) {
		var idUser = allClient[i]._id;
		var arrMessage = allClient[i].message;

		var objMessage = {};
		var type = "Draw";
		var ammount = 0;
		var person = "System";
		var boulpik = "";
		var draw = ObjectMessage.end;
		var newDate = "";

		var data = {};
		data = Object.assign({}, { ammount, person, boulpik, draw, newDate });
		var code = "6002";

		objMessage = Object.assign({}, { type: type, code: code, data: data });
		arrMessage.push(objMessage);

		var _addMessageUser = await ServicesGenerateNumber.updateMessageUsers(idUser, arrMessage);
	}
}
async function sendSMS(phone) {
	// const from = "50942739456";
	// const to = phone;
	// const text = "BOULPIK";

	// return nexmo.message.sendSms(from, to, text, function(error, info) {
	// 	if (error) {
	// 		console.log("err.message : ", error.message);
	// 		return { data: "", success: false, message: error.message };
	// 	} else {
	// 		console.log("SMS sent");
	// 		console.log("info : ", info);
	// 		return { data: info, success: true, message: "message sent" };
	// 	}
	// });

	/*
	var mobileNumber = phone;
	var message = "Hello from Blower.io";

	request.post(
		{
			headers: {
				"content-type": "application/x-www-form-urlencoded",
				Accepts: "application/json"
			},
			url: "https://blowerio-sms-sandbox.herokuapp.com/api/v0",
			form: {
				to: countryCode + mobileNumber,
				message: message
			}
		},
		function(error, response, body) {
			if (!error && response.statusCode == 201) {
				console.log("Message sent!");
			} else {
				var apiResult = JSON.stringify(body);
				console.log("Error was: " + apiResult);
			}
		}
  );
  */

	var esendex = require("esendex")({
		username: "sondley1@gmail.com",
		password: "sondleysondley12"
	});

	var messages = {
		accountreference: "bfQEW+a3Cw+ZruHFvWD5fahu0sDCFwf18uchq7vK",
		message: [
			{
				to: "50934551156",
				body: "Sondley is the best!"
			},
			{
				to: "18296652692",
				body: "Bingo My first Test!"
			}
		]
	};

	esendex.messages.send(messages, function(err, response) {
		if (err) return console.log("error: ", err);
		console.log(response);
	});
}

/**
 * type: ["Draw","Credit","Boulpik","System"]
				text: 
				code: 
				data: [
					{
						amount: 
						person: 
						boulpik: 
						draw: 
						newDate: 
						fecha: {
							type: Date,
							default: Date.now
						}
					}
 */
