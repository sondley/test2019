const expressJwt = require("express-jwt");
const { secret } = require("../../../config");
const jwt = require("jsonwebtoken");
var mongoose = require("mongoose"),
	User = mongoose.model("Userslottos"),
	UserNormal = mongoose.model("UsersClients"),
	UserAmin = mongoose.model("UsersAdmins"),
	UserSuper = mongoose.model("UsersSupers"),
	UsersAuths = mongoose.model("UsersAuths"),
	Transaction = mongoose.model("TransactionsBoulpiks"),
	UsersDetaillants = mongoose.model("UsersDetaillants"),
	BoulpikNumbers = mongoose.model("BoulpikNumbers");
const bcrypt = require("bcrypt");

var moment = require("moment");

module.exports = {
	hashPassWord,
	verifyPassWord
};

async function hashPassWord(strPassword) {
	let hashCode = await bcrypt.hashSync(strPassword, 10);
	return hashCode;
}

async function verifyPassWord(hashPassWord, strPassword) {
	var condition;
	if (bcrypt.compareSync(strPassword, hashPassWord)) {
		condition = 1;
	} else {
		condition = 0;
	}
	return condition;
}
