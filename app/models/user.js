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
		surnom: {
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

			trim: true,
			lowercase: true,
			match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please fill a valid email address"]
		},
		motDePasse: {
			type: String,
			required: true
		},
		pin: {
			type: String
		},
		salt: {
			type: String
		},

		etat: {
			type: String,
			default: "1"
		},
		credit: {
			type: SchemaTypes.Number,
			min: 0,
			default: 1000
		},
		created: {
			type: Date,
			default: Date.now
		}
	})
);
