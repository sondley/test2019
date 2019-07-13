const expressJwt = require("express-jwt");
const { secret } = require("../../../config");
const jwt = require("jsonwebtoken");
var mongoose = require("mongoose"),
	User = mongoose.model("Userslottos"),
	BoulpikNumbers = mongoose.model("BoulpikNumbers"),
	UsersClients = mongoose.model("UsersClients");
const ServicesValidate = require("../validate/number");

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
	GenerateNumber,
	updateBoulpikCart
};

async function getOldArrayNumber(_start) {
	return BoulpikNumbers.find({ start: _start }, function(err, objArray) {
		if (err) {
			return err;
		} else {
			return objArray;
		}
	});
}

async function setNumberInListNumber(obj, _start) {
	const _arrayNumber = await getOldArrayNumber(_start);

	var _OldarrayList = _arrayNumber[0].Boulpik;
	var idTirage = _arrayNumber[0]._id;

	_OldarrayList.push(obj);

	await BoulpikNumbers.findOneAndUpdate({ _id: idTirage }, { $set: { Boulpik: _OldarrayList } }, { new: true }).then(
		resultSet => {
			return resultSet;
		}
	);
}

async function checkNumberInArray(_arrayList, number) {
	var arrayList = _arrayList[0].Boulpik;
	var condicion = 1;

	for (var i = 0; i < arrayList.length; i++) {
		var value = number.localeCompare(arrayList[i].boulpik);

		if (value === 0) {
			condicion = 0;
		}
	}

	return condicion;
}
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}
async function getAndUpdateBoulpikById(idBoulpik, Boulpik) {
	return BoulpikNumbers.findOneAndUpdate({ _id: idBoulpik }, { $set: { Boulpik: Boulpik } }, { new: true }, function(
		err,
		user
	) {
		if (err) {
			return { data: {}, success: false, message: err };
		} else {
			return { data: user, success: true, message: "" };
		}
	});
}

async function updateBoulpikCart(idUser, carrito) {
	return UsersClients.findOneAndUpdate(
		{ idUsersLottos: idUser },
		{ $set: { carrito: carrito } },
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

async function addUserToListUserId(idUser, Boulpik, number, idBoulpik) {
	var listUser = [];
	var boulpik = "";
	objBoulpik = Boulpik;

	for (let i = 0; i < objBoulpik.length; i++) {
		if (number == objBoulpik[i].boulpik) {
			listUser = objBoulpik[i].idUser;
			boulpik = number;
			listUser.push(idUser);
			var new_obj = { idUser: listUser, boulpik: boulpik };
			objBoulpik[i] = new_obj;
		}
	}
	var setObject = objBoulpik;
	var objBoulpik = await getAndUpdateBoulpikById(idBoulpik, setObject);
}
async function GenerateNumber(obj) {
	var number = obj.boulpik;

	let message = "";

	var cantidad = 8;
	var arr = number;
	var OldarrayList = await getOldArrayNumber("6/7/2019"); //["6", "5", "0", "4", "3"];

	var condicionCheckOldArray = await ServicesValidate.countRepetition(number, OldarrayList[0].Boulpik);

	if (condicionCheckOldArray.countRepeat < 3) {
		if (condicionCheckOldArray.countRepeat == 0) {
			await setNumberInListNumber(obj, "6/7/2019");
		} else {
			await addUserToListUserId(obj.idUser, OldarrayList[0].Boulpik, number, OldarrayList[0]._id);
		}
		return { data: arr, success: true, message: "" };
	} else {
		return { data: "", success: false, message: "can not use this number" };
	}
}
