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
	InfoBoulpik = mongoose.model("InfoBoulpiks");
//const ServicesCredit = require("../services/credits/credits");
const ServicesAuth = require("../services/auth/auth");
const ServicesGenerate = require("../services/generate/account-number");
const ServicesGenerateNumber = require("../services/generate/boulpik-number");
const ServicesCreatePrimeBoulpik = require("../services/createAndUpdate/prime-boulpik");
const ServicesSearch = require("../services/search/search");

exports.authenticate = async function(req, res, next) {
	var message = {};
	if (req.body.tel) {
		User.findOne(
			{
				tel: req.body.tel
			},
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
							expiresIn: 1200 // expires in 20 minutes
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
	} else if (req.body.email) {
		User.findOne(
			{
				email: req.body.email
			},
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
							expiresIn: 1200 // expires in 20 minutes
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
	}
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
exports.GenerateNumberBoulpik = async function(req, res) {
	var number = await ServicesGenerateNumber.GenerateNumber(req.body.number);
	return res.json({ data: number });
	console.log("Number : ", number);
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
			const dataInfo = await createNormalUsers(user._id, req.body.nom, req.body.ville, accountId);

			objUsers = Object.assign({}, { PersoInfo: user, dataInfo: dataInfo });
			res.json({ data: objUsers, success: true, message: message });
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
			//console.log("_dataInfo : ", _dataInfo);
			res.json({ data: { user, _dataInfo }, success: true, message: message });
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
	return PrimesBoulpiks.find({}, async function(err, user) {
		if (err) {
			return { data: {}, success: false, message: err };
		} else {
			return { data: user, success: true, message: message };
		}
	});
}
async function totalBoulpik() {
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
exports.ListPrimeBoulpik = async function(req, res) {
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
	res.json({
		One: one / 100,
		Two: two / 100,
		Three: three / 100,
		Four: four / 100,
		Five: five / 100,
		TotalDistribue: total / 100,
		TotalRecharge: totalRecharge
	});
	// let message = "";
	// var updateObject = req.body;
	// var response = await ServicesCreatePrimeBoulpik.createPrimeBoulpik(updateObject);
	// res.json({ data: response });
};

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

exports.DynamicTirage = async function(req, res) {
	const _ObjBoulpik = await totalBoulpik();
	const _totalBoulpik = _ObjBoulpik[0].Boulpik;
	var OldarrayList = [];
	var limit = 5;
	do {
		var item = _totalBoulpik[Math.floor(Math.random() * _totalBoulpik.length)];
		var condicionCheckOldArray = await checkNumberInArray(OldarrayList, item);

		if (condicionCheckOldArray == 1) {
			limit = limit - 1;
			OldarrayList.push(item);
		}
	} while (limit != 0);

	res.json({ data: OldarrayList });
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
