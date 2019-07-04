const expressJwt = require("express-jwt");
const { secret } = require("../../../config");
const jwt = require("jsonwebtoken");
var mongoose = require("mongoose"),
	User = mongoose.model("Userslottos"),
	PrimesBoulpiks = mongoose.model("PrimesBoulpiks");

var moment = require("moment");
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
	createPrimeBoulpik,
	UpdatePrimeBoulpik
};

async function getUserById(userId) {
	User.find({ _id: userId }, function(err, user) {
		if (err) {
			return err;
		} else {
			return user;
		}
	});
}

async function createPrimeBoulpik(objUsers) {
	var new_user = new PrimesBoulpiks(objUsers);
	return new_user.save(async function(err, user) {
		if (err) {
			return { success: false, data: "", message: err };
		} else {
			return user;
		}
	});
}

async function UpdatePrimeBoulpik(objUsers) {
	let message = "";
	return PrimesBoulpiks.findOneAndUpdate({ _id: req.params.primeId }, req.body, { new: true }, function(err, user) {
		if (err) {
			return { data: {}, success: false, message: err };
		} else {
			return { data: user, success: true, message: message };
		}
	});
}
