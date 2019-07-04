var mongoose = require("mongoose");
require("mongoose-double")(mongoose);
var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;

// set up a mongoose model
module.exports = mongoose.model(
	"UsersAuths",
	new Schema({
		idUsersLottos: {
			type: String,
			required: true
		},
		nom: {
			type: String,
			required: true
		},
		createur: {
			type: String
		},
		adress: {
			type: String,
			required: true
		},
		ville: {
			type: String,
			required: true
		},
		numero_matricule: {
			type: String,
			required: true,
			unique: true
		},
		nom_personne_reponsable: {
			type: String
		},
		id_personne_reponsable: {
			type: String
		},
		credit: {
			type: SchemaTypes.Double,
			min: 0,
			default: 0
		},
		created: {
			type: Date,
			default: Date.now
		}
	})
);
