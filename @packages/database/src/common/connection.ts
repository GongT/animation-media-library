import { appConfig } from "@backend/config";
import {
	DeepWriteable,
	oneSecond,
	prettyPrintError,
	registerGlobalLifecycle,
} from "@idlebox/common";
import { DataSource } from "typeorm";
import type { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions.js";

/** @internal */
export let typeorm_data_source: DataSource;

function interop(exports: any) {
	return exports.default ?? exports;
}

async function options() {
	const ret: DeepWriteable<PostgresConnectionOptions> = {
		type: "postgres",
		useUTC: true,
		applicationName: "animation-media-library",
		installExtensions: false,
		logNotifications: true,
		connectTimeoutMS: 5 * oneSecond,
		migrationsRun: false,

		database: appConfig.database.dbname,
		username: appConfig.database.user,
		password: appConfig.database.pass,
	};

	if (typeof appConfig.database.server === "string") {
		ret.host = appConfig.database.server;
		console.log(" - server: unix:%s", ret.host);
	} else {
		ret.host = appConfig.database.server.host;
		ret.port = appConfig.database.server.port;
		console.log(" - server: %s:%s", ret.host, ret.port);
	}

	// @ts-ignore
	const pg: any = await import("pg");
	ret.driver = interop(pg);

	try {
		// @ts-ignore
		const native: any = await import("pg-native");
		ret.nativeDriver = interop(native);
	} catch (e) {
		console.warn("pg-native is not available, falling back to pg driver");
	}

	// TODO: production environment
	ret.logger = "advanced-console";
	ret.logging = true;
	ret.synchronize = true;

	ret.entities = interop(await import("../g/schemas.generated.js"));
	ret.migrations = interop(await import("../g/migrations.generated.js"));
	ret.subscribers = interop(await import("../g/subscribers.generated.js"));

	return ret;
}

export async function startupDatabaseConnection() {
	try {
		console.log("database connecting...");

		const opts = await options();
		const AppDataSource = new DataSource(opts);

		await AppDataSource.initialize();
		console.log("database connected");

		typeorm_data_source = AppDataSource;
	} catch (e: any) {
		prettyPrintError("failed to connect database", e);
		throw e;
	}

	try {
		await typeorm_data_source.runMigrations({ transaction: "all" });

		console.log("migrations executed");
	} catch (e: any) {
		prettyPrintError("failed to migrate database", e);
		throw e;
	}
}

registerGlobalLifecycle({
	async dispose() {
		if (!typeorm_data_source) return;

		console.log("database disconnecting...");
		const c = typeorm_data_source;
		// @ts-ignore
		typeorm_data_source = undefined;
		await c.destroy();
		console.log("database finished.");
	},
});
