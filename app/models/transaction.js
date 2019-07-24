var mongoose = require("mongoose");
require("mongoose-double")(mongoose);
var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;

// set up a mongoose model
module.exports = mongoose.model(
	"TransactionsBoulpiks",
	new Schema({
		envoyeur: {
			type: String
		},
		idenvoyeur: {
			type: String
		},
		envfonction: {
			type: String
		},
		idreceveur: {
			type: String
		},
		receveur: {
			type: String
		},
		recfonction: {
			type: String
		},
		balance: {
			type: String
		},
		etat: {
			type: String,
			default: "1"
		},

		created: {
			type: Date,
			default: Date.now
		}
	})
);
