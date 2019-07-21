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
	return BoulpikNumbers.find({ end: _start }, function(err, objArray) {
		if (err) {
			return err;
		} else {
			return objArray;
		}
	});
}

async function setNumberInListNumber(obj, _start) {
	console.log("_start : ", _start);
	const _arrayNumber = await getOldArrayNumber(_start);

	var _OldarrayList = _arrayNumber[0].Boulpik;
	console.log("_OldarrayList : ", _OldarrayList);
	var idTirage = _arrayNumber[0]._id;

	console.log("obj : ", obj);
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

async function addUserToListUserId(idUser, Boulpik, price, fecha, number, idBoulpik) {
	console.log("heloo");
	var listUser = [];
	var boulpik = "";
	objBoulpik = Boulpik;

	for (let i = 0; i < objBoulpik.length; i++) {
		if (number == objBoulpik[i].boulpik) {
			listUser = objBoulpik[i].idUser;
			boulpik = number;
			listUser.push(idUser);
			var new_obj = { idUser: listUser, boulpik: boulpik, price: price, fecha: fecha };
			console.log("new_obj : ", new_obj);
			objBoulpik[i] = new_obj;
		}
	}
	var setObject = objBoulpik;
	console.log("setObject : ", setObject);
	var objBoulpik = await getAndUpdateBoulpikById(idBoulpik, setObject);
}
async function GenerateNumber(obj) {
	var number = obj.boulpik;
	var fecha = obj.fecha;
	var price = obj.price;

	let message = "";

	var cantidad = 8;
	var arr = number;
	var OldarrayList = await getOldArrayNumber(fecha); //["6", "5", "0", "4", "3"];

	var condicionCheckOldArray = await ServicesValidate.countRepetition(number, OldarrayList[0].Boulpik);

	if (condicionCheckOldArray.countRepeat < 3) {
		if (condicionCheckOldArray.countRepeat == 0) {
			await setNumberInListNumber(obj, fecha);
		} else {
			await addUserToListUserId(obj.idUser, OldarrayList[0].Boulpik, price, fecha, number, OldarrayList[0]._id);
		}
		return { data: obj, success: true, message: "" };
	} else {
		return { data: "", success: false, message: "can not use this number" };
	}
}
