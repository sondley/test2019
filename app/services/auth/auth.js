const expressJwt = require("express-jwt");
const { secret } = require("../../../config");
const jwt = require("jsonwebtoken");
var mongoose = require("mongoose"),
	User = mongoose.model("Userslottos");
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
	ensureAuthenticated,
	Users,
	Admins,
	Detaillants,
	Distributeurs,
	SuperAdmins,
	getUsersByToken
};

function ensureAuthenticated(req, res, next) {
	if (!req.headers.authorization) {
		let message = "TokenMissing";
		//return res.status(401).send({ error: 'TokenMissing' });
		return res.json({ data: {}, success: false, message: message });
	}
	var token = req.headers.authorization.split(" ")[1];

	var payload = null;
	try {
		payload = jwt.decode(token, secret);
	} catch (err) {
		let message = "TokenInvalid";
		return res.json({ data: {}, success: false, message: message });
		//return res.status(401).send({ error: "TokenInvalid" });
	}

	if (payload.exp <= moment().unix()) {
		let message = "TokenExpired";
		return res.json({ data: {}, success: false, message: message });
		//return res.status(401).send({ error: 'TokenExpired' });
	}
	// check if the user exists
	User.findById(payload.sub, function(err, person) {
		if (!person) {
			let message = "PersonNotFound";
			return res.json({ data: {}, success: false, message: message });
			//return res.status(401).send({error: 'PersonNotFound'});
		} else {
			if (person._id == payload.sub) next();
		}
	});
}

async function getUsersByToken(strToken) {
	var token = strToken;
	var payload = null;
	try {
		payload = jwt.decode(token, secret);
	} catch (err) {
		let message = "TokenInvalid";
		return { data: {}, success: false, message: message };
	}

	if (payload.exp <= moment().unix()) {
		let message = "TokenExpired";
		return { data: {}, success: false, message: message };
	}
	// check if the user exists
	return User.findById(payload.sub, function(err, person) {
		if (!person) {
			let message = "PersonNotFound";
			return { data: err, success: false, message: message };
			//return res.status(401).send({error: 'PersonNotFound'});
		} else {
			console.log(" aqui ");
			return { data: person, success: true, message: "" };
		}
	});
}

function Users(req, res, next) {
	if (!req.headers.authorization) {
		let message = "TokenMissing";
		//return res.status(401).send({ error: 'TokenMissing' });
		return res.json({ data: {}, success: false, message: message });
	}
	var token = req.headers.authorization.split(" ")[1];

	var payload = null;
	try {
		payload = jwt.decode(token, secret);
	} catch (err) {
		let message = "TokenInvalid";
		return res.json({ data: {}, success: false, message: message });
	}

	if (payload.exp <= moment().unix()) {
		let message = "TokenExpired";
		return res.json({ data: {}, success: false, message: message });
	}
	// check if the user exists
	User.findById(payload.sub, function(err, person) {
		if (!person) {
			let message = "PersonNotFound";
			return res.json({ data: {}, success: false, message: message });
			//return res.status(401).send({error: 'PersonNotFound'});
		} else {
			if ((person._id == payload.sub && person.role == "User") || person.role == "Admin") next();
			else {
				let message = "No Acess to this route";
				return res.json({ data: {}, success: false, message: message });
				//return res.status(201).send({ error: 'No Acess to this route' });
			}
		}
	});
}

function Admins(req, res, next) {
	if (!req.headers.authorization) {
		let message = "TokenMissing";
		return res.json({ data: {}, success: false, message: message });
		//return res.status(401).send({ error: 'TokenMissing' });
	}
	var token = req.headers.authorization.split(" ")[1];

	var payload = null;
	try {
		payload = jwt.decode(token, secret);
	} catch (err) {
		let message = "TokenInvalid";
		return res.json({ data: {}, success: false, message: message });
		//return res.status(401).send({ error: "TokenInvalid" });
	}

	if (payload.exp <= moment().unix()) {
		let message = "TokenExpired";
		return res.json({ data: {}, success: false, message: message });
		//return res.status(401).send({ error: 'TokenExpired' });
	}
	// check if the user exists
	User.findById(payload.sub, function(err, person) {
		if (!person) {
			let message = "PersonNotFound";
			return res.json({ data: {}, success: false, message: message });
			//return res.status(401).send({error: 'PersonNotFound'});
		} else {
			if ((person._id == payload.sub && person.role == "Super") || person.role == "Admin") next();
			else {
				let message = "No Acess to this route";
				return res.json({ data: {}, success: false, message: message });
				//return res.status(201).send({ error: 'No Acess to this route' });
			}
		}
	});
}

