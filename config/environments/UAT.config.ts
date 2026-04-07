import type { IConfig } from "../../types";

export const UATConfig: IConfig = {
	URL: String(process.env.UAT_LOGIN_URL),
	timeout: Number(process.env.UAT_SPECIFIED_TIMEOUT) || 60000,
	retries: 1,
	users: {
		admin: {
			username: String(process.env.UAT_ADMIN_USER),
			password: String(process.env.UAT_ADMIN_PASS),
			mfaSecret: String(process.env.UAT_ADMIN_MFA_SECRET_KEY),
			name: String(process.env.UAT_ADMIN_NAME),
		},
	},
};
