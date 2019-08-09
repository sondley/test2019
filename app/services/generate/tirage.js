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
var lodash = require("lodash");
//const bcrypt = require("bcrypt");
var crypto = require("crypto");

var moment = require("moment");
module.exports = {
	generateAutoTirage,
	fechaTirageActual
};

async function generateAutoTirage(fechaTirage) {
	const _ObjBoulpik = await totalBoulpik(fechaTirage);

	/**Error to set , Tirage by date not found */

	const _totalBoulpik = _ObjBoulpik[0].Boulpik;

	var OldarrayList = [];
	var limit = 5;
	do {
		var item = _totalBoulpik[Math.floor(Math.random() * _totalBoulpik.length)];

		var condicionCheckOldArray = await checkNumberInArray(OldarrayList, item.boulpik);

		if (condicionCheckOldArray == 1) {
			limit = limit - 1;
			OldarrayList.push(item);
		}
	} while (limit != 0);

	const _primeWinners = await PrimesBoulpikWins(fechaTirage);
	const _setWinners = await setWinners(OldarrayList, _primeWinners);

	await ServicesSearch.setArrayWinners(_setWinners, fechaTirage);
}

async function fechaTirageActual() {
	var TirageActual = await BoulpikNumbers.find({ etat: 1 }); //.sort([["created", 1]]);
	//console.log("TirageActual : ", TirageActual);
	var end;
	var data = [];
	for (let i = 0; i < TirageActual.length; i++) {
		var objUser = {};

		end = TirageActual[i].end;
		objUser = Object.assign({}, { end });
		data[i] = objUser;
	}
	//console.log("data : ", data);
	const parsedArray = data.map(item => {
		const numbers = item.end.split("/");
		const year = parseInt(numbers[2]);
		const month = parseInt(numbers[1]);
		const day = parseInt(numbers[0]);
		const parsedDate = new Date(year, month - 1, day);

		return { ...item, parsedDate };
	});
	const sortedArray = lodash.sortBy(parsedArray, ["parsedDate"].reverse());

	//console.log("TirageActual : ", TirageActual);
	//console.log("TirageActual : ", TirageActual);
	var fecha = sortedArray[0].end;
	return fecha;
}
