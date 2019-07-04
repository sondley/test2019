const expressJwt = require("express-jwt");
const { secret } = require("../../../config");
const jwt = require("jsonwebtoken");
var mongoose = require("mongoose"),
	User = mongoose.model("Userslottos"),
	PlayLottery = mongoose.model("PlayLotteries");
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
	playLottos
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

async function playLottos(listObject, userId) {
	var new_user = new PlayLottery(listObject);
	new_user.save(function(err, listLottos) {
		if (err) {
			return err;
		} else {
			return listLottos;
		}
	});
}
