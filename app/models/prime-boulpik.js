var mongoose = require("mongoose");
require("mongoose-double")(mongoose);
var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;

// set up a mongoose model
module.exports = mongoose.model(
	"PrimesBoulpiks",
	new Schema({
		one: {
			type: SchemaTypes.Double,
			required: true
		},
		two: {
			type: SchemaTypes.Double,
			required: true
		},
		three: {
			type: SchemaTypes.Double,
			required: true
		},
		four: {
			type: SchemaTypes.Double,
			required: true
		},
		five: {
			type: SchemaTypes.Double,
			required: true
		},

		created: {
			type: Date,
			default: Date.now
		}
	})
);
