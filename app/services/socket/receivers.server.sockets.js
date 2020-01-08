var socketIO = require("socket.io");
module.exports = {
	receivers
};


	exports.receivers = io => {
		socketIO = io;
		io.emit("notification", "data");
	});

