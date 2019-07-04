var mongoose = require("mongoose");
require("mongoose-double")(mongoose);
var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;

// set up a mongoose model
module.exports = mongoose.model(
	"BoulpikNumbers",
	new Schema({
		Boulpik: [],
		price: {
			type: SchemaTypes.Double,
			default: 25
		},

		start: {
			type: Date,
			required: true
		},
		end: {
			type: Date,
			required: true
		},
		arrayWinner: [
			{
				idWinner: {
					type: String,
					required: true
				},
				nom: {
					type: String,
					required: true
				},
				place: {
					type: String,
					required: true
				},
				montant: {
					type: String,
					required: true
				}
			}
		],
		totalRecharge: {
			type: SchemaTypes.Double
		},

		created: {
			type: Date,
			default: Date.now
		}
	})
);
