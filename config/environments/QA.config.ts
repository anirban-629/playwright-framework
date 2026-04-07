import type { IConfig } from "../../types";

export const QAConfig: IConfig = {
	URL: String(process.env.QA_LOGIN_URL),
	timeout: Number(process.env.QA_SPECIFIED_TIMEOUT) || 60000,
	retries: 1,
	users: {
		admin: {
			username: String(process.env.QA_ADMIN_USER),
			password: String(process.env.QA_ADMIN_PASS),
			mfaSecret: String(process.env.QA_ADMIN_MFA_SECRET_KEY),
			name: String(process.env.QA_ADMIN_NAME),
		},
	},
};
