var mongoose = require("mongoose");
require("mongoose-double")(mongoose);
var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;

// set up a mongoose model
module.exports = mongoose.model(
	"Eznas",
	new Schema({
		nom: {
			type: String,
			required: true,
		},

		tel: {
			type: String,
			default: "",
			unique: true,
		},
		email: {
			type: String,

			trim: true,
			lowercase: true,
			match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please fill a valid email address"],
		},

		etat: {
			type: String,
			default: "1",
		},
		zone: {
			type: String,
		},
		address: {
			type: String,
		},
		ville: {
			type: String,
		},

		created: {
			type: Date,
			default: Date.now,
		},
	})
);
