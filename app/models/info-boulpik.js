var mongoose = require("mongoose");
require("mongoose-double")(mongoose);
var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;

// set up a mongoose model
module.exports = mongoose.model(
	"InfoBoulpiks",
	new Schema({
		boulpik: [
			{
				tirage: {
					type: String,
					required: true
				},
				list: [{}],
				etat: {
					type: String,
					default: "1"
				}
			}
		],

		created: {
			type: Date,
			default: Date.now
		}
	})
);
