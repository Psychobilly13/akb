const env = require("../../../utils/env");

const cookieSetAuthTokens = (
	req,
	rep,
	tokens,
) => {
	const domain = req.headers.origin
    ? new URL(req.headers.origin).hostname.split(".").slice(-2).join(".")
    : "localhost";
    const tokenExpire = parseInt(env("TOKEN_EXPIRE", 15778800))
	rep.setCookie("authorization_token", `Bearer ${tokens.access.token}`, {
		httpOnly: true,
		maxAge: tokenExpire,
		sameSite: "none",
		secure: true,
		domain: domain,
		path: "/",
	});

	rep.setCookie("refresh_token", tokens.refresh.token, {
		httpOnly: true,
		maxAge: tokenExpire,
		sameSite: "none",
		secure: true,
		domain,
		path: "/",
	});
};

const cookieDelAuthTokens = (
	req,
	rep,
) => {
	let domain = req.headers.origin
		? new URL(req.headers.origin).hostname.split(".").slice(-2).join(".")
		: 'localhost';

	rep.clearCookie("authorization_token", {
		secure: true,
		domain,
		sameSite: "none",
		httpOnly: true,
		path: "/",
	});
	rep.clearCookie("refresh_token", {
		secure: true,
		domain,
		sameSite: "none",
		httpOnly: true,
		path: "/",
	});
};

module.exports = {cookieSetAuthTokens, cookieDelAuthTokens}