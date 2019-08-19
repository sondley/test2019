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
	PrimesBoulpiks = mongoose.model("PrimesBoulpiks"),
	BoulpikNumbers = mongoose.model("BoulpikNumbers");
const ServicesSearch = require("../search/search");

var lodash = require("lodash");
//const bcrypt = require("bcrypt");
var crypto = require("crypto");

var moment = require("moment");
module.exports = {
	generateAutoTirage,
	fechaTirageActual,
	payClient
};
async function totalBoulpik(strFecha) {
	let message = "";
	return BoulpikNumbers.find({ end: strFecha }, function(err, user) {
		if (err) {
			return { data: {}, success: false, message: err };
		} else {
			const _Boulpik = user[0].Boulpik;
			//console.log("Users : ", _Boulpik.length);
			return { data: _Boulpik.length, success: true, message: "0501" };
		}
	});
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

async function PrimesBoulpikWins(strFecha) {
	const _ObjBoulpik = await totalBoulpik(strFecha);
	const _totalBoulpik = _ObjBoulpik[0].Boulpik;
	const lengthBoulpik = _totalBoulpik.length;
	//console.log("lengthBoulpik : ", lengthBoulpik);
	const PriceBoulPik = 25;
	var totalRecharge = lengthBoulpik * PriceBoulPik;
	const ObjPrime = await findPrimeBoulPik();
	const one = totalRecharge * ObjPrime[0].one;
	const two = totalRecharge * ObjPrime[0].two;
	const three = totalRecharge * ObjPrime[0].three;
	const four = totalRecharge * ObjPrime[0].four;
	const five = totalRecharge * ObjPrime[0].five;

	const TotalEffectif = totalRecharge;

	const total = one + two + three + four + five;
	//console.log("Prime : ", ObjPrime);
	return {
		data: {
			arrayPosicion: [
				{ place: "One", total: one / 100 },
				{ place: "Two", total: two / 100 },
				{ place: "Three", total: three / 100 },
				{ place: "Four", total: four / 100 },
				{ place: "Five", total: five / 100 }
			],
			TotalDistribue: total / 100,
			TotalRecharge: totalRecharge
		}
	};
}

async function setWinners(dataWinners, PrimesWinners) {
	var arrayWinners = [];
	var winners = [];
	for (let i = 0; i < dataWinners.length; i++) {
		var boulpik = dataWinners[i].boulpik;
		var place = PrimesWinners.data.arrayPosicion[i].place;
		var montant = PrimesWinners.data.arrayPosicion[i].total;
		winners = [];

		for (let j = 0; j < dataWinners[i].idUser.length; j++) {
			var idUsers = dataWinners[i].idUser[j];
			var _nom = await ServicesSearch.searchUsersByID(dataWinners[i].idUser[j]);
			var nom = _nom[0].nom;
			var countWinners = dataWinners[i].idUser.length;
			winners.push({ idUsers: idUsers, nom: nom });
		}

		arrayWinners.push({
			winners: winners,
			boulpik: boulpik,
			place: place,
			montant: montant,
			countWinners: countWinners
		});
	}

	return arrayWinners;
}

async function findPrimeBoulPik() {
	let message = "";
	return PrimesBoulpiks.find({}, async function(err, user) {
		if (err) {
			return { data: {}, success: false, message: err };
		} else {
			return { data: user, success: true, message: "0501" };
		}
	});
}

async function payClient(strFecha) {
	const genre = "Winnings";
	var recfonction = "Client";
	var winners = await BoulpikNumbers.find({ end: strFecha });
	console.log("HI");

	const arrayWinner = winners[0].arrayWinner;

	for (let i = 0; i < arrayWinner.length; i++) {
		var lengthWinner = arrayWinner[i].winners.length;

		for (let j = 0; j < lengthWinner; j++) {
			var idWinner = arrayWinner[i].winners[j].idUsers;
			var receveur = arrayWinner[i].winners[j].nom;
			var balance = (await arrayWinner[i].montant) / arrayWinner[i].countWinners;
			await ServicesSearch.upBalanceById(idWinner, balance);
			var objTransaction = Object.assign({}, { genre, receveur, recfonction, idreceveur: idWinner, balance });
			await ServicesSearch.createTransaction(objTransaction);
		}
	}
}

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
	await payClient(fechaTirage);
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
