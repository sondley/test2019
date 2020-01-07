var mongoose = require("mongoose");
require("mongoose-double")(mongoose);
var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;

// set up a mongoose model
module.exports = mongoose.model(
	"City",
	new Schema({
		nom: {
			type: String,
			required: true
		},
		zone: [
			{
				nom: {
					type: String
				}
			}
		],

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
