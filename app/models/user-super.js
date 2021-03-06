var mongoose = require("mongoose");
require("mongoose-double")(mongoose);
var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;

// set up a mongoose model
module.exports = mongoose.model(
	"UsersSupers",
	new Schema({
		idUsersLottos: {
			type: String,
			required: true
		},
		ville: {
			type: String,
			required: true
		},
		nom: {
			type: String,
			required: true
		},
		Admin: [
			{
				id: {
					type: String,
					required: true
				},
				nom: {
					type: String,
					required: true
				}
			}
		],

		DA: [
			{
				id: {
					type: String,
					required: true
				},
				nom: {
					type: String,
					required: true
				}
			}
		],
		created: {
			type: Date,
			default: Date.now
		}
	})
);
