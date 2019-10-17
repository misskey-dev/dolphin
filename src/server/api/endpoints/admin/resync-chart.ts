import define from '../../define';
import { driveChart, notesChart, usersChart, instanceChart } from '../../../../services/chart';

export const meta = {
	tags: ['admin'],

	requireCredential: true,
	requireModerator: true,
};

export default define(meta, async (ps, me) => {
	driveChart.resync();
	notesChart.resync();
	usersChart.resync();
	instanceChart.resync();

	// TODO: ユーザーごとのチャートもキューに入れて更新する
});
