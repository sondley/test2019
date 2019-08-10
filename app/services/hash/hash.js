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
//const bcrypt = require("bcrypt");
var crypto = require("crypto");

var moment = require("moment");
module.exports = {
	saltHashPassword,
	verifyPassWord,
	genRandomString,
	hashPassWord,
	validatePassword
};

var genRandomString = async function(length) {
	return crypto
		.randomBytes(Math.ceil(length / 2))
		.toString("hex") /** convert to hexadecimal format */
		.slice(0, length); /** return required number of characters */
};

var sha512 = async function(password, salt) {
	var hash = crypto.createHmac("sha512", salt); /** Hashing algorithm sha512 */
	hash.update(password);
	var value = hash.digest("hex");
	return {
		salt: salt,
		passwordHash: value
	};
};

async function saltHashPassword(userpassword) {
	//var salt = await genRandomString(16); /** Gives us salt of length 16 */
	//console.log("salt : ", salt);
	var passwordData = await sha512(userpassword, "16");
	console.log("UserPassword = " + userpassword);
	console.log("Passwordhash = " + passwordData.passwordHash);
	console.log("nSalt = " + passwordData.salt);
}

async function verifyPassWord(userpassword, hashedPassFromDB) {
	var passwordData = sha512(userpassword, "16");
	if (passwordData.passwordHash === hashedPassFromDB) {
		return true;
	}
	return false;
}

async function hashPassWord(password) {
	// Creating a unique salt for a particular user
	var salt = crypto.randomBytes(16).toString("hex");

	// Hashing user's salt and password with 1000 iterations, 64 length and sha512 digest
	var hash = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);
	return { hash, salt };
}

async function validatePassword(password, salt, _hash) {
	var condition = 0;
	var hash = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);

	if (hash == _hash) {
		condition = 1;
	}
	return condition;
}
