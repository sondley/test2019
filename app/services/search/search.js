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

var moment = require("moment");

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
	countByDate,
	countUserByDate,
	countHaveUserPlay,
	havePlay,
	getBalanceById,
	setBalanceById,
	upBalanceById,
	setArrayWinners,
	searchUsersByEmailOrPhone,
	createTransaction,
	searchUsersTransactions,
	setCartUserNull,
	searchSonUsersTransactions
};

async function setArrayWinners(arrayWinner, fecha) {
	return await BoulpikNumbers.findOneAndUpdate(
		{ end: fecha },
		{ $set: { arrayWinner: arrayWinner, etat: 0 } },
		{ new: true }
	).then(resultSet => {
		//console.log("hoooo : ", resultSet);
		return resultSet;
	});

	//return user.credit * 1;
}

async function setCartUserNull(idUser, arrayNumbers) {
	const _User = await UserNormal.findOne({ idUsersLottos: idUser });

	const oldCarrito = _User.carrito;

	if (arrayNumbers.length == oldCarrito.length) {
		return await UserNormal.findOneAndUpdate({ idUsersLottos: idUser }, { $set: { carrito: [] } }, { new: true }).then(
			resultSet => {
				//console.log("hoooo : ", resultSet);
				return resultSet;
			}
		);
	}

	for (var i = 0; i < arrayNumbers.length; i++) {
		for (var j = 0; j < oldCarrito.length; j++) {
			if (arrayNumbers[i].boulpik === oldCarrito[j].boulpik) {
				oldCarrito.splice(i, 1);
			}
		}
	}

	return await UserNormal.findOneAndUpdate(
		{ idUsersLottos: idUser },
		{ $set: { carrito: oldCarrito } },
		{ new: true }
	).then(resultSet => {
		//console.log("hoooo : ", resultSet);
		return resultSet;
	});

	//return user.credit * 1;
}
async function getBalanceById(idUser) {
	var user = await User.findById(idUser);

	return user.credit * 1;
}

async function createTransaction(objTransaction) {
	var new_transaction = new Transaction(objTransaction);
	await new_transaction.save();
}

async function setBalanceById(idUser, _balance) {
	var user = await User.findById(idUser);
	var balance = user.credit * 1;
	balance = balance - _balance;
	await User.findOneAndUpdate({ _id: idUser }, { $set: { credit: balance } }, { new: true }).then(resultSet => {
		return resultSet;
	});
}

async function upBalanceById(idUser, _balance) {
	var user = await User.findById(idUser);
	var balance = user.credit * 1;
	_balance = _balance * 1;
	balance = balance + _balance;
	await User.findOneAndUpdate({ _id: idUser }, { $set: { credit: balance } }, { new: true }).then(resultSet => {
		return resultSet;
	});
}

async function searchUsersInArrayList(arraId) {
	return User.find({ _id: { $in: arraId } }, function(err, objArray) {
		if (err) {
			return err;
		} else {
			return objArray;
		}
	});
}
async function countUserByDate(boulpik, fecha) {
	var strcmp = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" }).compare;
	var Boulpik = await BoulpikNumbers.find({ end: fecha });
	let count = 0;

	for (let i = 0; i < Boulpik[0].Boulpik.length; i++) {
		var _fecha = strcmp(fecha, Boulpik[0].Boulpik[i].fecha);

		var _boulpik = strcmp(boulpik, Boulpik[0].Boulpik[i].boulpik);

		if (_fecha == 0 && _boulpik == 0) {
			for (let j = 0; j < Boulpik[0].Boulpik[i].idUser.length; j++) {
				count = count + 1;
			}
		}
	}

	return count;
}

async function havePlay(idUser, boulpik, fecha) {
	var strcmp = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" }).compare;
	var Boulpik = await BoulpikNumbers.find({ end: fecha });
	let count = 0;
	let play = 0;
	let user = [];

	for (let i = 0; i < Boulpik[0].Boulpik.length; i++) {
		var _fecha = strcmp(fecha, Boulpik[0].Boulpik[i].fecha);

		var _boulpik = strcmp(boulpik, Boulpik[0].Boulpik[i].boulpik);

		if (_fecha == 0 && _boulpik == 0) {
			user = Boulpik[0].Boulpik[i].idUser;
			for (let j = 0; j < Boulpik[0].Boulpik[i].idUser.length; j++) {
				count = count + 1;
			}
		}
	}

	if ((await checkNumberInArray(user, idUser)) == 0) {
		play = 1;
	}
	return play;
}

