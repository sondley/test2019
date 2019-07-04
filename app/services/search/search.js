const expressJwt = require("express-jwt");
const { secret } = require("../../../config");
const jwt = require("jsonwebtoken");
var mongoose = require("mongoose"),
	User = mongoose.model("Userslottos"),
	UserNormal = mongoose.model("UsersClients"),
	UserAmin = mongoose.model("UsersAdmins"),
	UserSuper = mongoose.model("UsersSupers"),
	UsersAuths = mongoose.model("UsersAuths"),
	UsersDetaillants = mongoose.model("UsersDetaillants"),
	BoulpikNumbers = mongoose.model("BoulpikNumbers");

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
	searchUsersInArrayList,
	searchUsersByRole,
	searchUsersClient,
	searchUsersSuper,
	searchUsersAdmin,
	searchUsersDA,
	searchUsersDetaillants
};

async function searchUsersInArrayList(arraId) {
	return User.find({ _id: { $in: arraId } }, function(err, objArray) {
		if (err) {
			return err;
		} else {
			return objArray;
		}
	});
}

async function searchUsersByRole(strRole) {
	return User.find({ role: strRole }, function(err, objArray) {
		if (err) {
			return err;
		} else {
			return objArray;
		}
	});
}

async function searchUsersClient(strId) {
	return UserNormal.find({ idUsersLottos: strId }, function(err, objArray) {
		if (err) {
			return err;
		} else {
			return objArray;
		}
	});
}

async function searchUsersSuper(strId) {
	return UserSuper.find({ idUsersLottos: strId }, function(err, objArray) {
		if (err) {
			return err;
		} else {
			return objArray;
		}
	});
}

async function searchUsersAdmin(strId) {
	return UserAmin.find({ idUsersLottos: strId }, function(err, objArray) {
		if (err) {
			return err;
		} else {
			return objArray;
		}
	});
}

async function searchUsersDA(strId) {
	return UsersAuths.find({ idUsersLottos: strId }, function(err, objArray) {
		if (err) {
			return err;
		} else {
			return objArray;
		}
	});
}

async function searchUsersDetaillants(strId) {
	return UsersDetaillants.find({ idUsersLottos: strId }, function(err, objArray) {
		if (err) {
			return err;
		} else {
			return objArray;
		}
	});
}
