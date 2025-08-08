import { WatchState } from '@packages/database';
import { SubjectCollectionType } from 'bgmtv-api';

export function convertState(bangumiState: SubjectCollectionType): WatchState {
	switch (bangumiState) {
		case SubjectCollectionType.Wish:
			return WatchState.Wish;
		case SubjectCollectionType.Done:
			return WatchState.Complete;
		case SubjectCollectionType.Doing:
			return WatchState.Watching;
		case SubjectCollectionType.OnHold:
			return WatchState.Hold;
		case SubjectCollectionType.Dropped:
			return WatchState.Drop;
		default:
			return WatchState.NotCollect;
	}
}
