var mongoose = require("mongoose");
require("mongoose-double")(mongoose);
var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;

// set up a mongoose model
module.exports = mongoose.model(
	"Userslottos",
	new Schema({
		nom: {
			type: String,
			required: true,
		},
		surnom: {
			type: String,
			default: "",
		},
		role: {
			type: String,
			default: "User",
		},
		tel: {
			type: String,
			default: "",
			unique: true,
		},
		email: {
			type: String,

			trim: true,
			lowercase: true,
			match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please fill a valid email address"],
		},
		motDePasse: {
			type: String,
			required: true,
		},
		pin: {
			type: String,
			default: "1234",
		},
		salt: {
			type: String,
		},
		resetPasswordToken: {
			type: String,
		},
		message: [
			{
				type: {
					type: String,
				},

				code: {
					type: String,
				},
				data: {
					ammount: {
						type: String,
					},
					person: {
						type: String,
					},
					boulpik: {
						type: String,
					},
					draw: {
						type: String,
					},
					newDate: {
						type: String,
					},
				},
				created: {
					type: Date,
					default: Date.now,
				},
			},
		],

		codeSend: {
			type: String,
		},

		etat: {
			type: String,
			default: "1",
		},
		zone: {
			type: String,
		},
		address: {
			type: String,
		},
		ville: {
			type: String,
		},
		credit: {
			type: SchemaTypes.Number,
			min: 0,
			default: 0,
		},
		created: {
			type: Date,
			default: Date.now,
		},
	})
);