function Detaillants(req, res, next) {
	if (!req.headers.authorization) {
		let message = "TokenMissing";
		//return res.status(401).send({ error: 'TokenMissing' });
		return res.json({ data: {}, success: false, message: message });
	}
	var token = req.headers.authorization.split(" ")[1];

	var payload = null;
	try {
		payload = jwt.decode(token, secret);
	} catch (err) {
		let message = "TokenInvalid";
		return res.json({ data: {}, success: false, message: message });
	}

	if (payload.exp <= moment().unix()) {
		let message = "TokenExpired";
		return res.json({ data: {}, success: false, message: message });
	}
	// check if the user exists
	User.findById(payload.sub, function(err, person) {
		if (!person) {
			let message = "PersonNotFound";
			return res.json({ data: {}, success: false, message: message });
			//return res.status(401).send({error: 'PersonNotFound'});
		} else {
			if (
				(person._id == payload.sub && person.role == "Detaillants") ||
				person.role == "Admin" ||
				person.role == "Super"
			)
				next();
			else {
				let message = "No Acess to this route";
				return res.json({ data: {}, success: false, message: message });
				//return res.status(201).send({ error: 'No Acess to this route' });
			}
		}
	});
}

function SuperAdmins(req, res, next) {
	//console.log("Super Admin");
	if (!req.headers.authorization) {
		let message = "TokenMissing";
		//return res.status(401).send({ error: 'TokenMissing' });
		return res.json({ data: {}, success: false, message: message });
	}
	var token = req.headers.authorization.split(" ")[1];

	var payload = null;
	try {
		payload = jwt.decode(token, secret);
	} catch (err) {
		let message = "TokenInvalid";
		return res.json({ data: {}, success: false, message: message });
	}

	if (payload.exp <= moment().unix()) {
		let message = "TokenExpired";
		return res.json({ data: {}, success: false, message: message });
	}
	// check if the user exists
	User.findById(payload.sub, function(err, person) {
		if (!person) {
			let message = "PersonNotFound";
			return res.json({ data: {}, success: false, message: message });
			//return res.status(401).send({error: 'PersonNotFound'});
		} else {
			if (person._id == payload.sub && person.role == "Super") next();
			else {
				let message = "No Acess to this route";
				return res.json({ data: {}, success: false, message: message });
				//return res.status(201).send({ error: 'No Acess to this route' });
			}
		}
	});
}

function Distributeurs(req, res, next) {
	if (!req.headers.authorization) {
		let message = "TokenMissing";
		//return res.status(401).send({ error: 'TokenMissing' });
		return res.json({ data: {}, success: false, message: message });
	}
	var token = req.headers.authorization.split(" ")[1];

	var payload = null;
	try {
		payload = jwt.decode(token, secret);
	} catch (err) {
		let message = "TokenInvalid";
		return res.json({ data: {}, success: false, message: message });
	}

	if (payload.exp <= moment().unix()) {
		let message = "TokenExpired";
		return res.json({ data: {}, success: false, message: message });
	}
	// check if the user exists
	User.findById(payload.sub, function(err, person) {
		if (!person) {
			let message = "PersonNotFound";
			return res.json({ data: {}, success: false, message: message });
			//return res.status(401).send({error: 'PersonNotFound'});
		} else {
			if (
				(person._id == payload.sub && person.role == "Distributeurs") ||
				person.role == "Admin" ||
				person.role == "Super"
			)
				next();
			else {
				let message = "No Acess to this route";
				return res.json({ data: {}, success: false, message: message });
				//return res.status(201).send({ error: 'No Acess to this route' });
			}
		}
	});
}
