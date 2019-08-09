const expressJwt = require("express-jwt");
const { secret } = require("../../../config");
const jwt = require("jsonwebtoken");
var mongoose = require("mongoose"),
	User = mongoose.model("Userslottos"),
	
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
	clientRecharge
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

async function clientRecharge(token, Acount_number) {
	
}

