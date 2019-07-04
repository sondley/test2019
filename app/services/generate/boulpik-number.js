const expressJwt = require("express-jwt");
const { secret } = require("../../../config");
const jwt = require("jsonwebtoken");
var mongoose = require("mongoose"),
	User = mongoose.model("Userslottos"),
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
	GenerateNumber
};

async function getOldArrayNumber() {
	return BoulpikNumbers.find({}, function(err, objArray) {
		if (err) {
			return err;
		} else {
			return objArray;
		}
	});
}

async function setNumberInListNumber(number) {
	const _arrayNumber = await getOldArrayNumber();
	console.log("array : ", _arrayNumber);

	var _OldarrayList = _arrayNumber[0].Boulpik;
	var idAccount = _arrayNumber[0]._id;

	_OldarrayList.push(number);

	await BoulpikNumbers.findOneAndUpdate({ _id: idAccount }, { $set: { Boulpik: _OldarrayList } }, { new: true }).then(
		resultSet => {
			return resultSet;
		}
	);
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
async function GenerateNumber(number) {

  //miss condition of Number
	let message = "";

	var cantidad = 8;
	var arr = number;
	var OldarrayList = await getOldArrayNumber(); //["6", "5", "0", "4", "3"];

	//var limit = 1;

	//do {
	// arr = "";
	// for (var i = 0; i < cantidad; i++) {
	// 	arr = arr + "" + getRandomInt(0, 10);
	// }

	var condicionCheckOldArray = await checkNumberInArray(OldarrayList, arr);

	if (condicionCheckOldArray == 1) {
		//limit = limit - 1;
		await setNumberInListNumber(arr);
		return { data: arr, success: true, message: "" };
	} else {
		return { data: "", success: false, message: "can not use this number" };
	}

	//} while (limit != 0);

	//console.log(aleatoriosNoRepetidos(7) + "");
}
