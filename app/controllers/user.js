"use strict";
const config = require("../../config");
const jwt = require("jsonwebtoken");
var async = require("async");
var mongoose = require("mongoose"),
	User = mongoose.model("Userslottos"),
	UserNormal = mongoose.model("UsersClients"),
	UserAmin = mongoose.model("UsersAdmins"),
	UserSuper = mongoose.model("UsersSupers"),
	UsersAuths = mongoose.model("UsersAuths"),
	UsersDetaillants = mongoose.model("UsersDetaillants"),
	AccountNumbers = mongoose.model("AccountNumbers"),
	BoulpikNumbers = mongoose.model("BoulpikNumbers"),
	PrimesBoulpiks = mongoose.model("PrimesBoulpiks"),
	City = mongoose.model("City"),
	InfoBoulpik = mongoose.model("InfoBoulpiks");
//const ServicesCredit = require("../services/credits/credits");
const ServicesAuth = require("../services/auth/auth");
const ServicesGenerate = require("../services/generate/account-number");
const ServicesGenerateNumber = require("../services/generate/boulpik-number");
const ServicesCreatePrimeBoulpik = require("../services/createAndUpdate/prime-boulpik");
const ServicesSearch = require("../services/search/search");
const Servicesmessage = require("../services/generate/message");
const ServicesValidate = require("../services/validate/number");

const validateBoulpik = require("../services/validate/number");

exports.authenticate = async function(req, res, next) {
	var message = {};

	User.findOne(
		{ $or: [{ email: req.body.email }, { tel: req.body.email }] },
		// {
		// 	email: req.body.email
		// },
		function(err, user) {
			if (err) throw err;

			if (!user) {
				res.json({ success: false, message: "Authentication failed. User not found." });
			} else {
				// check if password matches
				if (user.etat == "0") {
					res.json({
						success: false,
						message: "Vous avez ete suspendu, Vous n'avez pas acces a rentrer dans le systeme."
					});
				} else if (user.motDePasse != req.body.motDePasse) {
					res.json({
						success: false,
						message: "Erreur avec le mot de passe. Veuillez Verifier votre Mot de Passe et essayer encore"
					});
				} else {
					/*if user role is  vendeur, and vendeur is not set in list caisse of day, put user in the list if the caisse state is open*/

					// if user is found and password is right
					// create a token

					//var token = jwt.sign(payload, app.get('superSecret'), {
					var token = jwt.sign({ sub: user._id, role: user.role }, config.secret, {
						expiresIn: 315360000 // expires in 10 years
					});

					res.json({
						data: {
							user,
							token
						},
						success: true,
						message: message
					});
				}
			}
		}
	);
};

exports.list_all_users = function(req, res) {
	let message = "";
	User.find({}, "-motDePasse", function(err, user) {
		if (err) {
			res.json({ data: {}, success: false, message: err });
		} else {
			res.json({ data: user, success: true, message: message });
		}
	});
};

exports.getVille = function(req, res) {
	let message = "";
	City.find({}, function(err, city) {
		if (err) {
			res.json({ data: {}, success: false, message: err });
		} else {
			res.json({ data: city, success: true, message: message });
		}
	});
};

exports.list_all_number_boulpik = function(req, res) {
	let message = "";
	BoulpikNumbers.find({}, function(err, user) {
		if (err) {
			res.json({ data: {}, success: false, message: err });
		} else {
			res.json({ data: user, success: true, message: message });
		}
	});
};

exports.list_all_number_id = function(req, res) {
	let message = "";
	AccountNumbers.find({}, function(err, user) {
		if (err) {
			res.json({ data: {}, success: false, message: err });
		} else {
			res.json({ data: user, success: true, message: message });
		}
	});
};

async function createNormalUsers(strIdUsersLottos, nom, ville, accountId) {
	var objUsers = Object.assign({}, { idUsersLottos: strIdUsersLottos, nom: nom, ville: ville, accountId: accountId });
	var new_user = new UserNormal(objUsers);
	return new_user.save(async function(err, user) {
		if (err) {
			return { success: false, data: "", message: err };
		} else {
			return user;
		}
	});
}

