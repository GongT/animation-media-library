import { logger } from '@idlebox/logger';
import { AdvancedConsoleLogger, type LogLevel, type LogMessage, type QueryRunner } from 'typeorm';

const CSI = '\x1b[';

export class MyDatabaseLogger extends AdvancedConsoleLogger {
	private readonly logger = logger.extend('pg');

	protected override writeLog(
		level: LogLevel,
		logMessage: LogMessage | LogMessage[],
		_queryRunner?: QueryRunner
	): void {
		const messages = this.prepareLogMessages(logMessage);
		for (const message of messages) {
			switch (message.type ?? level) {
				case 'log':
					if (this.logger.debug.isEnabled) {
						this.logger.debug(message.message + '');
					}
					break;
				case 'schema-build':
				case 'migration':
					if (this.logger.debug.isEnabled) {
						this.logger.debug(`[${level}] ${message.message}`);
					}
					break;
				case 'info':
					if (this.logger.debug.isEnabled) {
						this.logger.debug(message.message + '');
					}
					break;
				case 'query':
					if (this.logger.verbose.isEnabled) {
						const msg = `${message.message}`.replaceAll(CSI, `${CSI}2;`);
						this.logger.verbose(`[${level}] ${msg}`);
					}
					break;
				case 'warn':
					if (this.logger.warn.isEnabled) {
						const prefix = message.prefix?.replace(':', '') ?? '';
						if (prefix !== 'warn') {
							this.logger.warn(`[${prefix}] ${message.message}`);
						} else {
							this.logger.warn(message.message + '');
						}
					}
					break;
				case 'query-slow':
					if (this.logger.warn.isEnabled) {
						this.logger.warn(`[slow] ${message.message}`);
					}
					break;
				default:
					{
						const prefix = message.prefix?.replace(':', '') ?? '';
						if (prefix !== 'error') {
							if (this.logger.verbose.isEnabled && prefix === 'query failed:') {
								return;
							}
							this.logger.error(`[${prefix}] ${message.message}`);
						} else {
							this.logger.error(message.message + '');
						}
					}
					break;
			}
		}
	}
}
