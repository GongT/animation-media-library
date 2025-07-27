export interface IBgmConfig {
	readonly baseUrl?: string;
	readonly accessToken?: string;
	readonly userAgent: string;
}

const defaultConfig: Partial<IBgmConfig> = {
	baseUrl: 'https://api.bgm.tv',
};

export class BangumiClient {
	protected readonly config: Required<IBgmConfig>;
	constructor(
		private readonly accessToken: string,
		config: Partial<IBgmConfig> = {}
	) {
		this.config = Object.assign({}, defaultConfig, config) as Required<IBgmConfig>;
	}

	async fetchData(endpoint: string): Promise<any> {
		const response = await fetch(`${this.config.baseUrl}/${endpoint}`, {
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
				'User-Agent': this.config.userAgent,
			},
		});
		if (!response.ok) {
			throw new Error(`Error fetching data: ${response.statusText}`);
		}
		return response.json();
	}
}
