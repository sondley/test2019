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
	searchUsersDetaillants,
	searchUsersByID,
	searchUsersCompletByID,
	searchBoulpikUsers
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
async function searchBoulpikUsers(idUser) {
	var arrayBoulpik = [];
	var objArray = await BoulpikNumbers.find({});
	for (let i = 0; i < objArray[0].Boulpik.length; i++) {
		for (let j = 0; j < objArray[0].Boulpik[i].idUser.length; j++) {
			if (objArray[0].Boulpik[i].idUser[j] == idUser) {
				arrayBoulpik.push(objArray[0].Boulpik[i].boulpik);
			}
		}
	}

	return arrayBoulpik;
}

async function searchUsersCompletByID(userId) {
	let message = "";
	var _dataInfo = {};
	return await User.findById(userId, async function(err, user) {
		if (err) {
			return { data: {}, success: false, message: err };
		} else {
			//console.log("user : ", user);
			if (user.role == "Super") {
				_dataInfo = await searchUsersSuper(user._id);
			} else if (user.role == "Admin") {
				_dataInfo = await searchUsersAdmin(user._id);
			} else if (user.role == "User") {
				_dataInfo = await searchUsersClient(user._id);
			} else if (user.role == "Detaillants") {
				_dataInfo = await searchUsersDA(user._id);
			} else if (user.role == "Distributeurs") {
				_dataInfo = await searchUsersDetaillants(user._id);
			}
			//console.log("_dataInfo : ", _dataInfo);
			//return _dataInfo;
			return await { data: { user, _dataInfo }, success: true, message: message };
		}
	});
}
async function searchUsersByID(strId) {
	return User.find({ _id: strId }, function(err, objArray) {
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
