const expressJwt = require("express-jwt");
const { secret } = require("../../../config");
const jwt = require("jsonwebtoken");
var mongoose = require("mongoose"),
	User = mongoose.model("Userslottos"),
	AccountNumbers = mongoose.model("AccountNumbers");

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
	GenerateNumber
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

async function getOldArrayNumber() {
	return AccountNumbers.find({}, function(err, objArray) {
		if (err) {
			return err;
		} else {
			return objArray;
		}
	});
}

async function setNumberInListNumber(number) {
	const _arrayNumber = await getOldArrayNumber();

	var _OldarrayList = _arrayNumber[0].Account;
	var idAccount = _arrayNumber[0]._id;

	_OldarrayList.push(number);

	await AccountNumbers.findOneAndUpdate({ _id: idAccount }, { $set: { Account: _OldarrayList } }, { new: true }).then(
		resultSet => {
			return resultSet;
		}
	);
	// async function(err, Account) {
	// 	if (err) {
	// 		return err;
	// 	} else {
	// 		return Account;
	// 	}
	// }
	//);
	// console.log("value : ", value);
	// return value;
}

async function checkNumberInArray(arrayList, number) {
	var condicion = 1;
	for (var i = 0; i < arrayList.length; i++) {
		var value = number.localeCompare(arrayList[i]);

		if (value === 0) {
			condicion = 0;
		}
	}
	return condicion;
}
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}
async function GenerateNumber() {
	var cantidad = 8;
	var arr = "";
	var OldarrayList = await getOldArrayNumber(); //["6", "5", "0", "4", "3"];

	var limit = 1;

	do {
		arr = "";
		for (var i = 0; i < cantidad; i++) {
			arr = arr + "" + getRandomInt(0, 10);
		}

		var condicionCheckOldArray = await checkNumberInArray(OldarrayList, arr);

		if (condicionCheckOldArray == 1) {
			limit = limit - 1;
			await setNumberInListNumber(arr);
			return { data: arr, success: true, message: "" };
		}
	} while (limit != 0);

	//console.log(aleatoriosNoRepetidos(7) + "");
}
