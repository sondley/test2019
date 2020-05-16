"use strict";

const jwt = require("jsonwebtoken");
var async = require("async");
var lodash = require("lodash");
var axios = require("axios");
var mongoose = require("mongoose"),
	User = mongoose.model("Userslottos"),
	BOULPIK = mongoose.model("Eznas"),
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
const ServicesTirage = require("../services/generate/tirage");

const ServicesUser = require("../services/userTasks/user");
var config = require("../../config"); // get our config file

var moncash = require("nodejs-moncash-sdk");

moncash.configure({
	mode: config.mode,
	client_id: config.Mclient_id,
	client_secret: config.Mclient_secret,
});

const validateBoulpik = require("../services/validate/number");

exports.roleByEmailTel = async function (req, res, next) {
	var message = {};

	User.findOne(
		{ $or: [{ email: req.body.email }, { tel: req.body.email }] },
		// {
		// 	email: req.body.email
		// },
		function (err, user) {
			if (err) throw err;

			if (!user) {
				res.json({ success: false, message: "0001" });
			} else {
				//var test = await ServicesHashCode.validatePassword(req.body.motDePasse, user.salt, user.motDePasse);
				// check if password matches
				if (user.etat == "0") {
					res.json({
						success: false,
						message: "0003",
					});
				} else {
					console.log("Users : ", user);
					res.json({
						data: user.role,
						success: true,
						message: "0501",
					});
				}
			}
		}
	);
};

exports.authenticate = async function (req, res, next) {
	var message = {};
	console.log("", req.body.email);
	User.findOne(
		{ $or: [{ email: req.body.email }, { tel: req.body.email }] },
		// {
		// 	email: req.body.email
		// },
		function (err, user) {
			//console.log("user : ", user);
			if (err) throw err;

			if (!user) {
				res.json({ success: false, message: "0001" });
			} else {
				//var test = await ServicesHashCode.validatePassword(req.body.motDePasse, user.salt, user.motDePasse);
				// check if password matches
				if (user.etat == "0") {
					res.json({
						success: false,
						message: "0003",
					});
				} else if (user.motDePasse !== req.body.motDePasse) {
					res.json({
						success: false,
						message: "0004",
					});
				} else {
					/*if user role is  vendeur, and vendeur is not set in list caisse of day, put user in the list if the caisse state is open*/

					// if user is found and password is right
					// create a token
					console.log("BINGO");

					//var token = jwt.sign(payload, app.get('superSecret'), {
					var token = jwt.sign({ sub: user._id, role: user.role }, config.secret, {
						expiresIn: 315360000, // expires in 10 years
					});

					res.json({
						data: {
							user,
							token,
						},
						success: true,
						message: "0501",
					});
				}
			}
		}
	);
};
exports.validatePin = async function (req, res) {
	var pin = req.body.pin;

	if (!req.headers.authorization) {
		let message = "TokenMissing";

		return res.json({ data: {}, success: false, message: "0002" });
	}
	var token = req.headers.authorization.split(" ")[1];
	var value = await ServicesAuth.getUsersByToken(token);
	var idUser = value._id;

	if (pin == value.pin) {
		res.json({ data: {}, success: true, message: "0501" });
	} else {
		res.json({ data: {}, success: false, message: "0010" });
	}
};

exports.resetPassword = async function (req, res) {
	var newMotDePasse = req.body.newMotDePasse;
	if (!req.headers.authorization) {
		let message = "TokenMissing";

		return res.json({ data: {}, success: false, message: "0002" });
	}

	var token = req.headers.authorization.split(" ")[1];
	var value = await ServicesAuth.getUsersByToken(token);
	var idUser = value._id;

	return User.findOneAndUpdate({ _id: idUser }, { $set: { motDePasse: newMotDePasse } }, { new: true }, function (
		err,
		user
	) {
		if (err) {
			return { data: {}, success: false, message: "0211" };
		} else {
			return { data: user, success: true, message: "0501" };
		}
	});
};

/*exports.resetPasswordPin = async function(req, res) {
	var newMotDePasse = req.body.newMotDePasse;
	if (!req.headers.authorization) {
		let message = "TokenMissing";

		return res.json({ data: {}, success: false, message: "0002" });
	}

	var token = req.headers.authorization.split(" ")[1];
	var value = await ServicesAuth.getUsersByToken(token);
	var idUser = value._id;

	return User.findOneAndUpdate({ _id: idUser }, { $set: { motDePasse: newMotDePasse } }, { new: true }, function(
		err,
		user
	) {
		if (err) {
			return { data: {}, success: false, message: "0211" };
		} else {
			return { data: user, success: true, message: "0501" };
		}
	});
};*/

exports.list_all_users = async function (req, res) {
	var test = await ServicesHashCode.saltHashPassword("1234");
	//console.log("test : ", test);
	var verify = await ServicesHashCode.verifyPassWord("12345", test);

	//console.log("verify : ", verify);
	let message = "";
	User.find({}, "-motDePasse", function (err, user) {
		if (err) {
			res.json({ data: {}, success: false, message: err });
		} else {
			res.json({ data: user, success: true, message: message });
		}
	});
};

exports.testNow = async function (req, res) {
	var Country = require("country-state-picker");
	//let countries = Country.getCountries();
	let countries = Country.getStates("ht");
	//let countries = Country.Cities("ht");
	console.log("countries : ", countries);
	return res.json({ data: countries, success: false, message: "0002" });
};

exports.get_a_DA = async function (req, res) {
	if (!req.headers.authorization) {
		let message = "TokenMissing";

		return res.json({ data: {}, success: false, message: "0002" });
	}

	var token = req.headers.authorization.split(" ")[1];
	var value = await ServicesAuth.getUsersByToken(token);
	var role = value.role;
	let message = "";
	var AuthUsers = [];
	var DetaillantsUsers = [];

	if (role == "User") {
		var _user = {};

		DetaillantsUsers = await User.find({ role: "Detaillants" });
		_user = Object.assign({}, { DetaillantsUsers });
		//console.log("_User : ", _user);

		res.json({ data: _user, success: true, message: message });
	} else if (role == "Detaillants") {
		var _user = {};
		//AuthUsers = await User.find({ role: "Distributeurs" });
		AuthUsers = await User.find({ role: "Distributeurs" });

		_user = Object.assign({}, { AuthUsers });
		//console.log("_User : ", _user);
		res.json({ data: _user, success: true, message: message });
	}
};

