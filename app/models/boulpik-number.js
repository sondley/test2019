var mongoose = require("mongoose");
require("mongoose-double")(mongoose);
var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;

// set up a mongoose model
module.exports = mongoose.model(
	"BoulpikNumbers",
	new Schema({
		Boulpik: [],

		created: {
			type: Date,
			default: Date.now
		}
	})
);
