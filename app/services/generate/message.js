const expressJwt = require("express-jwt");
const { secret } = require("../../../config");
const jwt = require("jsonwebtoken");

var moment = require("moment");
var request = require("request");
var countryCode = "+509";

module.exports = {
	sendEmail,
	sendSMS
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
		subject: "MotoXpress",
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
