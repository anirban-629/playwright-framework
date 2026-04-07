import type { IConfig } from "../../types";

export const FCConfig: IConfig = {
	URL: String(process.env.FC_LOGIN_URL),
	timeout: Number(process.env.FC_SPECIFIED_TIMEOUT) || 60000,
	retries: 1,
	users: {
		admin: {
			username: String(process.env.FC_ADMIN_USER),
			password: String(process.env.FC_ADMIN_PASS),
			mfaSecret: String(process.env.FC_ADMIN_MFA_SECRET_KEY),
			name: String(process.env.FC_ADMIN_NAME),
		},
	},
};
