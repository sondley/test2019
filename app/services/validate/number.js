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
	countRepetition,
	countRepetition2,
	countRepetition3
};

async function checkNumberInArray(arrayList, number) {
	var strcmp = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" }).compare;
	var condicion = 1;
	var countRepeat = 0;
	for (var i = 0; i < arrayList.length; i++) {
		//var value = number.localeCompare(arrayList[i].boulpik);
		var value = strcmp(number, arrayList[i].boulpik);

		if (value === 0) {
			countRepeat = countRepeat + 1;
			if (countRepeat > 3) {
				condicion = 0;
			}
		}
	}
	return { condicion, countRepeat };
}

async function checkNumberInArrayAndDate(arrayList, number, fecha) {
	var strcmp = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" }).compare;

	var condicion = 1;
	var countRepeat = 0;
	for (var i = 0; i < arrayList.length; i++) {
		var value = strcmp(number, arrayList[i].boulpik);
		var _fecha = strcmp(fecha, arrayList[i].fecha);
		//var value = number.localeCompare(arrayList[i].boulpik);
		//var _fecha = fecha.localeCompare(arrayList[i].fecha);

		if (value === 0 && _fecha === 0) {
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
}

async function countRepetition2(number, fecha, OldarrayList) {
	var arr = number;

	var _condicionCheckOldArray = await checkNumberInArrayAndDate(OldarrayList, arr, fecha);

	return _condicionCheckOldArray;
}

async function countRepetition3(number, fecha, OldarrayList) {
	var arr = number;

	var _condicionCheckOldArray = await checkNumberInArrayAndDate(OldarrayList, arr, fecha);

	return _condicionCheckOldArray;
}
