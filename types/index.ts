export type IUserCredentials = {
	[key: string]: {
		username: string;
		password: string;
		mfaSecret?: string;
		name: string;
	};
};
export type IConfig = {
	URL: string;
	timeout: number;
	retries: number;
	users: IUserCredentials;
};

export type IScreenshotOptions = {
	name?: string;
	fullPage?: boolean;
};

export type IAPIResponse = {
	access_token: string;
	signature: string;
	scope: string;
	instance_url: string;
	id: string;
	token_type: string;
	issued_at: string;
};
