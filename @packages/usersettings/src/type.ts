export interface UserSettings {
	bangumiUserToken: string;
	bangumiLastUserId: number;
}

export type ValidKeys = keyof UserSettings;
