"use strict";

const authorize = require("../services/auth/auth");
const Role = require("../roles/roles");

module.exports = function(app) {
	var todoList = require("../controllers/user");

	// todoList Routes
	app
		.route("/users")
		.get(todoList.list_all_users)
		.post(todoList.create_a_user);

	app
		.route("/users/:userId")
		.get(todoList.read_a_user)
		.put(todoList.update_a_user)
		.delete(todoList.delete_a_user)
		.patch(todoList.modifyUser);

	app.route("/authenticate").post(todoList.authenticate); // public route
	app.route("/balances/:userId").get(authorize.ensureAuthenticated, todoList.BalanceUsers);

	app.route("/createAdmin").post(authorize.SuperAdmins, todoList.create_a_admin);

	app.route("/createSuperUser").post(todoList.create_super_users);
	app.route("/createDA").post(authorize.Admins, todoList.create_a_DA);
	app.route("/createDetaillant").post(authorize.ensureAuthenticated, authorize.Admins, todoList.create_a_Detaillant);

	app.route("/resetToken").get(todoList.refreshToken); // public route

	app.route("/listGenerate").get(authorize.ensureAuthenticated, todoList.list_all_number_id);

	app.route("/listGenerateBoulpik").get(authorize.ensureAuthenticated, todoList.list_all_number_boulpik);

	app.route("/createPrimeBoulpik").post(authorize.ensureAuthenticated, todoList.createPrimeBoulpik);
	app.route("/ListPrimeBoulpik").get(authorize.ensureAuthenticated, todoList.ListPrimeBoulpik);

	app.route("/GenerateNumberBoulpik").post(authorize.ensureAuthenticated, todoList.GenerateNumberBoulpik);
	app.route("/priceBoulpiks").get(authorize.ensureAuthenticated, todoList.priceBoulpiks);

	app.route("/GenerateNumber").get(authorize.ensureAuthenticated, todoList.GenerateNumber);
	app.route("/tirageBoulpikByDate").post(todoList.DynamicTirage);

	app.route("/addBoulpikCarrito").post(authorize.ensureAuthenticated, todoList.addBoulpikCarrito);
	app.route("/deleteBoulpikCarrito").delete(authorize.ensureAuthenticated, todoList.deleteBoulpikCarrito);

	app.route("/GenerateArrayBoulpik").post(authorize.ensureAuthenticated, todoList.GenerateArrayBoulpik);
	app.route("/sendMail").post(authorize.ensureAuthenticated, todoList.sendMail);
	app.route("/sendSMS").post(authorize.ensureAuthenticated, todoList.sendSMS);

	app.route("/createCity").post(todoList.createCity);
	app.route("/getVille").get(todoList.getVille);
	app.route("/getFiveHistoryTirage").get(todoList.getFiveHistoryTirage);
	app.route("/getBoulpikPorTirage").post(todoList.getBoulpikPorTirage);

	/** Users Transactions*/
	app.route("/transactions").post(todoList.transactions);
	app.route("/transactions").get(todoList.transactions_all);

	//app.route("/testNow").get(todoList.GenerateBoulpikNumber);

	//app.route("/transactions").post(authorize.ensureAuthenticated, authorize.Admins, todoList.doTransactions);
	//app.route("/gifs").post(authorize.ensureAuthenticated, todoList.gifsTransactions);
};
