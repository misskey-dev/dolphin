import * as Bull from 'bull';
import { deleteDriveFiles } from './delete-drive-files';
import { exportNotes } from './export-notes';
import { exportFollowing } from './export-following';
import { exportBlocking } from './export-blocking';
import { exportMute } from './export-mute';
import { exportUserLists } from './export-user-lists';
import { importFollowing } from './import-following';
import { importUserLists } from './import-user-lists';

const jobs = {
	deleteDriveFiles,
	exportNotes,
	exportFollowing,
	exportBlocking,
	exportMute,
	exportUserLists,
	importFollowing,
	importUserLists
} as any;

export default function(dbQueue: Bull.Queue) {
	for (const [k, v] of Object.entries(jobs)) {
		dbQueue.process(k, v as any);
	}
}