async function createAdmins(_token, strIdUsersLottos, nom, ville) {
	var value = await ServicesAuth.getUsersByToken(_token);

	var createur = value.nom;

	var objUsers = Object.assign({}, { idUsersLottos: strIdUsersLottos, createur: createur, nom: nom, ville: ville });
	var new_user = new UserAmin(objUsers);
	return new_user.save(async function(err, user) {
		if (err) {
			return { success: false, data: "", message: err };
		} else {
			return user;
		}
	});
}

async function createDetaillants(_token, strIdUsersLottos, nom, ville, numero_compte) {
	var value = await ServicesAuth.getUsersByToken(_token);

	var createur = value.nom;

	var objUsers = Object.assign(
		{},
		{ idUsersLottos: strIdUsersLottos, createur: createur, nom: nom, ville: ville, numero_compte: numero_compte }
	);
	var new_user = new UsersDetaillants(objUsers);
	return new_user.save(async function(err, user) {
		if (err) {
			return { success: false, data: "", message: err };
		} else {
			return user;
		}
	});
}

async function createDA(_token, strIdUsersLottos, nom, ville, adress, numero_matricule) {
	var value = await ServicesAuth.getUsersByToken(_token);

	var createur = value.nom;

	var objUsers = Object.assign(
		{},
		{
			idUsersLottos: strIdUsersLottos,
			nom: nom,
			adress: adress,
			ville: ville,
			createur: createur,
			numero_matricule: numero_matricule,
			nom_personne_reponsable: createur,
			id_personne_reponsable: value._id
		}
	);
	var new_user = new UsersAuths(objUsers);
	return new_user.save(async function(err, user) {
		if (err) {
			return { success: false, data: "", message: err };
		} else {
			return user;
		}
	});
}

async function createSuperUsers(strIdUsersLottos, nom, ville) {
	let message = "";
	var objUsers = Object.assign({}, { idUsersLottos: strIdUsersLottos, nom: nom, ville: ville });
	var new_user = new UserSuper(objUsers);
	return new_user.save(async function(err, user) {
		if (err) {
			return { success: false, data: "", message: err };
		} else {
			return user;
		}
	});
}

async function getAdminById(userId) {
	return UserAmin.find({ idUsersLottos: userId }, function(err, user) {
		if (err) {
			return err;
		} else {
			return user;
		}
	});
}

