var mongoose = require("mongoose");
require("mongoose-double")(mongoose);
var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;

// set up a mongoose model
module.exports = mongoose.model(
	"TransactionMoncash",
	new Schema({
		orderId: {
			type: String,
		},
		userId: {
			type: String,
		},

		hash: {
			type: String,
		},
		amount: {
			type: Number,
		},

		etat: {
			type: String,
			default: "1",
		},

		created: {
			type: Date,
			default: Date.now,
		},
	})
);
