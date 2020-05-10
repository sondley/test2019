"use strict";

const authorize = require("../services/auth/auth");
const Role = require("../roles/roles");

module.exports = function (app) {
	var todoList = require("../controllers/user");

	// todoList Routes
	app.route("/users").get(authorize.ensureAuthenticated, todoList.list_all_users).post(todoList.create_a_user);

	app
		.route("/users/:userId")
		.get(authorize.ensureAuthenticated, todoList.read_a_user)
		.put(authorize.ensureAuthenticated, todoList.update_a_user)
		.delete(authorize.ensureAuthenticated, todoList.delete_a_user)
		.patch(authorize.ensureAuthenticated, todoList.modifyUser);

	app.route("/authenticate").post(todoList.authenticate); // public route
	app.route("/balances/:userId").get(authorize.ensureAuthenticated, todoList.BalanceUsers);
	app.route("/validatePin").post(authorize.ensureAuthenticated, todoList.validatePin);
	app.route("/findRole").post(todoList.roleByEmailTel);

	app.route("/createAdmin").post(authorize.SuperAdmins, todoList.create_a_admin);
	app.route("/payWinners").post(authorize.ensureAuthenticated, todoList.payWinners);
	app.route("/services").post(authorize.ensureAuthenticated, todoList.services);

	app.route("/resetPassword").post(authorize.ensureAuthenticated, todoList.resetPassword);

	app.route("/createSuperUser").post(todoList.create_super_users);
	app.route("/createDA").post(authorize.Admins, todoList.create_a_DA);
	app.route("/createDetaillant").post(authorize.ensureAuthenticated, authorize.Admins, todoList.create_a_Detaillant);
	app.route("/autoBoulpik").post(authorize.ensureAuthenticated, todoList.GenerateNumber);

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
	app.route("/deleteNotification").delete(authorize.ensureAuthenticated, todoList.delete_a_message);

	app.route("/user/message/:messageId").get(authorize.ensureAuthenticated, todoList.read_a_message);
	//.delete(authorize.ensureAuthenticated, todoList.delete_a_message);

	app.route("/GenerateArrayBoulpik").post(authorize.ensureAuthenticated, todoList.GenerateArrayBoulpik);
	app.route("/sendMail").post(authorize.ensureAuthenticated, todoList.sendMail);

	app.route("/sendMailToSupport").post(authorize.ensureAuthenticated, todoList.sendMail);
	app.route("/sendSMS").post(authorize.ensureAuthenticated, todoList.sendSMS);

	app.route("/createCity").post(authorize.ensureAuthenticated, todoList.createCity);
	app.route("/getVille").get(todoList.getVille);
	app.route("/getZone").post(todoList.getZone);
	app.route("/getFiveHistoryTirage").get(authorize.ensureAuthenticated, todoList.getFiveHistoryTirage);
	app.route("/getBoulpikPorTirage").post(authorize.ensureAuthenticated, todoList.getBoulpikPorTirage);

	/** Users Transactions*/
	app.route("/transactions").post(authorize.ensureAuthenticated, todoList.transactions);
	app.route("/myTransactions").get(todoList.my_transaction_users);
	app.route("/seeUserTransactions").post(todoList.see_transaction_users);
	app.route("/createTirage").post(authorize.ensureAuthenticated, authorize.SuperAdmins, todoList.createTirage);

	/**Aditionales */
	app.route("/mySonTransactions").get(todoList.mySonTransactions);
	app.route("/getDA").get(authorize.ensureAuthenticated, todoList.get_a_DA);
	app.route("/monCash").post(todoList.monCash);
	app.route("/").get(todoList.return);
	app.route("/createVendeur").post(todoList.createVendeur);
	app.route("/changePasswordPin").post(authorize.ensureAuthenticated, todoList.changePasswordPin);
	app.route("/changePasswordCode").post(authorize.ensureAuthenticated, todoList.changePasswordCode);
	app.route("/verifyTel").post(todoList.verifyTel);
	app.route("/resetPassWordEmail").post(todoList.resetPassWordEmail);
	app.route("/deleteMany").get(todoList.deleteMany);
	app.route("/verifyTelEmail").post(todoList.verifyTelEmail);
	app.route("/verifyTelEmailPin").post(todoList.verifyTelEmailPin);
	app.route("/updatePassword").post(todoList.updatePassword);
	app.route("/testNow").get(todoList.testNow);

	//app.route("/requestTestTransactions").get(todoList.testNow);
	app.route("/manitoksDeveloper").get(todoList.manitoksDeveloper);

	app.route("/requestTestTransactions").post(todoList.requestTestTransactions);

	app.route("/userCreateInfo").get(todoList.userCreateInfo);

	app.route("/countBoulpikPlayByTirage/:tirage").get(todoList.countBoulpikPlayByTirage);

	//app.route("/testNow").get(todoList.GenerateBoulpikNumber);

	//app.route("/transactions").post(authorize.ensureAuthenticated, authorize.Admins, todoList.doTransactions);
	//app.route("/gifs").post(authorize.ensureAuthenticated, todoList.gifsTransactions);
};
