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
	searchBoulpikUsers,
	lastFiveBoulpikTirage,
	countByDate
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

async function lastFiveBoulpikTirage() {
	return BoulpikNumbers.find({})
		.limit(5)
		.exec(async function(err, objArray) {
			if (err) {
				return err;
			} else {
				return objArray;
			}
		});
}
async function addBoulpikByFecha(strfecha, _arrayFecha, objFechaBoulpik) {
	var strcmp = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" }).compare;
	var arrayBoulpik = [];
	for (let i = 0; i < objFechaBoulpik.length; i++) {
		if (strcmp(strfecha, objFechaBoulpik[i].fecha) == 0) {
			arrayBoulpik.push(objFechaBoulpik[i].boulpik);
		}
	}
	return arrayBoulpik;
}

async function checkNumberInArray(arrayList, number) {
	var condicion = 1;
	var strcmp = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" }).compare;
	for (var i = 0; i < arrayList.length; i++) {
		var value = strcmp(number, arrayList[i]);

		if (value === 0) {
			condicion = 0;
		}
	}
	return condicion;
}

async function countByDate(arrayList, fecha) {
	var count = 0;
	for (var i = 0; i < arrayList.length; i++) {
		if (strcmp(fecha, arrayList[i].fecha) == 0) {
			count = count + 1;
		}
	}
	return count;
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
	var strcmp = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" }).compare;
	var arrayBoulpik = [];
	var objBoulpik = {};
	var objArray = await BoulpikNumbers.find({});

	/*	for (let k = 0; k < objArray.length; k++) {
		for (let i = 0; i < objArray[k].Boulpik.length; i++) {
			for (let j = 0; j < objArray[k].Boulpik[i].idUser.length; j++) {
				if (strcmp(idUser, objArray[k].Boulpik[i].idUser[j]) == 0) {
					console.log("ok : ", objArray[k].Boulpik[i].idUser[j]);
					objBoulpik = Object.assign(
						{},
						{
							boulpik: objArray[k].Boulpik[i].boulpik,
							fecha: objArray[k].Boulpik[i].fecha,
							price: objArray[k].Boulpik[i].price
						}
					);

					// arrayBoulpik.push(objArray[0].Boulpik[i].boulpik);
					arrayBoulpik.push(objBoulpik);
					objBoulpik = {};
				}
			}
		}
  }*/

	var _arrayBoulpik = [];
	var _arrayFecha = [];

	for (let k = 0; k < objArray.length; k++) {
		for (let i = 0; i < objArray[k].Boulpik.length; i++) {
			for (let j = 0; j < objArray[k].Boulpik[i].idUser.length; j++) {
				if (strcmp(idUser, objArray[k].Boulpik[i].idUser[j]) == 0) {
					let condicion = await checkNumberInArray(_arrayFecha, objArray[k].Boulpik[i].fecha);
					if (condicion == 1) {
						_arrayFecha.push(objArray[k].Boulpik[i].fecha);

						_arrayBoulpik = await addBoulpikByFecha(objArray[k].Boulpik[i].fecha, _arrayFecha, objArray[k].Boulpik);

						objBoulpik = Object.assign(
							{},
							{
								arrayBoulpik: _arrayBoulpik,
								fecha: objArray[k].Boulpik[i].fecha,
								price: objArray[k].Boulpik[i].price
							}
						);

						// arrayBoulpik.push(objArray[0].Boulpik[i].boulpik);
						arrayBoulpik.push(objBoulpik);
						objBoulpik = {};
					}
				}
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
	/*var value = await UserNormal.find({ idUsersLottos: strId }, async function(err, objArray) {
		if (err) {
			return err;
		} else {
			var _objArray = {};
			_objArray = Object.assign(
				{},
				{
					_id: objArray[0]._id,
					idUsersLottos: objArray[0].idUsersLottos,
					nom: objArray[0].nom,
					ville: objArray[0].ville,
					accountId: objArray[0].accountId,
					created: objArray[0].created,
					credit: objArray[0].credit * 1,
					carrito: objArray[0].carrito
				}
			);

			return _objArray;
		}
  });*/

	var objArray = await UserNormal.find({ idUsersLottos: strId });

	var _objArray = {};
	_objArray = Object.assign(
		{},
		{
			_id: objArray[0]._id,
			idUsersLottos: objArray[0].idUsersLottos,
			nom: objArray[0].nom,
			ville: objArray[0].ville,
			accountId: objArray[0].accountId,
			created: objArray[0].created,
			credit: objArray[0].credit * 1,
			carrito: objArray[0].carrito
		}
	);

	return _objArray;
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
