const expressJwt = require("express-jwt");
const { secret } = require("../../../config");
const jwt = require("jsonwebtoken");
var mongoose = require("mongoose"),
	User = mongoose.model("Userslottos"),
	TransactionMoncash = mongoose.model("TransactionMoncash");
//PlayLottery = mongoose.model("PlayLotteries");
var moment = require("moment");

const ServicesSearch = require("../search/search");
const Servicesmessage = require("../generate/message");
/*
if (err){
      res.json({data:{},success:false, message:err});
    }else{
      res.json({data:results,success:true, message:message}
      );
    } 
*/

module.exports = {
	getUserById,
	playLottos,
	getTransactionRequestByOrderId,
	updateUserTransactionMoncash,
	createMoncashTransaction,
};

async function getTransactionRequestByOrderId(orderId, dateTransaction) {
	TransactionMoncash.findOne({ orderId: orderId }, function (err, transaction) {
		console.log("Transaction : ", transaction);
		if (err) {
			return err;
		} else {
			return transaction;
		}
	});
}

async function createMoncashTransaction(objTransaction) {
	var new_transaction = new TransactionMoncash(objTransaction);
	await new_transaction.save();

	return new_transaction;
}

async function updateUserTransactionMoncash(userId, capture) {
	const idenvoyeur = "";

	const envoyeur = "MonCash";
	const envfonction = "System";

	var _User = await ServicesSearch.searchUsersByID(userId);
	console.log("User : ", _User);

	const idreceveur = _User._id;
	const genre = "Recharge";
	const receveur = _User.nom;
	const recfonction = _User.role;

	await ServicesSearch.upBalanceById(idreceveur, capture.cost);

	var objTransaction = Object.assign(
		{},
		{ idenvoyeur, envoyeur, envfonction, receveur, recfonction, genre: genre, idreceveur, balance: capture.cost }
	);

	//console.log("Transaction : ", objTransaction);

	await ServicesSearch.createTransaction(objTransaction);
	//await Servicesmessage.addSenderMessageUsersTransferCredit(objTransaction);
	await Servicesmessage.addReceiverMessageUsersTransferCredit(objTransaction);
}

async function getUserById(userId) {
	User.find({ _id: userId }, function (err, user) {
		if (err) {
			return err;
		} else {
			return user;
		}
	});
}

async function playLottos(listObject, userId) {
	var new_user = new PlayLottery(listObject);
	new_user.save(function (err, listLottos) {
		if (err) {
			return err;
		} else {
			return listLottos;
		}
	});
}
