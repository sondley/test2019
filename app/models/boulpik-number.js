var mongoose = require("mongoose");
require("mongoose-double")(mongoose);
var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;

// set up a mongoose model
module.exports = mongoose.model(
	"BoulpikNumbers",
	new Schema({
		Boulpik: [
			{
				boulpik: {
					type: String,
					required: true
				},
				price: {
					type: String,
					required: true
				},
				fecha: {
					type: String,
					required: true
				},
				idUser: []
			}
		],
		price: {
			type: SchemaTypes.Double,
			required: true
		},

		start: {
			type: String,
			required: true
		},
		end: {
			type: String,
			required: true,
			unique: true
		},
		arrayWinner: [
			{
				winners: [
					{
						idUsers: {
							type: String,
							required: true
						},
						nom: {
							type: String,
							required: true
						}
					}
				],
				place: {
					type: String,
					required: true
				},
				boulpik: {
					type: String,
					required: true
				},
				montant: {
					type: String,
					required: true
				},
				countWinners: {
					type: String,
					required: true
				}
			}
		],
		totalRecharge: {
			type: SchemaTypes.Double
		},
		etat: {
			type: String,
			default: "1"
		},
		total: {
			type: SchemaTypes.Double,
			default: 0
		},
		initial: {
			type: SchemaTypes.Double,
			required: true
		},

		created: {
			type: Date,
			default: Date.now
		}
	})
);
