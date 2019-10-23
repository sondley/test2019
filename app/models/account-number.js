var mongoose = require("mongoose");
require("mongoose-double")(mongoose);
var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;

// set up a mongoose model
module.exports = mongoose.model(
	"AccountNumbers",
	new Schema({
		fecha: {
			type: String
		},
		Account: [],

		created: {
			type: Date,
			default: Date.now
		}
	})
);
