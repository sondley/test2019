const expressJwt = require("express-jwt");
const { secret } = require("../../../config");
const jwt = require("jsonwebtoken");

var moment = require("moment");

module.exports = {
	sendEmail
};

const nodeMailer = require("nodemailer");

var transporter = nodeMailer.createTransport({
	service: "Gmail",
	auth: {
		user: "boulpikpaw@gmail.com",
		pass: "boulpikpaw1234"
	}
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