exports.getVille = function (req, res) {
	let message = "";
	City.find({}, function (err, city) {
		if (err) {
			res.json({ data: {}, success: false, message: err });
		} else {
			res.json({ data: city, success: true, message: message });
		}
	});
};

exports.getZone = function (req, res) {
	let message = "";
	City.find({ nom: req.body.ville }, function (err, city) {
		if (err) {
			res.json({ data: {}, success: false, message: err });
		} else {
			res.json({ data: city, success: true, message: message });
		}
	});
};

exports.list_all_number_boulpik = function (req, res) {
	let message = "";
	BoulpikNumbers.find({ etat: 1 })
		.sort([["end", 1]])
		.exec(function (err, user) {
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
				const parsedArray = data.map((item) => {
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

exports.list_all_number_id = function (req, res) {
	let message = "";
	AccountNumbers.find({}, function (err, user) {
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
	return new_user.save(async function (err, user) {
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
	return new_user.save(async function (err, user) {
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
			numero_compte: numero_compte,
		}
	);
	var new_user = new UsersDetaillants(objUsers);
	return new_user.save(async function (err, user) {
		if (err) {
			return { success: false, data: "", message: err };
		} else {
			return user;
		}
	});
}

async function createDetaillants_no_token(_token, strIdUsersLottos, nom, ville, numero_compte) {
	var value = await ServicesAuth.getUsersByToken(_token);

	var createur = "Systeme";
	var idCreateur = "Systeme";

	var objUsers = Object.assign(
		{},
		{
			idUsersLottos: strIdUsersLottos,
			createur: createur,
			nom: nom,
			ville: ville,
			idCreateur: idCreateur,
			numero_compte: numero_compte,
		}
	);
	var new_user = new UsersDetaillants(objUsers);
	return new_user.save(async function (err, user) {
		if (err) {
			return { success: false, data: "", message: err };
		} else {
			return user;
		}
	});
}

async function createDA(_token, strIdUsersLottos, nom, ville, address, numero_matricule) {
	var value = await ServicesAuth.getUsersByToken(_token);

	var createur = value.nom;
	var idCreateur = value._id;

	var objUsers = Object.assign(
		{},
		{
			idUsersLottos: strIdUsersLottos,
			nom: nom,
			address: address,
			ville: ville,
			createur: createur,
			numero_matricule: numero_matricule,
			nom_personne_reponsable: createur,
			id_personne_reponsable: value._id,
			idCreateur: idCreateur,
		}
	);
	var new_user = new UsersAuths(objUsers);
	return new_user.save(async function (err, user) {
		if (err) {
			return { success: false, data: "", message: err };
		} else {
			return user;
		}
	});
}

async function createDataVendeur(_token, strIdUsersLottos, nom, ville, address, numero_matricule) {
	var value = await ServicesAuth.getUsersByToken(_token);

	var createur = "Systeme";
	var idCreateur = value._id;

	var objUsers = Object.assign(
		{},
		{
			idUsersLottos: strIdUsersLottos,
			nom: nom,
			address: address,
			ville: ville,
			createur: createur,
			numero_matricule: numero_matricule,
			nom_personne_reponsable: createur,
			id_personne_reponsable: createur,
			idCreateur: idCreateur,
		}
	);
	var new_user = new UsersAuths(objUsers);
	return new_user.save(async function (err, user) {
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
	return new_user.save(async function (err, user) {
		if (err) {
			return { success: false, data: "", message: err };
		} else {
			return user;
		}
	});
}

async function getAdminById(userId) {
	return UserAmin.find({ idUsersLottos: userId }, function (err, user) {
		if (err) {
			return err;
		} else {
			return user;
		}
	});
}

async function getSuperById(userId) {
	return UserSuper.find({ idUsersLottos: userId }, function (err, user) {
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

	return UserSuper.findOneAndUpdate({ idUsersLottos: superId }, { $set: { Admin: _Admin } }, { new: true }, function (
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

	return UserAmin.findOneAndUpdate({ idUsersLottos: adminId }, { $set: { DA: _DA } }, { new: true }, function (
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
		function (err, user) {
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

	return UserSuper.findOneAndUpdate({ idUsersLottos: superId }, { $set: { DA: _DA } }, { new: true }, function (
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

exports.create_super_users = async function (req, res) {
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
			motDePasse: req.body.motDePasse,
		}
	);
	var new_user = new User(objSuperUser);
	new_user.save(async function (err, user) {
		if (err) {
			res.json({ data: {}, success: false, message: err });
		} else {
			const dataInfo = await createSuperUsers(user._id, req.body.nom, req.body.ville);

			objUsers = Object.assign({}, { PersoInfo: user, dataInfo: dataInfo });
			res.json({ data: objUsers, success: true, message: message });
		}
	});
};

exports.GenerateNumber = async function (req, res) {
	var number = await ServicesGenerate.GenerateNumber(req.body.fecha);
	return res.json({ data: number.data, success: number.success, message: number.message });
	//console.log("Number : ", number);
};
async function getOldArrayNumber(_start) {
	return BoulpikNumbers.find({ start: _start }, function (err, objArray) {
		if (err) {
			return err;
		} else {
			return objArray;
		}
	});
}
exports.GenerateNumberBoulpik = async function (req, res) {
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
	const genre = "Boulpik";
	const idenvoyeur = idUser;
	const envoyeur = value.nom;
	const envfonction = value.role;
	const balance = req.body.price;
	//await ServicesGenerateNumber.getPriceBoulpikPorTirage(req.body.fecha);

	const idreceveur = "";
	const recfonction = "";
	const receveur = "";
	console.log("step One1");
	if (balanceUser >= balance) {
		console.log("step One2");
		if (havePlayBoulpik == 0) {
			console.log("step One3");
			if (totalHaveInDate2 < 30) {
				if (testCountUser < 3) {
					console.log("step One4");
					//get total Boulpik Existe
					const _totalBoulpik = await ServicesGenerateNumber.getTotalBoulpik(req.body.fecha);
					//console.log("pastTotal : ", _totalBoulpik);

					//Set total Here
					await ServicesGenerateNumber.setTotalBoulpik(req.body.fecha, _totalBoulpik);
					await ServicesSearch.setBalanceById(idUser, balance);
					var obj = Object.assign({
						boulpik: req.body.boulpik,
						fecha: req.body.fecha,
						price: req.body.price,
						idUser: idUser,
						credit: balanceUser - balance,
					});

					var number = await ServicesGenerateNumber.GenerateNumber(obj);
					const _credit = balanceUser - balance;

					/* Create Transaction */
					var objTransaction = Object.assign(
						{},
						{ genre, idenvoyeur, envoyeur, envfonction, receveur, recfonction, idreceveur, balance, credit: _credit }
					);

					await ServicesSearch.createTransaction(objTransaction);
					await Servicesmessage.addMessageUsersBuyBoulpik(objTransaction, req.body.boulpik, req.body.fecha);
					//await

					var result = Object.assign({}, number.data, { credit: _credit });
					if (testCountUser == 1) {
						await Servicesmessage.addMessageUsersSharingBoulpik(req.body.boulpik, idenvoyeur, req.body.fecha);
						return res.json({ data: result, success: number.success, message: "0502" });
					}
					if (testCountUser == 2) {
						await Servicesmessage.addMessageUsersSharingBoulpik(req.body.boulpik, idenvoyeur, req.body.fecha);
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

exports.create_a_admin = async function (req, res) {
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
			motDePasse: req.body.motDePasse,
		}
	);
	var new_user = new User(objAdmin);
	new_user.save(async function (err, user) {
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
exports.create_a_DA = async function (req, res) {
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
			zone: req.body.zone,
			address: req.body.address,
			email: req.body.email,
			tel: req.body.tel,
			surnom: req.body.surnom,
			role: "Distributeurs",
			motDePasse: req.body.motDePasse,
		}
	);
	var new_user = new User(objDA);

	new_user.save(async function (err, user) {
		if (err) {
			res.json({ data: err, success: false, message: "0401" });
		} else {
			const dataInfo = await createDA(
				token,
				user._id,
				req.body.nom,
				req.body.ville,
				req.body.address,
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

exports.create_a_Detaillant = async function (req, res) {
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
			surnom: req.body.surnom,
			nom: req.body.nom,
			address: req.body.address,
			ville: req.body.ville,
			email: req.body.email,
			zone: req.body.zone,
			tel: req.body.tel,
			role: "Detaillants",
			motDePasse: req.body.motDePasse,
		}
	);
	var new_user = new User(objDetaillants);
	var _numero_compte = await ServicesGenerate.GenerateNumber();
	var numero_compte = _numero_compte.data;

	new_user.save(async function (err, user) {
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

exports.create_a_user = async function (req, res) {
	let message = "";
	var objUsers = {};

	var _accountId = await ServicesGenerate.GenerateNumber();
	//console.log("_accountId : ", _accountId);
	var accountId = _accountId.data;
	var nom = req.body.nom;
	var tel = req.body.tel;
	var address = req.body.address;
	var ville = req.body.ville;
	var zone = req.body.zone;
	var surnom = req.body.surnom;
	var email = req.body.email;
	var pin = req.body.pin;
	var motDePasse = req.body.motDePasse;
	var credit = 25;

	//var _hashing = await ServicesHashCode.hashPassWord(motDePasse);
	//var salt = _hashing.salt;
	//motDePasse = _hashing.hash;
	var salt = "";

	objUsers = Object.assign({}, { nom, credit, zone, address, ville, surnom, tel, email, pin, motDePasse, salt });
	var new_user = new User(objUsers);
	new_user.save(async function (err, user) {
		if (err) {
			//console.log("err : ", err.code);
			if (err.code == "11000") {
				res.json({ data: {}, success: false, message: "0007" });
			} else {
				res.json({ data: {}, success: false, message: "0707" });
			}
		} else {
			var token = jwt.sign({ sub: user._id, role: "User" }, config.secret, {
				expiresIn: 1200000000000, // expires in 20 minutes
			});
			const dataInfo = await createNormalUsers(user._id, req.body.nom, req.body.ville, accountId);
			const boulpik = await ServicesSearch.searchBoulpikUsers(user._id);

			//objUsers = Object.assign({}, { PersoInfo: user, dataInfo: dataInfo });

			res.json({
				data: {
					user,
					token,
					dataInfo,
					boulpik,
				},
				success: true,
				message: "0501",
			});
			//const dataInfo = await createNormalUsers(user._id, req.body.nom, req.body.ville, accountId);

			//objUsers = Object.assign({}, { PersoInfo: user, dataInfo: dataInfo });
			//	res.json({ data: user, success: true, message: message });
		}
	});
};

exports.createCity = async function (req, res) {
	let message = "";

	var new_city = new City(req.body);
	new_city.save(async function (err, city) {
		if (err) {
			res.json({ data: {}, success: false, message: err });
		} else {
			res.json({ data: city, success: true, message: message });
		}
	});
};

exports.read_a_user = async function (req, res) {
	let message = "";
	var _dataInfo = {};
	User.findById(req.params.userId, async function (err, user) {
		if (err) {
			res.json({ data: {}, success: false, message: err });
		} else {
			if (user) {
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
			} else {
				res.json({ data: {}, success: false, message: "0010" });
			}
		}
	});
};
exports.refreshToken = function (req, res) {
	var strToken = req.headers.authorization.split(" ")[1];
	//console.log(strToken);
	//var strToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1YzZmMGZkNzljY2U0NjAwMTc2ZmI1ZDQiLCJyb2xlIjoiZGlyZWN0b3IiLCJpYXQiOjE1NTEyMDU3NTIsImV4cCI6MTU1MTI5MjE1Mn0.XT5Id0FwlfS26k_R7rsLN-GHH_sX8gvwr6qKOkaCnPw";
	var message = {};
	var infoToken = jwt.decode(strToken);
	if (infoToken) {
		message = "successfull Token";
		var token = jwt.sign({ sub: infoToken.sub, role: infoToken.role }, config.secret, {
			expiresIn: 1200, // expires in 20 minutes
		});

		res.json({
			data: {
				token,
			},
			success: true,
			message: message,
		});
	} else {
		message = "Invalid Token";
		res.json({ data: {}, success: false, message: message });
	}

	//console.log(infoToken);
};

exports.update_a_user = async function (req, res) {
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

			User.findOneAndUpdate({ _id: req.params.userId }, { $set: item }, { new: true }, function (err, user) {
				if (err) {
					res.json({ data: {}, success: false, message: "0211" });
				} else {
					res.json({ data: user, success: true, message: "0501" });
				}
			});
		}
	}
};

exports.modifyUser = function (req, res) {
	var updateObject = req.body.user;

	User.findOneAndUpdate({ _id: req.params.userId }, { $set: updateObject }, { new: true }, function (err, user) {
		if (err) {
			res.json({ data: {}, success: false, message: err });
		} else {
			res.json({ data: user, success: true, message: "0501" });
		}
	});
};

exports.delete_a_user = function (req, res) {
	let message = "";

	User.remove(
		{
			_id: req.params.userId,
		},
		function (err, user) {
			if (err) {
				res.json({ data: {}, success: false, message: err });
			} else {
				res.json({ data: user, success: true, message: "0501" });
			}
		}
	);
};
exports.deleteMany = function (req, res) {
	let message = "";

	UsersAuths.deleteMany(function (err, user) {
		if (err) {
			res.json({ data: {}, success: false, message: err });
		} else {
			res.json({ data: user, success: true, message: "0501" });
		}
	});
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

exports.createPrimeBoulpik = async function (req, res) {
	let message = "";
	var updateObject = req.body;
	var response = await ServicesCreatePrimeBoulpik.createPrimeBoulpik(updateObject);
	res.json({ data: response });
};

async function findPrimeBoulPik() {
	let message = "";
	return PrimesBoulpiks.find({}, async function (err, user) {
		if (err) {
			return { data: {}, success: false, message: err };
		} else {
			return { data: user, success: true, message: "0501" };
		}
	});
}
async function totalBoulpik(strFecha) {
	//get Total Here...
	let message = "";
	return BoulpikNumbers.find({ end: strFecha }, function (err, user) {
		if (err) {
			return { data: {}, success: false, message: err };
		} else {
			if (user.length == 1) {
				//const _Boulpik = user[0].Boulpik;
				const _Boulpik = user[0].total;
				//console.log("Users : ", _Boulpik.length);
				return { data: _Boulpik, success: true, message: "0501" };
				//return { data: _Boulpik.length, success: true, message: "0501" };
			}
		}
	});
}

async function PrimesBoulpikWins(strFecha) {
	const _ObjBoulpik = await totalBoulpik(strFecha);
	console.log("_ObjBoulpik : ", _ObjBoulpik);
	if (_ObjBoulpik.length == 1) {
		//console.log("_ObjBoulpik : ", _ObjBoulpik);
		const _totalBoulpik = _ObjBoulpik[0].total;
		//const lengthBoulpik = _totalBoulpik.length;
		const lengthBoulpik = _totalBoulpik;
		//const _totalBoulpik = _ObjBoulpik[0].Boulpik;
		//const lengthBoulpik = _totalBoulpik.length;
		//console.log("lengthBoulpik : ", lengthBoulpik);
		const PriceBoulPik = await ServicesGenerateNumber.getPriceBoulpikPorTirage(strFecha);
		//console.log("PriceBoulPik : ", PriceBoulPik);
		var totalRecharge = lengthBoulpik * PriceBoulPik.price;
		console.log("totalRecharge : ", totalRecharge);

		const ObjPrime = await findPrimeBoulPik();
		console.log("ObjPrime : ", ObjPrime);
		const TotalEffectif = PriceBoulPik.initial * 1;

		var one = totalRecharge * ObjPrime[0].one;
		var two = totalRecharge * ObjPrime[0].two;
		var three = totalRecharge * ObjPrime[0].three;
		var four = totalRecharge * ObjPrime[0].four;
		var five = totalRecharge * ObjPrime[0].five;

		const total = one + two + three + four + five;
		console.log("Total : ", total);
		one = one / 100;
		one += TotalEffectif * ObjPrime[0].one * 1;
		two = two / 100;
		two += TotalEffectif * ObjPrime[0].two * 1;
		three = three / 100;
		three += TotalEffectif * ObjPrime[0].three * 1;
		four = four / 100;
		four += TotalEffectif * ObjPrime[0].four * 1;
		five = five / 100;
		five += TotalEffectif * ObjPrime[0].five * 1;
		console.log("One : ", one);

		//console.log("Prime : ", ObjPrime);
		//console.log("total : ", total);
		return {
			data: {
				arrayPosicion: [
					{ place: "One", total: one },
					{ place: "Two", total: two },
					{ place: "Three", total: three },
					{ place: "Four", total: four },
					{ place: "Five", total: five },
				],
				TotalDistribue: total / 100,
				TotalRecharge: totalRecharge,
			},
		};
	} else {
		return {
			data: {
				arrayPosicion: [
					{ place: "One", total: 0 },
					{ place: "Two", total: 0 },
					{ place: "Three", total: 0 },
					{ place: "Four", total: 0 },
					{ place: "Five", total: 0 },
				],
				TotalDistribue: total / 100,
				TotalRecharge: totalRecharge,
			},
		};
	}
}
exports.ListPrimeBoulpik = async function (req, res) {
	var TirageActual = await BoulpikNumbers.find({ etat: 1 }); //.sort([["created", 1]]);
	//console.log("TirageActual : ", TirageActual);
	var end;
	var data = [];
	if (TirageActual.length > 0) {
		for (let i = 0; i < TirageActual.length; i++) {
			var objUser = {};

			end = TirageActual[i].end;
			objUser = Object.assign({}, { end });
			data[i] = objUser;
		}
		//console.log("data : ", data);
		const parsedArray = data.map((item) => {
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
		//console.log("_ObjBoulpik : ", _ObjBoulpik);
		const _totalBoulpik = _ObjBoulpik[0].total;
		//const lengthBoulpik = _totalBoulpik.length;
		const lengthBoulpik = _totalBoulpik;

		const TotalEffectif = _ObjBoulpik[0].initial * 1;

		console.log("TotalEffectif : ", TotalEffectif);

		const PriceBoulPik = 25; //ServicesGenerateNumber.getPriceBoulpikPorTirage(end);
		var totalRecharge = lengthBoulpik * PriceBoulPik;
		const ObjPrime = await findPrimeBoulPik();
		const one = Math.round((totalRecharge * ObjPrime[0].one) / 100);
		const two = Math.round((totalRecharge * ObjPrime[0].two) / 100);
		const three = Math.round((totalRecharge * ObjPrime[0].three) / 100);
		const four = Math.round((totalRecharge * ObjPrime[0].four) / 100);
		const five = Math.round((totalRecharge * ObjPrime[0].five) / 100);

		const TotalRecharge = totalRecharge;
		const first = TotalEffectif * 0.5;
		console.log("first : ", first);
		const second = TotalEffectif * 0.2;
		const third = TotalEffectif * 0.15;
		const _four = TotalEffectif * 0.1;
		const _five = TotalEffectif * 0.05;

		const totalShare = one + two + three + four + five;

		res.json({
			data: {
				arrayPosicion: [
					{ place: "One", prize: one + first },
					{ place: "Two", prize: two + second },
					{ place: "Three", prize: three + third },
					{ place: "Four", prize: four + _four },
					{ place: "Five", prize: five + _five },
				],
				fecha,
				TotalRecharge,
				totalShare,
			},
			success: true,
			message: "0501",
		});
	} else {
		res.json({
			data: {
				arrayPosicion: [],
			},
			success: true,
			message: "0501",
		});
	}
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
			countWinners: countWinners,
		});
	}

	return arrayWinners;
}

exports.DynamicTirage = async function (req, res) {
	console.log("heloo");
	const fechaTirage = req.body.fecha;
	const _ObjBoulpik = await totalBoulpik(fechaTirage);
	console.log("_ObjBoulpik : ", _ObjBoulpik);
	if (_ObjBoulpik.length == 1) {
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
		console.log("_primeWinners : ", _primeWinners);
		const _setWinners = await setWinners(OldarrayList, _primeWinners);

		await ServicesSearch.setArrayWinners(_setWinners, fechaTirage);
		await ServicesTirage.payClient(fechaTirage);

		//console.log("Set : ", _setWinners);

		res.json({ data: _setWinners });
	} else {
		res.json({ data: "eroor" });
	}
};
exports.addBoulpikCarrito = async function (req, res) {
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

	//console.log("totalHaveInDatePayed : ", totalHaveInDatePayed);
	//console.log("totalHaveInDate : ", totalHaveInDate);

	const CondicionSecure = totalHaveInDate + totalHaveInDatePayed;

	if (CondicionSecure < 30) {
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

exports.deleteBoulpikCarrito = async function (req, res) {
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
			if (carrito[i].boulpik == req.body.boulpik && carrito[i].fecha == req.body.fecha) carrito.splice(i, 1);
		}

		var _deleteBoulpikCart = await ServicesGenerateNumber.updateBoulpikCart(idUser, carrito);
		return res.json({ data: carrito, success: true, message: "0501" });
	} else {
		return res.json({ data: {}, success: false, message: "0205" });
	}

	//console.log("carrito : ", carrito);

	//console.log("_dataInfo : ", _dataInfo);
};

exports.BalanceUsers = async function (req, res) {
	let message = "";
	var _dataInfo = {};
	User.findById(req.params.userId, async function (err, user) {
		if (err) {
			res.json({ data: err, success: false, message: "0401" });
		} else {
			res.json({ data: user.credit, success: true, message: "0501" });
		}
	});
};

exports.priceBoulpiks = async function (req, res) {
	let message = "";

	const _ObjBoulpik = await totalBoulpik();
	const _priceBoulpik = _ObjBoulpik[0].price;
	res.json({ data: _priceBoulpik, success: true, message: "0501" });
};

exports.sendMail = async function (req, res) {
	var result = await Servicesmessage.sendEmail(req.body.email);
	return res.json({ data: result, success: true, message: "0501" });
	//console.log("result : ", result);
};

exports.sendMailToSupport = async function (req, res) {
	var result = await Servicesmessage.sendEmailToSupport(req.body.body, req.body.subject);
	return res.json({ data: result, success: true, message: "0501" });
	//console.log("result : ", result);
};

exports.sendSMS = async function (req, res) {
	var result = await Servicesmessage.sendSMS(req.body.phone);
	return res.json({ data: result, success: true, message: "0501" });
	//console.log("result : ", result);
};

exports.payWinners = async function (req, res) {
	var result = await ServicesTirage.payClient(req.body.fecha);
	return res.json({ data: result, success: true, message: "0501" });
	//console.log("result : ", result);
};

async function getOldArrayNumber() {
	return BoulpikNumbers.find({}, function (err, objArray) {
		if (err) {
			return err;
		} else {
			return objArray;
		}
	});
}

exports.GenerateArrayBoulpik = async function (req, res) {
	if (!req.headers.authorization) {
		//let message = "TokenMissing";
		//return res.status(401).send({ error: 'TokenMissing' });
		return res.json({ data: {}, success: false, message: "0002" });
	}

	var token = req.headers.authorization.split(" ")[1];
	var value = await ServicesAuth.getUsersByToken(token);

	//let message = "";
	var arrayNumbers = req.body.arrayNumber;

	var lenArray = arrayNumbers.length;
	const _price = 25;

	const balanceUser = await ServicesSearch.getBalanceById(value._id);
	const _size = lenArray * _price * 1;
	var totalPrice = 0;
	for (let i = 0; i < lenArray; i++) {
		totalPrice += arrayNumbers[i].price;
	}
	console.log("totalPrice : ", totalPrice);

	if (balanceUser >= totalPrice) {
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
				const _totalBoulpik = await ServicesGenerateNumber.getTotalBoulpik(fecha);
				//console.log("pastTotal : ", _totalBoulpik);

				//Set total Here
				await ServicesGenerateNumber.setTotalBoulpik(fecha, _totalBoulpik);

				var obj = Object.assign({ boulpik: boulpik, fecha: fecha, idUser: idUser });

				var number = await ServicesGenerateNumber.GenerateNumber(obj);

				await ServicesSearch.setCartUserNull(obj.idUser, arrayNumbers);
				await ServicesSearch.setBalanceById(idUser, arrayNumbers[i].price);
			}
		}
		var credit = balanceUser - totalPrice;
		/* Define Variable Transaction */
		const genre = "Boulpik";
		const idenvoyeur = value._id;
		const envoyeur = value.nom;
		const envfonction = value.role;
		const balance = totalPrice;
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

exports.getFiveHistoryTirage = async function (req, res) {
	if (!req.headers.authorization) {
		return res.json({ data: {}, success: false, message: "0002" });
	}

	var token = req.headers.authorization.split(" ")[1];
	var user = await ServicesAuth.getUsersByToken(token);

	var result = await ServicesSearch.lastFiveBoulpikTirage(user._id);
	//const userBoulpik = await ServicesSearch.arrayUser(user._id);
	//console.log("boulpik : ", userBoulpik);
	//res.json({ data: { result, userBoulpik }, success: true, message: "0501" });

	res.json({ data: result, success: true, message: "0501" });
};
exports.services = async function (req, res) {
	if (!req.headers.authorization) {
		return res.json({ data: {}, success: false, message: "0002" });
	}

	var token = req.headers.authorization.split(" ")[1];
	var user = await ServicesAuth.getUsersByToken(token);

	res.json({ data: "", success: true, message: "0501" });
};

exports.getBoulpikPorTirage = async function (req, res) {
	let message = "";

	const _data = await BoulpikNumbers.find({ end: req.body.fecha });

	const parsedArray = _data.map((item) => {
		const numbers = item.end.split("/");
		const year = parseInt(numbers[2]);
		const month = parseInt(numbers[1]);
		const day = parseInt(numbers[0]);
		const parsedDate = new Date(year, month - 1, day);

		return { ...item, parsedDate };
	});

	// async function(err, user) {
	// 	if (err) {
	// 		res.json({ data: "", success: false, message: "0401" });
	// 	} else {
	res.json({ data: parsedArray, success: true, message: "0501" });
	//}
	// };
};

exports.transactions = async function (req, res) {
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
		const genre = "Transfer";
		const receveur = _User.nom;
		const recfonction = _User.role;
		const balance = req.body.balance;

		if (value.credit * 1 >= balance) {
			await ServicesSearch.setBalanceById(idenvoyeur, balance);

			await ServicesSearch.upBalanceById(idreceveur, balance);
			const _credit = value.credit * 1 - balance;
			var objTransaction = Object.assign(
				{},
				{ idenvoyeur, envoyeur, envfonction, receveur, recfonction, genre: genre, idreceveur, balance, credit: _credit }
			);

			//console.log("Transaction : ", objTransaction);

			await ServicesSearch.createTransaction(objTransaction);
			await Servicesmessage.addSenderMessageUsersTransferCredit(objTransaction);
			await Servicesmessage.addReceiverMessageUsersTransferCredit(objTransaction);

			// let specificSocket = lodash.find(global.logTable, { userId: userId });

			// if (specificSocket !== undefined) {
			// 	global.io.to(specificSocket.socketId).emit("receiveBalance", credit);
			// }

			return res.json({ data: objTransaction, success: true, message: "0501" });
		} else {
			return res.json({ data: {}, success: false, message: "0300" });
		}
	} else {
		return res.json({ data: {}, success: false, message: "0211" });
	}
};
exports.transactions_all = async function (req, res) {
	let message = "";
	Transaction.find({}, function (err, transactions) {
		if (err) {
			res.json({ data: {}, success: false, message: err });
		} else {
			res.json({ data: transactions, success: true, message: "0501" });
		}
	});
};

exports.my_transaction_users = async function (req, res) {
	if (!req.headers.authorization) {
		let message = "TokenMissing";
		//return res.status(401).send({ error: 'TokenMissing' });
		return res.json({ data: {}, success: false, message: "0002" });
	}
	var token = req.headers.authorization.split(" ")[1];
	var value = await ServicesAuth.getUsersByToken(token);

	const userId = value._id;
	//console.log("userId : ", userId);

	var objTransactions = await ServicesSearch.searchUsersTransactions(userId);
	//console.log("objTransactions : ", objTransactions);
	res.json({ data: objTransactions, success: true, message: "0501" });
};

exports.see_transaction_users = async function (req, res) {
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

exports.createTirage = async function (req, res) {
	//console.log("Receive data : ", req.body);
	//var dateTime = await getDateNow();
	var dateTime = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

	var objBoulpikTirage = Object.assign(
		{},
		{
			Boulpik: [],
			start: dateTime,
			price: req.body.price,
			initial: req.body.initial,
			end: req.body.end,
			arrayWinner: [],
		}
	);
	var new_boulpik = new BoulpikNumbers(objBoulpikTirage);
	return new_boulpik.save(async function (err, boulpik) {
		if (err) {
			res.json({ data: "", success: false, message: err });
		} else {
			await Servicesmessage.addMessageUsersNewDraw(objBoulpikTirage);
			res.json({ data: boulpik, success: true, message: "0501" });
		}
	});
};

exports.testmessage = async function (req, res) {
	var objBoulpikTirage = {};
	await Servicesmessage.addMessageUsersNewDraw(objBoulpikTirage);
};

exports.mySonTransactions = async function (req, res) {
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

exports.monCash = async function (req, res) {
	let limit = 10;
	let limitHash = 6;
	//global.userId = req.headers.userid;

	let arr = "";
	let hash = "";
	for (var i = 0; i < limit; i++) {
		arr = arr + "" + getRandomInt(0, 10);
	}

	for (var i = 0; i < limitHash; i++) {
		hash = hash + "" + getRandomInt(0, 10);
	}

	var create_payment_json = {
		amount: req.body.amount,
		orderId: arr,
	};

	var payment_creator = moncash.payment;

	//console.log("payment_creator : ", payment_creator);

	//console.log("create_payment_json : ", create_payment_json);

	payment_creator.create(create_payment_json, async function (error, payment) {
		if (error) {
			res.json({ data: {}, success: false, message: error });
		} else {
			var objTransaction = Object.assign(
				{},
				{
					amount: req.body.amount,
					orderId: create_payment_json.orderId,
					userId: req.headers.userid,
					hash: hash,
				}
			);
			await ServicesUser.createMoncashTransaction(objTransaction);
			const url = payment_creator.redirect_uri(payment);
			//res.redirect(url);
			//console.log("le url : ", url);

			res.json({ data: url, success: true, message: "0501" });
		}
	});
};

exports.return = async function (req, res) {
	//console.log("return Url Req : ", req);

	moncash.capture.getByTransactionId(req.query.transactionId, async function (error, capture) {
		//console.log("capture : ", capture);
		if (error) {
			console.error(error);
		} else {
			//console.log("objTransaction : ", objTransaction);
			//global.userId = "";

			let userMonCashRequest = await ServicesUser.getTransactionRequestByOrderId(capture.payment.reference);

			//	console.log("userMonCashRequest : ", userMonCashRequest);

			const userId = userMonCashRequest.userId;
			const transaction = await ServicesUser.updateUserTransactionMoncash(userId, capture.payment);

			let specificSocket = lodash.find(global.logTable, { userId: userId });
			console.log("capture.payment : ", capture.payment.cost);
			//global.io.to(specificSocket.socketId).emit("Update", "Wey Ta Sirviendo");
			if (specificSocket !== undefined) {
				global.io
					.to(specificSocket.socketId)
					.emit("updateTransaction", { credit: capture.payment.cost * 1, transaction });

				//console.log(capture);
			}
			res.json("SUCCESS");

			//res.redirect("www.boulpikdigital.com");
		}
	});
};

exports.createVendeur = async function (req, res) {
	const objDetaillants = Object.assign(
		{},
		{
			nom: req.body.nom,
			ville: req.body.ville,
			email: req.body.email,
			zone: req.body.zone,
			address: req.body.address,

			tel: req.body.tel,
			role: "Detaillants",
			motDePasse: req.body.motDePasse,
		}
	);
	/////////
	var new_user = new User(objDetaillants);
	var _numero_compte = await ServicesGenerate.GenerateNumber();
	var numero_compte = _numero_compte.data;

	////////

	new_user.save(async function (err, user) {
		if (err) {
			if (err.code == "11000") {
				res.json({ data: {}, success: false, message: "0007" });
			} else {
				res.json({ data: {}, success: false, message: "0707" });
			}
		} else {
			var token = jwt.sign({ sub: user._id, role: "User" }, config.secret, {
				expiresIn: 1200000000000, // expires in 20 minutes
			});

			const dataInfo = await createDetaillants_no_token(token, user._id, req.body.nom, req.body.ville, numero_compte);
			res.json({
				data: {
					user,
					token,
				},
				success: true,
				message: "0501",
			});
		}
	});
};

exports.changePasswordPin = async function (req, res) {
	const tel = req.body.tel;
	const pin = req.body.pin;
	const newMotDePasse = req.body.password;
	var data = await ServicesSearch.getPinByTel(tel);
	var user = data.user;

	if (data.user) {
		if (pin == data.user.pin) {
			var passwordset = await ServicesSearch.setPasswordUser(data._id, newMotDePasse);
			var token = jwt.sign({ sub: data._id, role: data.role }, config.secret, {
				expiresIn: 1200000000000, // expires in 20 minutes
			});
			const boulpik = await ServicesSearch.searchBoulpikUsers(data.user._id);

			//objUsers = Object.assign({}, { PersoInfo: user, dataInfo: dataInfo });

			res.json({
				data: {
					user,
					token,

					boulpik,
				},
				success: true,
				message: "0501",
			});
		} else {
			res.json({ data: {}, success: false, message: "0010" });
		}
	} else {
		res.json({ data: {}, success: false, message: "0211" });
	}
};

exports.changePasswordCode = async function (req, res) {
	const code = req.body.code;
	const email = req.body.email;
	const newMotDePasse = req.body.password;

	console.log("Email : ", email);
	var data = await ServicesSearch.verifyemail(email);

	console.log("data : ", data);
	var token = data.resetPasswordToken;
	if (jwt.decode(token).exp < Date.now() / 1000) {
		if (data) {
			if (code == data.code) {
				var passwordset = await ServicesSearch.setPasswordUser(data._id, newMotDePasse);
				var token = jwt.sign({ sub: data._id, role: data.role }, config.secret, {
					expiresIn: 1200000000000, // expires in 20 minutes
				});
				const boulpik = await ServicesSearch.searchBoulpikUsers(data.user._id);

				//objUsers = Object.assign({}, { PersoInfo: user, dataInfo: dataInfo });

				res.json({
					data: {
						user,
						token,

						boulpik,
					},
					success: true,
					message: "0501",
				});
			} else {
				res.json({ data: {}, success: false, message: "0010" });
			}
		} else {
			res.json({ data: {}, success: false, message: "0211" });
		}
	} else {
		res.json({ data: {}, success: false, message: "0211" });
	}
};

exports.verifyTel = async function (req, res) {
	const tel = req.body.tel;

	var data = await ServicesSearch.getPinByTel(tel);
	var user = data.user;

	if (data.user) {
		res.json({ data: data.user.tel, success: true, message: "0501" });
	} else {
		res.json({ data: {}, success: false, message: "0211" });
	}
};
exports.verifyTelEmail = async function (req, res) {
	const email = req.body.email;

	var isnum = /^\d+$/.test(email);

	if (isnum) {
		var data = await ServicesSearch.getPinByTel(email);

		if (data.user) {
			res.json({ data: {}, success: true, message: "0501" });
		} else {
			res.json({ data: {}, success: false, message: "0211" });
		}
	} else {
		var data = await ServicesSearch.verifyemail(email);
		var user = data;

		const code = await ServicesGenerate.GenerateCode();
		var token = jwt.sign({ sub: user._id, role: user.role }, config.secret, {
			expiresIn: 600, // expires in 10 mn
		});

		var sendCode = await ServicesSearch._sendMail(user.email, code);

		if (sendCode) {
			var setCodeAndToken = await ServicesSearch.sendToCodeToEmail(user._id, token, code);
			res.json({ data: {}, success: true, message: "0501" });
		} else {
			res.json({ data: {}, success: false, message: "0211" });
		}
	}
};

exports.verifyTelEmailPin = async function (req, res) {
	const email = req.body.email;
	const pin = req.body.pin;

	var data = await ServicesSearch.verifyEmailTelPin(email, pin);
	res.json({ data: {}, success: data, message: "0501" });
};

exports.updatePassword = async function (req, res) {
	const email = req.body.email;
	const password = req.body.password;
	var data = await ServicesSearch.updatePassword(email, password);
	if (data) {
		res.json({ data: data, success: true, message: "0501" });
	} else {
		res.json({ data: {}, success: false, message: "0211" });
	}
};

exports.resetPassWordEmail = async function (req, res) {
	const email = req.body.email;

	var data = await ServicesSearch.verifyemail(email);
	var user = data;

	const code = await ServicesGenerate.GenerateCode();
	var token = jwt.sign({ sub: user._id, role: user.role }, config.secret, {
		expiresIn: 600, // expires in 10 mn
	});

	var sendCode = await ServicesSearch._sendMail(user.email, code);

	if (sendCode) {
		var setCodeAndToken = await ServicesSearch.sendToCodeToEmail(user._id, token, code);
		res.json({ data: sendCode, success: true, message: "0501" });
	} else {
		res.json({ data: {}, success: false, message: "0211" });
	}
};

exports.delete_a_message = async function (req, res) {
	let message = {};
	if (!req.headers.authorization) {
		let message = "TokenMissing";

		return res.json({ data: {}, success: false, message: "0002" });
	}

	// var token = req.headers.authorization.split(" ")[1];
	// var value = await ServicesAuth.getUsersByToken(token);
	// var idUser = value._id;
	console.log("userId : ", req.headers.userid);
	var user = await ServicesSearch.searchUsersByID(req.headers.userid);
	console.log("user : ", user);

	var arrMessage = user.message;

	for (var i = 0; i < arrMessage.length; i++) {
		if (arrMessage[i]._id == req.body._id) {
			arrMessage.splice(i, 1);
		}
	}

	console.log("arrMessage : ", arrMessage);

	var _deleteBoulpikCart = await ServicesGenerateNumber.updateMessageUsers(req.headers.userid, arrMessage);

	return res.json({ data: arrMessage, success: true, message: "0501" });
};

exports.read_a_message = async function (req, res) {
	let message = {};
	if (!req.headers.authorization) {
		let message = "TokenMissing";

		return res.json({ data: {}, success: false, message: "0002" });
	}

	var token = req.headers.authorization.split(" ")[1];
	var value = await ServicesAuth.getUsersByToken(token);
	var idUser = value._id;
	var arrMessage = await ServicesSearch.read_a_message(idUser, req.params.messageId);

	return res.json({ data: arrMessage, success: true, message: "0501" });
};

exports.requestTestTransactions = async function (req, res) {
	var item = req.body;

	return res.json({ data: item, success: true, message: "0501" });
};

exports.manitoksDeveloper = async function (req, res) {
	var url = "https://mannitoks.com/secure/developer/";

	var data = {
		action: "_cashout",
		token: "_boulpik",
		cashoutId: "cje2568",
		user_fname: "John",
		user_lname: "Doe",
		amount_htg: "120.00",
		phone_number: "50942739456",
		company_name: "moncash",
		status: "",
	};

	let response = await axios.post(url, data);
	console.log("response : ", response);

	return res.json({ data: response.data, success: true, message: "0501" });
};

exports.userCreateInfo = async function (req, res) {
	//var url = "https://mannitoks.com/secure/developer/";

	const distributeurs = await User.collection.count({ role: "Distributeurs" });
	const vendeur = await UsersDetaillants.collection.count();
	const joueurs = await UserNormal.collection.count();

	//console.log("distributeurs : ", distributeurs);

	return res.json({ data: { distributeurs, vendeur, joueurs }, success: true, message: "0501" });
};

exports.countBoulpikPlayByTirage = async function (req, res) {
	const tirage = req.params.tirage;

	var strTirage = "";

	for (let i = 0; i < 8; i++) {
		strTirage += tirage[i];

		if (i % 2 !== 0 && i < 4) {
			strTirage += "/";
		}
	}

	const totalBoulpik = await BoulpikNumbers.findOne({ end: strTirage });

	return res.json({ data: { totalBoulpikJouer: totalBoulpik.total }, success: true, message: "0501" });
};
