export interface UserSettings {
	bangumiUserToken: string;
	lastUserToken: string;
	lastSyncTimestamp: number;
	bangumiUserId: number;
}

export type ValidKeys = keyof UserSettings;
