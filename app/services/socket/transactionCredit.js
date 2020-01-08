var express = require("express");
var app = express();
const server = require("http").createServer(app);
const io = require("socket.io").listen(server);

var lodash = require("lodash");
var mongoose = require("mongoose"),
	User = mongoose.model("Userslottos"),
	UserNormal = mongoose.model("UsersClients"),
	UserAmin = mongoose.model("UsersAdmins"),
	UserSuper = mongoose.model("UsersSupers"),
	UsersAuths = mongoose.model("UsersAuths"),
	Transaction = mongoose.model("TransactionsBoulpiks"),
	UsersDetaillants = mongoose.model("UsersDetaillants"),
	BoulpikNumbers = mongoose.model("BoulpikNumbers");

var config = require("../../../config");

module.exports = {
	TransactionCredit
};

async function TransactionCredit(objectTransaction) {}
