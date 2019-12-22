const expressJwt = require("express-jwt");
const { secret } = require("../../../config");
const jwt = require("jsonwebtoken");
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
	searchSonUsersTransactions,
	arrayUser,
	getPinByTel,
	verifyemail,
	_sendMail,
	read_a_message,
	sendToCodeToEmail,
	setPasswordUser
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

async function getPinByTel(tel) {
	var message = "Not Found";
	var data = {};
	var success = false;
	var user = await User.findOne({ tel: tel });
	if (user) {
		message = "Found";
		success = true;
		data = Object.assign({}, { user, message, success });

		return data;
	} else {
		success = false;
		data = Object.assign({}, { user, message, success });

		return data;
	}
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

async function clearCart() {
	return User.findOneAndUpdate({ _id: idUser }, { $set: { motDePasse: newMotDePasse } }, { new: true }, function(
		err,
		user
	) {
		if (err) {
			return { data: {}, success: false, message: "0211" };
		} else {
			return { data: user, success: true, message: "0501" };
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

async function arrayUser(idUser, objArray, k) {
	var strcmp = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" }).compare;
	var arrayBoulpik = [];
	var objBoulpik = {};

	var _arrayBoulpik = [];
	var _arrayFecha = [];

	for (let i = 0; i < objArray[k].Boulpik.length; i++) {
		for (let j = 0; j < objArray[k].Boulpik[i].idUser.length; j++) {
			if (strcmp(idUser, objArray[k].Boulpik[i].idUser[j]) == 0) {
				let condicion = await checkNumberInArray(_arrayFecha, objArray[k].Boulpik[i].fecha);
				if (condicion == 1) {
					//var stateBoulpik = await getBoulpikByFecha(objArray[k].Boulpik[i].fecha);
					//console.log("stateBoulpik : ", stateBoulpik);

					//if (stateBoulpik === "1") {
					_arrayFecha.push(objArray[k].Boulpik[i].fecha);

					_arrayBoulpik = await addBoulpikByFecha(objArray[k].Boulpik[i].fecha, idUser, objArray[k].Boulpik);

					// objBoulpik = Object.assign(
					// 	{},
					// 	{
					// 		arrayBoulpik: _arrayBoulpik
					// 	}
					// );

					//arrayBoulpik.push(objBoulpik);

					//objBoulpik = {};
					//}
				}
			}
		}
	}
	return _arrayBoulpik;
}

async function lastFiveBoulpikTirage(idUser) {
	var _data = [];
	var dataObject = await BoulpikNumbers.find({ etat: 0 });
	var size = dataObject.length - 1;
	for (let k = 0; k < 5; k++) {
		_data[k] = dataObject[size];
		size = size - 1;
	}

	var end;
	var arrayWinner = [];
	var data = [];
	var userBoulpik = [];

	for (let i = 0; i < _data.length; i++) {
		var objUser = {};
		arrayWinner = _data[i].arrayWinner;
		end = _data[i].end;
		userBoulpik = await arrayUser(idUser, _data, i);
		//console.log("userBoulpik : ", userBoulpik);
		objUser = Object.assign({}, { end, arrayWinner, userBoulpik });
		data[i] = objUser;
	}

	const parsedArray = data.map(item => {
		const numbers = item.end.split("/");
		const year = parseInt(numbers[2]);
		const month = parseInt(numbers[1]);
		const day = parseInt(numbers[0]);
		const parsedDate = new Date(year, month - 1, day);

		return { ...item, parsedDate };
	});
	const sortedArray = lodash.sortBy(parsedArray, ["parsedDate"].reverse());

	return sortedArray;
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
			//arrayBoulpik.push(objFechaBoulpik[i].boulpik);
			var boulpik = objFechaBoulpik[i].boulpik;
			var contador = objFechaBoulpik[i].idUser.length;
			//var boulpikContador = Object.assign({}, boulpik, contador);
			arrayBoulpik.push({ boulpik, contador });
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
	//console.log("Fecha : ", fecha);
	var strcmp = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" }).compare;
	var count = 0;
	for (var i = 0; i < arrayList.length; i++) {
		//console.log("FechaArraylis------------- : ", arrayList[i].fecha);
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
async function getBoulpikByFecha(strfecha) {
	var _BoulpikNumbers = await BoulpikNumbers.find({ end: strfecha });
	//console.log("_BoulpikNumbers : ", _BoulpikNumbers[0]);

	if (_BoulpikNumbers[0]) {
		return _BoulpikNumbers[0].etat;
	} else {
		return 0;
	}
}
/**  here now */
async function searchBoulpikUsers(idUser) {
	var strcmp = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" }).compare;
	var arrayBoulpik = [];
	var objBoulpik = {};
	var objArray = await BoulpikNumbers.find({ etat: "1" });

	var _arrayBoulpik = [];
	var _arrayFecha = [];

	for (let k = 0; k < objArray.length; k++) {
		for (let i = 0; i < objArray[k].Boulpik.length; i++) {
			for (let j = 0; j < objArray[k].Boulpik[i].idUser.length; j++) {
				if (strcmp(idUser, objArray[k].Boulpik[i].idUser[j]) == 0) {
					let condicion = await checkNumberInArray(_arrayFecha, objArray[k].Boulpik[i].fecha);
					if (condicion == 1) {
						//var stateBoulpik = await getBoulpikByFecha(objArray[k].Boulpik[i].fecha);
						//console.log("stateBoulpik : ", stateBoulpik);

						//if (stateBoulpik === "1") {
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
						//}
					}
				}
			}
		}
	}

	const parsedArray = arrayBoulpik.map(item => {
		const numbers = item.fecha.split("/");
		const year = parseInt(numbers[2]);
		const month = parseInt(numbers[1]);
		const day = parseInt(numbers[0]);
		const parsedDate = new Date(year, month - 1, day);

		return { ...item, parsedDate };
	});
	const sortedArray = lodash.sortBy(parsedArray, ["parsedDate"].reverse());

	return sortedArray;
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
	var objArray;

	return (objArray = await Transaction.find({ $or: [{ idreceveur: idUser }, { idenvoyeur: idUser }] })
		.sort([["created", -1]])
		.exec()
		.then(objArray => {
			return objArray;
		}));
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

async function verifyemail(email) {
	var data = await User.findOne({ email: email });

	console.log("data: ", data);
	return data;
}

async function read_a_message(userId, messageId) {
	var dataUser = await User.findById(userId);

	for (i = 0; i < dataUser.message.length; i++) {
		if (dataUser.message[i]._id == messageId) {
			return dataUser.message[i];
		}
	}
}

async function _sendMail(email, code) {
	const nodeMailer = require("nodemailer");
	var success;

	var transporter = nodeMailer.createTransport({
		service: "Gmail",
		auth: {
			user: config.user,
			pass: config.pass
		}
	});
	var mailOptions = {
		from: config.user,
		to: email,
		subject: "Code Reset Password",
		text: code
	};
	await transporter.sendMail(mailOptions, async function(error, info) {
		if (error) {
			return { data: "", success: false, message: error.message };
		} else {
			console.log("info : ", info);
			return { data: info, success: true, message: "message sent" };
		}
	});
	return (success = "Email Sent");

	//console.log("result : ", result);
}

async function sendToCodeToEmail(idUser, token, codeSend) {
	return User.findOneAndUpdate(
		{ _id: idUser },
		{ $set: { resetPasswordToken: token, codeSend: codeSend } },
		{ new: true },
		function(err, user) {
			if (err) {
				return { data: {}, success: false, message: err };
			} else {
				return { data: user, success: true, message: "" };
			}
		}
	);
}

async function setPasswordUser(idUser, newMotDePasse) {
	return User.findOneAndUpdate({ _id: idUser }, { $set: { motDePasse: newMotDePasse } }, { new: true }, function(
		err,
		user
	) {
		if (err) {
			return { data: {}, success: false, message: "0211" };
		} else {
			return { data: user, success: true, message: "0501" };
		}
	});
}
