import Vue from 'vue';

import mfm from './misskey-flavored-markdown.vue';
import acct from './acct.vue';
import avatar from './avatar.vue';
import emoji from './emoji.vue';
import userName from './user-name.vue';
import followButton from './follow-button.vue';
import ellipsis from './ellipsis.vue';
import time from './time.vue';
import url from './url.vue';
import urlPreview from './url-preview.vue';
import SequentialEntrance from './sequential-entrance.vue';
import error from './error.vue';

Vue.component('mfm', mfm);
Vue.component('dp-acct', acct);
Vue.component('dp-avatar', avatar);
Vue.component('dp-emoji', emoji);
Vue.component('dp-user-name', userName);
Vue.component('dp-follow-button', followButton);
Vue.component('dp-ellipsis', ellipsis);
Vue.component('dp-time', time);
Vue.component('dp-url', url);
Vue.component('dp-url-preview', urlPreview);
Vue.component('dp-error', error);
Vue.component('sequential-entrance', SequentialEntrance);
