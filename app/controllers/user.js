"use strict";
const config = require("../../config");
const jwt = require("jsonwebtoken");
var async = require("async");
var lodash = require("lodash");
var mongoose = require("mongoose"),
	User = mongoose.model("Userslottos"),
	UserNormal = mongoose.model("UsersClients"),
	UserAmin = mongoose.model("UsersAdmins"),
	UserSuper = mongoose.model("UsersSupers"),
	UsersAuths = mongoose.model("UsersAuths"),
	UsersDetaillants = mongoose.model("UsersDetaillants"),
	AccountNumbers = mongoose.model("AccountNumbers"),
	BoulpikNumbers = mongoose.model("BoulpikNumbers"),
	Transaction = mongoose.model("TransactionsBoulpiks"),
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
const ServicesHashCode = require("../services/hash/hash");

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
				res.json({ success: false, message: "0001" });
			} else {
				// check if password matches
				if (user.etat == "0") {
					res.json({
						success: false,
						message: "0003"
					});
				} else if (user.motDePasse != req.body.motDePasse) {
					res.json({
						success: false,
						message: "0004"
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
						message: "0501"
					});
				}
			}
		}
	);
};

exports.list_all_users = async function(req, res) {
	var test = await ServicesHashCode.saltHashPassword("1234");
	console.log("test : ", test);
	var verify = await ServicesHashCode.verifyPassWord("12345", test);

	console.log("verify : ", verify);
	let message = "";
	User.find({}, "-motDePasse", function(err, user) {
		if (err) {
			res.json({ data: {}, success: false, message: err });
		} else {
			res.json({ data: user, success: true, message: message });
		}
	});
};
exports.get_a_DA = function(req, res) {
	let message = "";
	UsersAuths.find({}, function(err, user) {
		if (err) {
			res.json({ data: {}, success: false, message: err });
		} else {
			res.json({ data: user, success: true, message: message });
		}
	});
};

