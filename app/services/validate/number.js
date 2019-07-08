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
	countRepetition
};

async function checkNumberInArray(arrayList, number) {
	var condicion = 1;
	var countRepeat = 0;
	for (var i = 0; i < arrayList.length; i++) {
		var value = number.localeCompare(arrayList[i].boulpik);

		if (value === 0) {
			countRepeat = countRepeat + 1;
			if (countRepeat > 3) {
				condicion = 0;
			}
		}
	}
	return { condicion, countRepeat };
}
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}
async function countRepetition(number, OldarrayList) {
	var arr = number;

	var _condicionCheckOldArray = await checkNumberInArray(OldarrayList, arr);

	return _condicionCheckOldArray;

	// if (condicionCheckOldArray == 1) {
	// 	//limit = limit - 1;
	// 	await setNumberInListNumber(arr);
	// 	return { data: arr, success: true, message: "" };
	// } else {
	// 	return { data: "", success: false, message: "can not use this number" };
	// }

	//} while (limit != 0);

	//console.log(aleatoriosNoRepetidos(7) + "");
}
