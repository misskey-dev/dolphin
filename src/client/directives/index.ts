import Vue from 'vue';

import userPreview from './user-preview';
import autocomplete from './autocomplete';
import particle from './particle';

Vue.directive('autocomplete', autocomplete);
Vue.directive('particle', particle);
Vue.directive('userPreview', userPreview);
Vue.directive('user-preview', userPreview);
