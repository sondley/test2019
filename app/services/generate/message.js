const expressJwt = require("express-jwt");
const { secret } = require("../../../config");
const jwt = require("jsonwebtoken");

var moment = require("moment");

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
		subject: "BOULPIK",
		text: "Boulpik Correo ya, esta seteado...hahaha burlado"
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
	const from = "Nexmo";
	const to = phone;
	const text = "BOULPIK";

	return nexmo.message.sendSms(from, to, text, function(error, info) {
		if (error) {
			console.log("err.message : ", error.message);
			return { data: "", success: false, message: error.message };
		} else {
			console.log("SMS sent");
			return { data: info, success: true, message: "message sent" };
		}
	});
}
