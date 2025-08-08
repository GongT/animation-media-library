import { fromTimeStamp, getTimeStamp } from '@idlebox/common';
import { logger } from '@idlebox/logger';
import { shutdown } from '@idlebox/node';
import { APP } from '@packages/config';
import { AnimationEntity, EntityFields } from '@packages/database';
import { convertState } from '@packages/tools';
import { userSettings } from '@packages/usersettings';
import { Legacy_SubjectSmallType, SubjectCollectionType } from 'bgmtv-api';
import { bangumi } from '../common/bgm.js';

const intrestTypes = [SubjectCollectionType.Doing, SubjectCollectionType.Done, SubjectCollectionType.Wish];

export async function syncWatching(force: boolean) {
	const timestamp = userSettings.get('lastSyncTimestamp');
	const lastSync = fromTimeStamp(timestamp);
	const expectSyncAt = lastSync.getTime() + APP.fullSyncInterval;
	if (!force && Date.now() < expectSyncAt) {
		logger.log`next sync is ${expectSyncAt}`;
		return;
	}

	const intreastIds: bigint[] = [];
	for (const watchState of intrestTypes) {
		const { data } = await bangumi.getUserCollectionsByUsername('-', {
			limit: 100,
			offset: 0,
			subject_type: Legacy_SubjectSmallType.Anime,
			type: watchState,
		});

		for (const item of data) {
			const anime = AnimationEntity.create({
				bgmSubjectId: item.subject_id,
				title: item.subject.name_cn,
				coverUrl: item.subject.images.common,
				onAirFrom: new Date(Date.parse(item.subject.date)),
				watchState: convertState(watchState),
				episodeCount: item.subject.eps,
			} satisfies EntityFields<AnimationEntity>);

			const iresult = AnimationEntity.upsert(anime, ['bgmSubjectId']);
			console.log('iresult', iresult);
			console.log('anime', anime);

			intreastIds.push(anime.id);
			shutdown(1);
		}
	}

	await userSettings.update({
		lastSyncTimestamp: getTimeStamp(new Date()),
	});
}