async function getSuperById(userId) {
	return UserSuper.find({ idUsersLottos: userId }, function(err, user) {
		if (err) {
			return err;
		} else {
			return user;
		}
	});
}
async function addAdminInListSuper(adminId, superId, nom) {
	let message = "";
	const _user = await getSuperById(superId);

	var _Admin = [];
	_Admin = _user[0].Admin;

	var objAdmin = Object.assign({}, { id: adminId, nom: nom });

	_Admin.push(objAdmin);

	return UserSuper.findOneAndUpdate({ idUsersLottos: superId }, { $set: { Admin: _Admin } }, { new: true }, function(
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

async function addDaInListAdmin(DaId, adminId, nom) {
	let message = "";
	const _user = await getAdminById(adminId);

	var _DA = [];
	_DA = _user[0].DA;
	console.log("_DA : ", _DA);
	var objDA = Object.assign({}, { id: DaId, nom: nom });

	_DA.push(objDA);

	return UserAmin.findOneAndUpdate({ idUsersLottos: adminId }, { $set: { DA: _DA } }, { new: true }, function(
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

async function addDetaillantInListAdmin(DetaillantId, adminId, nom) {
	const _user = await getAdminById(adminId);

	var _Detaillants = [];
	_Detaillants = _user[0].Detaillants;

	var objDetaillants = Object.assign({}, { id: DetaillantId, nom: nom });

	_Detaillants.push(objDetaillants);

	return UserAmin.findOneAndUpdate(
		{ idUsersLottos: adminId },
		{ $set: { Detaillants: _Detaillants } },
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

async function addDaInListSuper(DaId, superId, nom) {
	const _user = await getSuperById(superId);

	var _DA = [];
	_DA = _user[0].DA;

	var objDA = Object.assign({}, { id: DaId, nom: nom });

	_DA.push(objDA);

	return UserSuper.findOneAndUpdate({ idUsersLottos: superId }, { $set: { DA: _DA } }, { new: true }, function(
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

exports.create_super_users = async function(req, res) {
	let message = "";
	var objUsers = {};
	var new_user = new User(req.body);
	new_user.save(async function(err, user) {
		if (err) {
			res.json({ data: {}, success: false, message: err });
		} else {
			const dataInfo = await createSuperUsers(user._id, req.body.nom, req.body.ville);

			objUsers = Object.assign({}, { PersoInfo: user, dataInfo: dataInfo });
			res.json({ data: objUsers, success: true, message: message });
		}
	});
};

exports.GenerateNumber = async function(req, res) {
	var number = await ServicesGenerate.GenerateNumber();
	return res.json({ data: number });
	console.log("Number : ", number);
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
exports.GenerateNumberBoulpik = async function(req, res) {
	if (!req.headers.authorization) {
		let message = "TokenMissing";
		//return res.status(401).send({ error: 'TokenMissing' });
		return res.json({ data: {}, success: false, message: message });
	}
	var token = req.headers.authorization.split(" ")[1];
	var value = await ServicesAuth.getUsersByToken(token);
	var idUser = value._id;

	var obj = Object.assign({ boulpik: req.body.boulpik, fecha: req.body.fecha, price: req.body.price, idUser: idUser });

	var number = await ServicesGenerateNumber.GenerateNumber(obj);
	return res.json({ data: number.data, success: number.success, message: number.message });
};

exports.create_a_admin = async function(req, res) {
	if (!req.headers.authorization) {
		let message = "TokenMissing";
		//return res.status(401).send({ error: 'TokenMissing' });
		return res.json({ data: {}, success: false, message: message });
	}
	var token = req.headers.authorization.split(" ")[1];
	let message = "";
	var objUsers = {};
	var new_user = new User(req.body);
	new_user.save(async function(err, user) {
		if (err) {
			res.json({ data: {}, success: false, message: err });
		} else {
			const dataInfo = await createAdmins(token, user._id, req.body.nom, req.body.ville);
			var value = await ServicesAuth.getUsersByToken(token);
			console.log("value Id : ", value._id);
			const addToSuper = await addAdminInListSuper(user._id, value._id, value.nom);

			objUsers = Object.assign({}, { PersoInfo: user, dataInfo: dataInfo });
			res.json({ data: objUsers, success: true, message: message });
		}
	});
};
exports.create_a_DA = async function(req, res) {
	if (!req.headers.authorization) {
		let message = "TokenMissing";
		//return res.status(401).send({ error: 'TokenMissing' });
		return res.json({ data: {}, success: false, message: message });
	}
	var token = req.headers.authorization.split(" ")[1];
	let message = "";
	var objUsers = {};
	var new_user = new User(req.body);

	new_user.save(async function(err, user) {
		if (err) {
			res.json({ data: {}, success: false, message: err });
		} else {
			const dataInfo = await createDA(
				token,
				user._id,
				req.body.nom,
				req.body.ville,
				req.body.adress,
				req.body.numero_matricule
			);
			var value = await ServicesAuth.getUsersByToken(token);

			if (value.role == "Super") {
				const addToSuper = await addDaInListSuper(user._id, value._id, value.nom);
			} else if (value.role == "Admin") {
				const addToAdmin = await addDaInListAdmin(user._id, value._id, value.nom);
			}

			objUsers = Object.assign({}, { PersoInfo: user, dataInfo: dataInfo });
			res.json({ data: objUsers, success: true, message: message });
		}
	});
};

exports.create_a_Detaillant = async function(req, res) {
	if (!req.headers.authorization) {
		let message = "TokenMissing";
		//return res.status(401).send({ error: 'TokenMissing' });
		return res.json({ data: {}, success: false, message: message });
	}
	var token = req.headers.authorization.split(" ")[1];
	let message = "";
	var objUsers = {};
	var new_user = new User(req.body);
	var _numero_compte = await ServicesGenerate.GenerateNumber();
	var numero_compte = _numero_compte.data;

	new_user.save(async function(err, user) {
		if (err) {
			res.json({ data: {}, success: false, message: err });
		} else {
			const dataInfo = await createDetaillants(token, user._id, req.body.nom, req.body.ville, numero_compte);
			var value = await ServicesAuth.getUsersByToken(token);

			const addToAdmin = await addDetaillantInListAdmin(user._id, value._id, value.nom);

			objUsers = Object.assign({}, { PersoInfo: user, dataInfo: dataInfo });
			res.json({ data: objUsers, success: true, message: message });
		}
	});
};

exports.create_a_user = async function(req, res) {
	let message = "";
	var objUsers = {};
	var _accountId = await ServicesGenerate.GenerateNumber();
	var accountId = _accountId.data;
	var new_user = new User(req.body);
	new_user.save(async function(err, user) {
		if (err) {
			res.json({ data: {}, success: false, message: err });
		} else {
			var token = jwt.sign({ sub: user._id, role: "User" }, config.secret, {
				expiresIn: 1200 // expires in 20 minutes
			});
			const dataInfo = await createNormalUsers(user._id, req.body.nom, req.body.ville, accountId);
			const boulpik = await ServicesSearch.searchBoulpikUsers(user._id);

			//objUsers = Object.assign({}, { PersoInfo: user, dataInfo: dataInfo });

			res.json({
				data: {
					user,
					token,
					dataInfo,
					boulpik
				},
				success: true,
				message: message
			});
			//const dataInfo = await createNormalUsers(user._id, req.body.nom, req.body.ville, accountId);

			//objUsers = Object.assign({}, { PersoInfo: user, dataInfo: dataInfo });
			//	res.json({ data: user, success: true, message: message });
		}
	});
};

exports.createCity = async function(req, res) {
	let message = "";

	var new_city = new City(req.body);
	new_city.save(async function(err, city) {
		if (err) {
			res.json({ data: {}, success: false, message: err });
		} else {
			res.json({ data: city, success: true, message: message });
		}
	});
};

exports.read_a_user = async function(req, res) {
	let message = "";
	var _dataInfo = {};
	User.findById(req.params.userId, async function(err, user) {
		if (err) {
			res.json({ data: {}, success: false, message: err });
		} else {
			//console.log("user : ", user);
			if (user.role == "Super") {
				_dataInfo = await ServicesSearch.searchUsersSuper(user._id);
			} else if (user.role == "Admin") {
				_dataInfo = await ServicesSearch.searchUsersAdmin(user._id);
			} else if (user.role == "User") {
				_dataInfo = await ServicesSearch.searchUsersClient(user._id);
			} else if (user.role == "Detaillants") {
				_dataInfo = await ServicesSearch.searchUsersDA(user._id);
			} else if (user.role == "Distributeurs") {
				_dataInfo = await ServicesSearch.searchUsersDetaillants(user._id);
			}
			const boulpik = await ServicesSearch.searchBoulpikUsers(user._id);
			//console.log("boulpik : ", boulpik);
			res.json({ data: { user, _dataInfo, boulpik }, success: true, message: message });
		}
	});
};
exports.refreshToken = function(req, res) {
	var strToken = req.headers.authorization.split(" ")[1];
	//console.log(strToken);
	//var strToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1YzZmMGZkNzljY2U0NjAwMTc2ZmI1ZDQiLCJyb2xlIjoiZGlyZWN0b3IiLCJpYXQiOjE1NTEyMDU3NTIsImV4cCI6MTU1MTI5MjE1Mn0.XT5Id0FwlfS26k_R7rsLN-GHH_sX8gvwr6qKOkaCnPw";
	var message = {};
	var infoToken = jwt.decode(strToken);
	if (infoToken) {
		message = "successfull Token";
		var token = jwt.sign({ sub: infoToken.sub, role: infoToken.role }, config.secret, {
			expiresIn: 1200 // expires in 20 minutes
		});

		res.json({
			data: {
				token
			},
			success: true,
			message: message
		});
	} else {
		message = "Invalid Token";
		res.json({ data: {}, success: false, message: message });
	}

	console.log(infoToken);
};

exports.update_a_user = function(req, res) {
	let message = "";
	User.findOneAndUpdate({ _id: req.params.userId }, req.body, { new: true }, function(err, user) {
		if (err) {
			res.json({ data: {}, success: false, message: err });
		} else {
			res.json({ data: user, success: true, message: message });
		}
	});
};

exports.modifyUser = function(req, res) {
	let message = "";
	var updateObject = req.body;
	User.findOneAndUpdate({ _id: req.params.userId }, { $set: updateObject }, { new: true }, function(err, user) {
		if (err) {
			res.json({ data: {}, success: false, message: err });
		} else {
			res.json({ data: user, success: true, message: message });
		}
	});
};

exports.delete_a_user = function(req, res) {
	let message = "";

	User.remove(
		{
			_id: req.params.userId
		},
		function(err, user) {
			if (err) {
				res.json({ data: {}, success: false, message: err });
			} else {
				res.json({ data: user, success: true, message: message });
			}
		}
	);
};

function insertarEn(array, valor, posición) {
	var inicio = array.slice(0, posición);
	var medio = valor;
	var fin = array.slice(posición);
	var resultado = inicio.concat(medio).concat(fin);
	return resultado;
}
function aleatoriosNoRepetidos(cantidad) {
	var array = [];
	for (var i = 0; i < cantidad; i++) {
		array = insertarEn(array, i, Math.random() * (cantidad + 1));
	}
	return array;
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

/*async function verificateNumber() {
	var a = [1, 2, 3],
		b = [4, 1, 5, 2];

	b.forEach(function(value) {
		if (a.indexOf(value) == -1) a.push(value);
	});

	console.log(a);
	// [1, 2, 3, 4, 5]
}*/

async function isInArray(value, array) {
	return array.indexOf(value) > -1;
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

async function concateArrayList(arrayList1, arrayList2) {
	arrayList1.concat(arrayList2);
	return arrayList1;
}

async function getListSelled(date) {
	return InfoBoulpik.findOne({ tirage: date });
}

exports.createPrimeBoulpik = async function(req, res) {
	let message = "";
	var updateObject = req.body;
	var response = await ServicesCreatePrimeBoulpik.createPrimeBoulpik(updateObject);
	res.json({ data: response });
};

async function findPrimeBoulPik(arrayList1, arrayList2) {
	let message = "";
	return PrimesBoulpiks.find({}, async function(err, user) {
		if (err) {
			return { data: {}, success: false, message: err };
		} else {
			return { data: user, success: true, message: message };
		}
	});
}
async function totalBoulpik() {
	let message = "";
	return BoulpikNumbers.find({}, function(err, user) {
		if (err) {
			return { data: {}, success: false, message: err };
		} else {
			const _Boulpik = user[0].Boulpik;
			//console.log("Users : ", _Boulpik.length);
			return { data: _Boulpik.length, success: true, message: "" };
		}
	});
}

async function PrimesBoulpikWins() {
	const _ObjBoulpik = await totalBoulpik();
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
exports.ListPrimeBoulpik = async function(req, res) {
	const _ObjBoulpik = await totalBoulpik();
	const _totalBoulpik = _ObjBoulpik[0].Boulpik;
	const lengthBoulpik = _totalBoulpik.length;

	const PriceBoulPik = 25;
	var totalRecharge = lengthBoulpik * PriceBoulPik;
	const ObjPrime = await findPrimeBoulPik();
	const one = totalRecharge * ObjPrime[0].one;
	const two = totalRecharge * ObjPrime[0].two;
	const three = totalRecharge * ObjPrime[0].three;
	const four = totalRecharge * ObjPrime[0].four;
	const five = totalRecharge * ObjPrime[0].five;

	const TotalRecharge = totalRecharge;

	const totalShare = (one + two + three + four + five) / 100;

	res.json({
		data: {
			arrayPosicion: [
				{ place: "One", prize: one / 100 },
				{ place: "Two", prize: two / 100 },
				{ place: "Three", prize: three / 100 },
				{ place: "Four", prize: four / 100 },
				{ place: "Five", prize: five / 100 }
			],
			TotalRecharge,
			totalShare
		}
	});
};

async function checkNumberInArray(arrayList, number) {
	var condicion = 1;
	for (var i = 0; i < arrayList.length; i++) {
		var value = number.localeCompare(arrayList[i].boulpik);

		if (value === 0) {
			condicion = 0;
		}
	}
	return condicion;
}

async function checkNumberInNumber(arrayList, number) {
	var condicion = 1;
	for (var i = 0; i < arrayList.length; i++) {
		var value = number.localeCompare(arrayList[i]);

		if (value === 0) {
			condicion = 0;
		}
	}
	return condicion;
}

async function checkNumberInNumberCarrito(arrayList, number) {
	var condicion = 1;
	for (var i = 0; i < arrayList.length; i++) {
		var value = number.localeCompare(arrayList[i].boulpik);

		if (value === 0) {
			condicion = 0;
		}
	}
	return condicion;
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
			winners.push({ idUsers: idUsers, nom: nom });
		}

		arrayWinners.push({ winners: winners, boulpik: boulpik, place: place, montant: montant });
	}

	return arrayWinners;
}

exports.DynamicTirage = async function(req, res) {
	const _ObjBoulpik = await totalBoulpik();

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

	const _primeWinners = await PrimesBoulpikWins();
	const _setWinners = await setWinners(OldarrayList, _primeWinners);

	res.json({ data: _setWinners });
};
exports.addBoulpikCarrito = async function(req, res) {
	let message = {};
	if (!req.headers.authorization) {
		let message = "TokenMissing";

		return res.json({ data: {}, success: false, message: message });
	}
	var _dataInfo = {};
	var token = req.headers.authorization.split(" ")[1];
	var value = await ServicesAuth.getUsersByToken(token);
	var idUser = value._id;
	var user = await ServicesSearch.searchUsersByID(idUser);

	if (user[0].role == "Super") {
		_dataInfo = await ServicesSearch.searchUsersSuper(user[0]._id);
	} else if (user[0].role == "Admin") {
		_dataInfo = await ServicesSearch.searchUsersAdmin(user[0]._id);
	} else if (user[0].role == "User") {
		_dataInfo = await ServicesSearch.searchUsersClient(user[0]._id);
	} else if (user[0].role == "Detaillants") {
		_dataInfo = await ServicesSearch.searchUsersDA(user[0]._id);
	} else if (user[0].role == "Distributeurs") {
		_dataInfo = await ServicesSearch.searchUsersDetaillants(user[0]._id);
	}
	var carrito = _dataInfo[0].carrito;
	let condicion = await checkNumberInNumberCarrito(carrito, req.body.boulpik);

	var OldarrayList = await getOldArrayNumber(req.body.fecha); //["6", "5", "0", "4", "3"];

	var condicionCheckOldArray = await ServicesValidate.countRepetition(req.body.boulpik, OldarrayList[0].Boulpik);

	if (condicionCheckOldArray.countRepeat == 0) {
		//let played = await checkNumberPlayed(Boulpik, req.body.boulpik);
		var objCarrito = {};
		if (condicion == 1) {
			objCarrito = Object.assign({}, { boulpik: req.body.boulpik, fecha: req.body.fecha, price: req.body.price });
			carrito.push(objCarrito);
			objCarrito = {};
			var _addBoulpikCart = await ServicesGenerateNumber.updateBoulpikCart(idUser, carrito);
			return res.json({ data: carrito, success: true, message: message });
		} else {
			return res.json({ data: "", success: false, message: "Number existe in liste" });
		}
	} else {
		return res.json({ data: "", success: false, message: "you have played this number yet" });
	}

	//console.log("carrito : ", carrito);

	//console.log("_dataInfo : ", _dataInfo);
};

exports.deleteBoulpikCarrito = async function(req, res) {
	let message = {};
	if (!req.headers.authorization) {
		let message = "TokenMissing";

		return res.json({ data: {}, success: false, message: message });
	}
	var _dataInfo = {};
	var token = req.headers.authorization.split(" ")[1];
	var value = await ServicesAuth.getUsersByToken(token);
	var idUser = value._id;
	var user = await ServicesSearch.searchUsersByID(idUser);

	if (user[0].role == "Super") {
		_dataInfo = await ServicesSearch.searchUsersSuper(user[0]._id);
	} else if (user[0].role == "Admin") {
		_dataInfo = await ServicesSearch.searchUsersAdmin(user[0]._id);
	} else if (user[0].role == "User") {
		_dataInfo = await ServicesSearch.searchUsersClient(user[0]._id);
	} else if (user[0].role == "Detaillants") {
		_dataInfo = await ServicesSearch.searchUsersDA(user[0]._id);
	} else if (user[0].role == "Distributeurs") {
		_dataInfo = await ServicesSearch.searchUsersDetaillants(user[0]._id);
	}
	var carrito = _dataInfo[0].carrito;
	//console.log("carrito : ", carrito);
	//console.log("req.body.boulpik : ", req.body.boulpik);
	let condicion = await checkNumberInNumber(carrito, req.body.boulpik);
	//console.log("condicion : ", condicion);

	if (condicion == 0) {
		for (var i = 0; i < carrito.length; i++) {
			if (carrito[i].boulpik === req.body.boulpik) carrito.splice(i, 1);
		}

		var _deleteBoulpikCart = await ServicesGenerateNumber.updateBoulpikCart(idUser, carrito);
		return res.json({ data: carrito, success: true, message: message });
	} else {
		return res.json({ data: {}, success: false, message: "Number don t existe in liste" });
	}

	//console.log("carrito : ", carrito);

	//console.log("_dataInfo : ", _dataInfo);
};

exports.BalanceUsers = async function(req, res) {
	let message = "";
	var _dataInfo = {};
	User.findById(req.params.userId, async function(err, user) {
		if (err) {
			res.json({ data: {}, success: false, message: err });
		} else {
			res.json({ data: user.credit, success: true, message: "" });
		}
	});
};

exports.priceBoulpiks = async function(req, res) {
	let message = "";

	const _ObjBoulpik = await totalBoulpik();
	const _priceBoulpik = _ObjBoulpik[0].price;
	res.json({ data: _priceBoulpik, success: true, message: "" });
};

exports.sendMail = async function(req, res) {
	var result = await Servicesmessage.sendEmail(req.body.email);
	return res.json({ data: result, success: true, message: "" });
	//console.log("result : ", result);
};

exports.sendSMS = async function(req, res) {
	var result = await Servicesmessage.sendSMS(req.body.phone);
	//console.log("result : ", result);
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

exports.GenerateArrayBoulpik = async function(req, res) {
	if (!req.headers.authorization) {
		let message = "TokenMissing";
		//return res.status(401).send({ error: 'TokenMissing' });
		return res.json({ data: {}, success: false, message: message });
	}
	var token = req.headers.authorization.split(" ")[1];
	var value = await ServicesAuth.getUsersByToken(token);

	let message = "";
	var arrayNumbers = req.body.arrayNumber;
	var lenArray = arrayNumbers.length;

	for (let i = 0; i < lenArray; i++) {
		var OldarrayList = await getOldArrayNumber();
		//console.log("OldarrayList : ", OldarrayList);

		var condicionCheckOldArray = await validateBoulpik.countRepetition(arrayNumbers[i], OldarrayList[0].Boulpik);

		if (condicionCheckOldArray.condicion == 1 && condicionCheckOldArray.countRepeat < 3) {
			var boulpik = arrayNumbers[i];
			var idUser = value._id;

			var obj = Object.assign({ boulpik: boulpik, idUser: idUser });
			var number = await ServicesGenerateNumber.GenerateNumber(obj);
		}
	}

	return res.json({ data: arrayNumbers, success: true, message: "" });
};

exports.getFiveHistoryTirage = async function(req, res) {
	let message = "";
	var result = await ServicesSearch.lastFiveBoulpikTirage();

	res.json({ data: result, success: false, message: message });
};
exports.getBoulpikPorTirage = async function(req, res) {
	let message = "";

	BoulpikNumbers.find({ start: req.body.fecha }, async function(err, user) {
		if (err) {
			res.json({ data: {}, success: false, message: err });
		} else {
			res.json({ data: user, success: true, message: message });
		}
	});
};
