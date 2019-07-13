var mongoose = require("mongoose");
require("mongoose-double")(mongoose);
var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;

// set up a mongoose model
module.exports = mongoose.model(
	"UsersClients",
	new Schema({
		idUsersLottos: {
			type: String,
			required: true
		},
		nom: {
			type: String,
			required: true
		},
		carrito: [],

		accountId: {
			type: String
		},
		ville: {
			type: String,
			required: true
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
