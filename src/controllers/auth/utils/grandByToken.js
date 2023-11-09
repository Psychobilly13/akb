const accessByToken = async (
	req,
	_rep,
) => {
	let authToken = req.cookies.authorization_token ?? req.headers.authorization;

	if (!authToken) {
    const err = new Error("invalidToken");
    err.statusCode = 401
    throw err;
	}

    // TODO:
	//return assignUser(req, authToken);
};

// async function assignUser(
// 	req,
// 	authToken,
// ) {
// 	const [type, access] = authToken.split(" ");
// 	if (type !== "Bearer" || !access) {
// 		const err = new Error("invalidToken");
//     err.statusCode = 401
//     throw err;
// 	}

// 	const user = await sessionManager.getSessionUserByAccessToken(access);
// 	if (!user) {
// 		const err = new Error("invalidToken");
//     err.statusCode = 401
//     throw err;
// 	}

// 	req.user = user;
// 	req.device = device;
// }

module.exports = accessByToken