async function countHaveUserPlay(idUser, fecha) {
	var strcmp = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" }).compare;
	var Boulpik = await BoulpikNumbers.find({ end: fecha });
	let count = 0;

	for (let i = 0; i < Boulpik[0].Boulpik.length; i++) {
		var _fecha = strcmp(fecha, Boulpik[0].Boulpik[i].fecha);

		var condicion = await checkNumberInArray(Boulpik[0].Boulpik[i].idUser, idUser);

		if (_fecha == 0 && condicion == 0) {
			count = count + 1;
		}
	}

	return count;
}

async function lastFiveBoulpikTirage() {
	return BoulpikNumbers.find({ etat: 0 })
		.limit(5)
		.sort({ date: "desc" })
		.exec(async function(err, objArray) {
			if (err) {
				return err;
			} else {
				return objArray;
			}
		});
}

async function checkNumberInArray2(arrayList, number) {
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
async function addBoulpikByFecha(strfecha, idUser, objFechaBoulpik) {
	var strcmp = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" }).compare;
	var arrayBoulpik = [];

	for (let i = 0; i < objFechaBoulpik.length; i++) {
		var condicion = await checkNumberInArray(objFechaBoulpik[i].idUser, idUser);

		if (strcmp(strfecha, objFechaBoulpik[i].fecha) == 0 && condicion == 0) {
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
	var strcmp = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" }).compare;
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

	var _arrayBoulpik = [];
	var _arrayFecha = [];

	for (let k = 0; k < objArray.length; k++) {
		for (let i = 0; i < objArray[k].Boulpik.length; i++) {
			for (let j = 0; j < objArray[k].Boulpik[i].idUser.length; j++) {
				if (strcmp(idUser, objArray[k].Boulpik[i].idUser[j]) == 0) {
					let condicion = await checkNumberInArray(_arrayFecha, objArray[k].Boulpik[i].fecha);
					if (condicion == 1) {
						_arrayFecha.push(objArray[k].Boulpik[i].fecha);

						_arrayBoulpik = await addBoulpikByFecha(objArray[k].Boulpik[i].fecha, idUser, objArray[k].Boulpik);

						objBoulpik = Object.assign(
							{},
							{
								arrayBoulpik: _arrayBoulpik,
								fecha: objArray[k].Boulpik[i].fecha,
								price: objArray[k].Boulpik[i].price
							}
						);

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
async function searchUsersByEmailOrPhone(strId) {
	return User.findOne({ $or: [{ email: strId }, { tel: strId }] }, function(err, objArray) {
		if (err) {
			return err;
		} else {
			return objArray;
		}
	});
}

async function searchUsersTransactions(idUser) {
	return Transaction.find({ $or: [{ idreceveur: idUser }, { idenvoyeur: idUser }] }, function(err, objArray) {
		if (err) {
			return err;
		} else {
			return objArray;
		}
	});
}

/**Admin create DA and Detaillants */
async function getIdSonAdmin(idUser) {
	var idDA = await UsersAuths.find({ idCreateur: idUser });
	var idDetaillants = await UsersDetaillants.find({ idCreateur: idUser });
	return { idDA, idDetaillants };
}

/**Super create Admin and DA */
async function getIdSonSuper(idUser) {
	var idAdmin = await UserAmin.find({ idCreateur: idUser });
	var idDA = await UsersAuths.find({ idCreateur: idUser });
	return { idAdmin, idDA };
}

async function searchSonUsersTransactions(idUser) {
	const _user = await searchUsersByID(idUser);
	const userRole = _user[0].role;

	if (userRole == "Super") {
		var headTree = await getIdSonSuper(idUser);
		const objSonAdmin = headTree.idAdmin;
		const objSonDA = headTree.idDA;
		//console.log("headTree.idAdmin : ", objSonAdmin);
		//var next = await getIdSonAdmin(headTree.idAdmin[4].idCreateur);
		console.log("next  : ", next);
	} else if (userRole == "Admin") {
	}
	const transactionsAdmin = await UserAmin.find({});
	return Transaction.find({ $or: [{ idreceveur: idUser }, { idenvoyeur: idUser }] }, function(err, objArray) {
		if (err) {
			return err;
		} else {
			return objArray;
		}
	});
}

async function searchUsersClient(strId) {
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
