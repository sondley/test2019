var mongoose = require("mongoose");
require("mongoose-double")(mongoose);
var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;

// set up a mongoose model
module.exports = mongoose.model(
	"UsersDetaillants",
	new Schema({
		idUsersLottos: {
			type: String,
			required: true
		},
		numero_compte: {
			type: String
		},
		idCreateur: {
			type: String
		},

		createur: {
			type: String
		},
		zone: {
			type: String
		},
		tel: {
			type: String
		},

		adress: {
			type: String
		},

		nom: {
			type: String,
			required: true
		},
		ville: {
			type: String
		},

		created: {
			type: Date,
			default: Date.now
		}
	})
);