exports.update_a_user;

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
	BoulpikNumbers.find({ etat: 1 })
		.sort([["end", 1]])
		.exec(function(err, user) {
			if (err) {
				res.json({ data: {}, success: false, message: err });
			} else {
				var end;
				var price;
				var data = [];
				for (let i = 0; i < user.length; i++) {
					var objUser = {};

					end = user[i].end;
					price = user[i].price;
					objUser = Object.assign({}, { end, price });
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
				res.json({ data: sortedArray, success: true, message: "0501" });
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
	var idCreateur = value._id;

	var objUsers = Object.assign(
		{},
		{ idUsersLottos: strIdUsersLottos, createur: createur, nom: nom, ville: ville, idCreateur: idCreateur }
	);
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
	var idCreateur = value._id;

	var objUsers = Object.assign(
		{},
		{
			idUsersLottos: strIdUsersLottos,
			createur: createur,
			nom: nom,
			ville: ville,
			idCreateur: idCreateur,
			numero_compte: numero_compte
		}
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
	var idCreateur = value._id;

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
			id_personne_reponsable: value._id,
			idCreateur: idCreateur
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
	const objSuperUser = Object.assign(
		{},
		{
			nom: req.body.nom,
			ville: req.body.ville,
			email: req.body.email,
			tel: req.body.tel,
			role: "Super",
			motDePasse: req.body.motDePasse
		}
	);
	var new_user = new User(objSuperUser);
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
	var number = await ServicesGenerate.GenerateNumber(req.body.fecha);
	return res.json({ data: number.data, success: number.success, message: number.message });
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
		return res.json({ data: {}, success: false, message: "0002" });
	}

	var token = req.headers.authorization.split(" ")[1];
	var value = await ServicesAuth.getUsersByToken(token);
	var idUser = value._id;
	const boulpik = await ServicesSearch.searchBoulpikUsers(idUser);

	const totalHaveInDate = await ServicesSearch.countByDate(boulpik, req.body.fecha);

	const testCountUser = await ServicesSearch.countUserByDate(req.body.boulpik, req.body.fecha);

	const havePlayBoulpik = await ServicesSearch.havePlay(idUser, req.body.boulpik, req.body.fecha);

	const totalHaveInDate2 = await ServicesSearch.countHaveUserPlay(idUser, req.body.fecha);

	const balanceUser = await ServicesSearch.getBalanceById(idUser);

	/* Define Variable Transaction */
	const genre = "Achat";
	const idenvoyeur = idUser;
	const envoyeur = value.nom;
	const envfonction = value.role;
	const balance = 25;
	const idreceveur = "";
	const recfonction = "";
	const receveur = "";

	if (balanceUser >= 25) {
		if (havePlayBoulpik == 0) {
			if (totalHaveInDate2 < 30) {
				if (testCountUser < 3) {
					await ServicesSearch.setBalanceById(idUser, 25);
					var obj = Object.assign({
						boulpik: req.body.boulpik,
						fecha: req.body.fecha,
						price: req.body.price,
						idUser: idUser,
						credit: balanceUser - 25
					});

					var number = await ServicesGenerateNumber.GenerateNumber(obj);
					const _credit = balanceUser - 25;

					/* Create Transaction */
					var objTransaction = Object.assign(
						{},
						{ genre, idenvoyeur, envoyeur, envfonction, receveur, recfonction, idreceveur, balance, credit: _credit }
					);

					await ServicesSearch.createTransaction(objTransaction);

					var result = Object.assign({}, number.data, { credit: _credit });
					if (testCountUser == 1) {
						return res.json({ data: result, success: number.success, message: "0502" });
					}
					if (testCountUser == 2) {
						return res.json({ data: number.data, success: number.success, message: "0503" });
					} else {
						return res.json({ data: number.data, success: number.success, message: "0501" });
					}
				} else {
					return res.json({ data: "", success: false, message: "0209" });
				}
			} else {
				return res.json({ data: "", success: false, message: "0207" });
			}
		} else {
			return res.json({ data: "", success: false, message: "0206" });
		}
	} else {
		return res.json({ data: "", success: false, message: "0300" });
	}
};

exports.create_a_admin = async function(req, res) {
	if (!req.headers.authorization) {
		let message = "TokenMissing";
		//return res.status(401).send({ error: 'TokenMissing' });
		return res.json({ data: {}, success: false, message: "0002" });
	}
	var token = req.headers.authorization.split(" ")[1];
	let message = "";
	var objUsers = {};
	const objAdmin = Object.assign(
		{},
		{
			nom: req.body.nom,
			ville: req.body.ville,
			email: req.body.email,
			tel: req.body.tel,
			role: "Admin",
			motDePasse: req.body.motDePasse
		}
	);
	var new_user = new User(objAdmin);
	new_user.save(async function(err, user) {
		if (err) {
			res.json({ data: err, success: false, message: "0401" });
		} else {
			const dataInfo = await createAdmins(token, user._id, req.body.nom, req.body.ville);
			var value = await ServicesAuth.getUsersByToken(token);

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
		return res.json({ data: {}, success: false, message: "0002" });
	}
	var token = req.headers.authorization.split(" ")[1];
	let message = "";
	var objUsers = {};
	const objDA = Object.assign(
		{},
		{
			nom: req.body.nom,
			ville: req.body.ville,
			email: req.body.email,
			tel: req.body.tel,
			role: "Distributeurs",
			motDePasse: req.body.motDePasse
		}
	);
	var new_user = new User(objDA);

	new_user.save(async function(err, user) {
		if (err) {
			res.json({ data: err, success: false, message: "0401" });
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
	const objDetaillants = Object.assign(
		{},
		{
			nom: req.body.nom,
			ville: req.body.ville,
			email: req.body.email,
			tel: req.body.tel,
			role: "Detaillants",
			motDePasse: req.body.motDePasse
		}
	);
	var new_user = new User(objDetaillants);
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
			//console.log("err : ", err.code);
			if (err.code == "11000") {
				res.json({ data: {}, success: false, message: "0007" });
			} else {
				res.json({ data: {}, success: false, message: "0707" });
			}
		} else {
			var token = jwt.sign({ sub: user._id, role: "User" }, config.secret, {
				expiresIn: 1200000000000 // expires in 20 minutes
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
				message: "0501"
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
			//console.log("user._id : ", user._id);
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

	//console.log(infoToken);
};

exports.update_a_user = async function(req, res) {
	var item = req.body;
	var user = await ServicesSearch.searchUsersByID(req.params.userId);
	var _oldPassWord = user[0].motDePasse;

	if (item.motDePasse) {
		// if ((await ServicesHashCode.verifyPassWord(item.motDePasse, item.newMotDePasse)) == 1) {
		// 	console.log("Heoooo");
		// 	res.json({ data: {}, success: false, message: "0009" });
		// }
		if (!(item.motDePasse == _oldPassWord)) {
			res.json({ data: {}, success: false, message: "0009" });
		} else {
			item["motDePasse"] = item.newMotDePasse;

			User.findOneAndUpdate({ _id: req.params.userId }, { $set: item }, { new: true }, function(err, user) {
				if (err) {
					res.json({ data: {}, success: false, message: "0211" });
				} else {
					res.json({ data: user, success: true, message: "0501" });
				}
			});
		}
	}
};

exports.modifyUser = function(req, res) {
	let message = "";
	var updateObject = req.body;
	User.findOneAndUpdate({ _id: req.params.userId }, { $set: updateObject }, { new: true }, function(err, user) {
		if (err) {
			res.json({ data: {}, success: false, message: err });
		} else {
			res.json({ data: user, success: true, message: "0501" });
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
				res.json({ data: user, success: true, message: "0501" });
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
exports.ListPrimeBoulpik = async function(req, res) {
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
	//console.log("fecha : ", fecha);
	const _ObjBoulpik = await totalBoulpik(fecha);
	const _totalBoulpik = _ObjBoulpik[0].Boulpik;
	const lengthBoulpik = _totalBoulpik.length;

	const PriceBoulPik = 25;
	var totalRecharge = lengthBoulpik * PriceBoulPik;
	const ObjPrime = await findPrimeBoulPik();
	const one = Math.round((totalRecharge * ObjPrime[0].one) / 100);
	const two = Math.round((totalRecharge * ObjPrime[0].two) / 100);
	const three = Math.round((totalRecharge * ObjPrime[0].three) / 100);
	const four = Math.round((totalRecharge * ObjPrime[0].four) / 100);
	const five = Math.round((totalRecharge * ObjPrime[0].five) / 100);

	const TotalRecharge = totalRecharge;

	const totalShare = one + two + three + four + five;

	res.json({
		data: {
			arrayPosicion: [
				{ place: "One", prize: one },
				{ place: "Two", prize: two },
				{ place: "Three", prize: three },
				{ place: "Four", prize: four },
				{ place: "Five", prize: five }
			],
			fecha,
			TotalRecharge,
			totalShare
		},
		success: true,
		message: "0501"
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

exports.DynamicTirage = async function(req, res) {
	const fechaTirage = req.body.fecha;
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

	//console.log("Set : ", _setWinners);

	res.json({ data: _setWinners });
};
exports.addBoulpikCarrito = async function(req, res) {
	let message = {};
	if (!req.headers.authorization) {
		let message = "TokenMissing";

		return res.json({ data: {}, success: false, message: "0002" });
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
	var carrito = _dataInfo.carrito;
	const boulpik = await ServicesSearch.searchBoulpikUsers(user[0]._id);

	const totalHaveInDatePayed = await ServicesSearch.countByDate(boulpik, req.body.fecha);

	var totalHaveInDate = await ServicesSearch.countByDate(carrito, req.body.fecha);

	if (totalHaveInDate + totalHaveInDatePayed < 30) {
		let condicion = await checkNumberInNumberCarrito(carrito, req.body.boulpik);

		var OldarrayList = await getOldArrayNumber(req.body.fecha); //["6", "5", "0", "4", "3"];

		var condicionCheckOldArray = await ServicesValidate.countRepetition2(
			req.body.boulpik,
			req.body.fecha,
			OldarrayList[0].Boulpik
		);

		if (condicionCheckOldArray.countRepeat == 0) {
			//let played = await checkNumberPlayed(Boulpik, req.body.boulpik);
			var objCarrito = {};
			if (condicion == 1) {
				objCarrito = Object.assign({}, { boulpik: req.body.boulpik, fecha: req.body.fecha, price: req.body.price });
				carrito.push(objCarrito);
				objCarrito = {};
				var _addBoulpikCart = await ServicesGenerateNumber.updateBoulpikCart(idUser, carrito);
				return res.json({ data: carrito, success: true, message: "0501" });
			} else {
				return res.json({ data: "", success: false, message: "0205" });
			}
		} else {
			return res.json({ data: "", success: false, message: "0206" });
		}
	} else {
		return res.json({ data: "", success: false, message: "0207" });
	}
};

exports.deleteBoulpikCarrito = async function(req, res) {
	let message = {};
	if (!req.headers.authorization) {
		let message = "TokenMissing";

		return res.json({ data: {}, success: false, message: "0002" });
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
	var carrito = _dataInfo.carrito;
	//done
	//console.log("carrito : ", carrito);
	//console.log("req.body.boulpik : ", req.body.boulpik);
	let condicion = await checkNumberInNumberCarrito(carrito, req.body.boulpik);
	//console.log("condicion : ", condicion);

	if (condicion == 0) {
		for (var i = 0; i < carrito.length; i++) {
			if (carrito[i].boulpik === req.body.boulpik && carrito[i].fecha === req.body.fecha) carrito.splice(i, 1);
		}

		var _deleteBoulpikCart = await ServicesGenerateNumber.updateBoulpikCart(idUser, carrito);
		return res.json({ data: carrito, success: true, message: "0501" });
	} else {
		return res.json({ data: {}, success: false, message: "0205" });
	}

	//console.log("carrito : ", carrito);

	//console.log("_dataInfo : ", _dataInfo);
};

exports.BalanceUsers = async function(req, res) {
	let message = "";
	var _dataInfo = {};
	User.findById(req.params.userId, async function(err, user) {
		if (err) {
			res.json({ data: err, success: false, message: "0401" });
		} else {
			res.json({ data: user.credit, success: true, message: "0501" });
		}
	});
};

exports.priceBoulpiks = async function(req, res) {
	let message = "";

	const _ObjBoulpik = await totalBoulpik();
	const _priceBoulpik = _ObjBoulpik[0].price;
	res.json({ data: _priceBoulpik, success: true, message: "0501" });
};

exports.sendMail = async function(req, res) {
	var result = await Servicesmessage.sendEmail(req.body.email);
	return res.json({ data: result, success: true, message: "0501" });
	//console.log("result : ", result);
};

exports.sendSMS = async function(req, res) {
	var result = await Servicesmessage.sendSMS(req.body.phone);
	return res.json({ data: result, success: true, message: "0501" });
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
		return res.json({ data: {}, success: false, message: "0002" });
	}

	var token = req.headers.authorization.split(" ")[1];
	var value = await ServicesAuth.getUsersByToken(token);

	let message = "";
	var arrayNumbers = req.body.arrayNumber;

	var lenArray = arrayNumbers.length;

	const balanceUser = await ServicesSearch.getBalanceById(value._id);
	const _size = lenArray * 25 * 1;

	if (balanceUser >= _size) {
		for (let i = 0; i < lenArray; i++) {
			var OldarrayList = await getOldArrayNumber();

			var condicionCheckOldArray = await validateBoulpik.countRepetition3(
				arrayNumbers[i].boulpik,
				arrayNumbers[i].fecha,
				OldarrayList[0].Boulpik
			);

			if (condicionCheckOldArray.condicion == 1 && condicionCheckOldArray.countRepeat < 3) {
				var boulpik = arrayNumbers[i].boulpik;
				var fecha = arrayNumbers[i].fecha;
				var idUser = value._id;

				var obj = Object.assign({ boulpik: boulpik, fecha: fecha, idUser: idUser });

				var number = await ServicesGenerateNumber.GenerateNumber(obj);

				await ServicesSearch.setCartUserNull(obj.idUser, arrayNumbers);
				await ServicesSearch.setBalanceById(idUser, 25);
			}
		}
		var credit = balanceUser - _size * 1;
		/* Define Variable Transaction */
		const genre = "Achat";
		const idenvoyeur = value._id;
		const envoyeur = value.nom;
		const envfonction = value.role;
		const balance = _size;
		const idreceveur = "";
		const recfonction = "";
		const receveur = "";
		var objTransaction = Object.assign(
			{},
			{ genre, idenvoyeur, envoyeur, envfonction, receveur, recfonction, idreceveur, balance, credit: credit }
		);

		await ServicesSearch.createTransaction(objTransaction);

		return res.json({ data: { arrayNumbers, credit }, success: true, message: "0501" });
	} else {
		return res.json({ data: "", success: false, message: "0300" });
	}
};

exports.getFiveHistoryTirage = async function(req, res) {
	if (!req.headers.authorization) {
		return res.json({ data: {}, success: false, message: "0002" });
	}

	var token = req.headers.authorization.split(" ")[1];
	var user = await ServicesAuth.getUsersByToken(token);

	var result = await ServicesSearch.lastFiveBoulpikTirage();
	//const boulpik = await ServicesSearch.searchBoulpikUsers(user._id);
	//console.log("boulpik : ", boulpik);
	//res.json({ data: { result, boulpik }, success: true, message: "0501" });

	res.json({ data: result, success: true, message: "0501" });
};
exports.getBoulpikPorTirage = async function(req, res) {
	let message = "";

	BoulpikNumbers.find({ end: req.body.fecha }).sort({ created: "desc" }),
		async function(err, user) {
			if (err) {
				res.json({ data: "", success: false, message: "0401" });
			} else {
				res.json({ data: user, success: true, message: "0501" });
			}
		};
};

exports.transactions = async function(req, res) {
	if (!req.headers.authorization) {
		let message = "TokenMissing";

		return res.json({ data: {}, success: false, message: "0002" });
	}
	var token = req.headers.authorization.split(" ")[1];
	var value = await ServicesAuth.getUsersByToken(token);

	const idenvoyeur = value._id;

	const envoyeur = value.nom;
	const envfonction = value.role;

	var _User = await ServicesSearch.searchUsersByEmailOrPhone(req.body.email);
	//console.log("User : ", _User);
	if (_User) {
		const idreceveur = _User._id;

		const receveur = _User.nom;
		const recfonction = _User.role;
		const balance = req.body.balance;

		if (value.credit * 1 >= balance) {
			await ServicesSearch.setBalanceById(idenvoyeur, balance);

			await ServicesSearch.upBalanceById(idreceveur, balance);
			const _credit = value.credit * 1 - balance;
			var objTransaction = Object.assign(
				{},
				{ idenvoyeur, envoyeur, envfonction, receveur, recfonction, idreceveur, balance, credit: _credit }
			);

			await ServicesSearch.createTransaction(objTransaction);

			return res.json({ data: objTransaction, success: true, message: "0501" });
		} else {
			return res.json({ data: {}, success: false, message: "0300" });
		}
	} else {
		return res.json({ data: {}, success: false, message: "0211" });
	}
};
exports.transactions_all = async function(req, res) {
	let message = "";
	Transaction.find({}, function(err, transactions) {
		if (err) {
			res.json({ data: {}, success: false, message: err });
		} else {
			res.json({ data: transactions, success: true, message: "0501" });
		}
	});
};

exports.my_transaction_users = async function(req, res) {
	if (!req.headers.authorization) {
		let message = "TokenMissing";
		//return res.status(401).send({ error: 'TokenMissing' });
		return res.json({ data: {}, success: false, message: "0002" });
	}
	var token = req.headers.authorization.split(" ")[1];
	var value = await ServicesAuth.getUsersByToken(token);

	const userId = value._id;

	var objTransactions = await ServicesSearch.searchUsersTransactions(userId);
	res.json({ data: objTransactions, success: true, message: "0501" });
};

exports.see_transaction_users = async function(req, res) {
	var objTransactions = await ServicesSearch.searchUsersTransactions(req.body.idUser);
	res.json({ data: objTransactions, success: true, message: "0501" });
};

async function getDateNow() {
	var now = new Date();
	var year = now.getFullYear();
	var month = now.getMonth() + 1;
	var day = now.getDate();
	var hour = now.getHours();
	var minute = now.getMinutes();
	var second = now.getSeconds();
	if (month.toString().length == 1) {
		month = "0" + month;
	}
	if (day.toString().length == 1) {
		day = "0" + day;
	}
	if (hour.toString().length == 1) {
		hour = "0" + hour;
	}
	if (minute.toString().length == 1) {
		minute = "0" + minute;
	}
	if (second.toString().length == 1) {
		second = "0" + second;
	}
	var dateTime = day + "/" + month + "/" + year;

	return dateTime;
}

exports.createTirage = async function(req, res) {
	//var dateTime = await getDateNow();
	var dateTime =
		Math.random()
			.toString(36)
			.substring(2, 15) +
		Math.random()
			.toString(36)
			.substring(2, 15);
	var objBoulpikTirange = Object.assign({}, { Boulpik: [], start: dateTime, end: req.body.end, arrayWinner: [] });
	var new_boulpik = new BoulpikNumbers(objBoulpikTirange);
	return new_boulpik.save(async function(err, boulpik) {
		if (err) {
			res.json({ data: "", success: false, message: err });
		} else {
			res.json({ data: boulpik, success: true, message: "0501" });
		}
	});
};

exports.mySonTransactions = async function(req, res) {
	if (!req.headers.authorization) {
		let message = "TokenMissing";
		//return res.status(401).send({ error: 'TokenMissing' });
		return res.json({ data: {}, success: false, message: "0002" });
	}
	var token = req.headers.authorization.split(" ")[1];
	var value = await ServicesAuth.getUsersByToken(token);

	const userId = value._id;
	var objTransactions = await ServicesSearch.searchSonUsersTransactions(userId);
	//res.json({ data: objTransactions, success: true, message: "0501" });
};
