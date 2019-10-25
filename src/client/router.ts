import Vue from 'vue';
import VueRouter from 'vue-router';
import DpIndex from './pages/index.vue';

Vue.use(VueRouter);

export const router = new VueRouter({
	mode: 'history',
	routes: [
		{ path: '/', name: 'index', component: DpIndex },
		{ path: '/@:user', name: 'user', component: () => import('./pages/user/index.vue').then(m => m.default), children: [
			{ path: 'following', name: 'userFollowing', component: () => import('./pages/user/follow-list.vue').then(m => m.default), props: { type: 'following' } },
			{ path: 'followers', name: 'userFollowers', component: () => import('./pages/user/follow-list.vue').then(m => m.default), props: { type: 'followers' } },
		]},
		{ path: '/favorites', component: () => import('./pages/favorites.vue').then(m => m.default) },
		{ path: '/messages', component: () => import('./pages/messages.vue').then(m => m.default) },
		{ path: '/settings', component: () => import('./pages/settings.vue').then(m => m.default) },
		{ path: '/instance', component: () => import('./pages/instance.vue').then(m => m.default) },
		{ path: '/follow-requests', component: () => import('./pages/follow-requests.vue').then(m => m.default) },
		{ path: '/manage-lists', component: () => import('./pages/manage-lists/index.vue').then(m => m.default) },
		{ path: '/manage-lists/:list', component: () => import('./pages/manage-lists/list.vue').then(m => m.default) },
		{ path: '/lists/:list', component: () => import('./pages/list.vue').then(m => m.default) },
		{ path: '/notes/:note', component: () => import('./pages/note.vue').then(m => m.default) },/*
		{ path: '/authorize-follow', component: DpFollow },
		{ path: '*', component: DpNotFound }*/
	]
});
