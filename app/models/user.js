var mongoose = require("mongoose");
require("mongoose-double")(mongoose);
var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;

// set up a mongoose model
module.exports = mongoose.model(
	"Userslottos",
	new Schema({
		nom: {
			type: String,
			required: true
		},
		role: {
			type: String,
			default: "User"
		},
		tel: {
			type: String,
			default: "",
			unique: true
		},
		email: {
			type: String,
			unique: true,
			type: String,
			trim: true,
			lowercase: true,
			match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please fill a valid email address"]
		},
		motDePasse: {
			type: String,
			required: true
		},

		etat: {
			type: String,
			default: "1"
		},
		credit: {
			type: SchemaTypes.Double,
			min: 0,
			default: 0
		},
		created: {
			type: Date,
			default: Date.now
		}
	})
);
