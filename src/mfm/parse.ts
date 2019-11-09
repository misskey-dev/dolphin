import { toUnicode } from 'punycode';
import { MfmForest, createLeaf, MfmNode, urlRegex } from './prelude';
import { normalize } from './normalize';
import parseAcct from '../misc/acct/parse';
import { cumulativeSum } from '../prelude/array';
import { Tree } from '../prelude/tree';
import { emojiRegex } from '../misc/emoji-regex';

export function parse(source: string | null): MfmForest | null {
	if (source == null || source == '') {
		return null;
	}

	return normalize(p(source));
}

export function parsePlain(source: string | null): MfmForest | null {
	if (source == null || source == '') {
		return null;
	}

	return normalize(p(source, true));
}

function removeOrphanedBrackets(s: string): string {
	const openBrackets = ['(', '「', '['];
	const closeBrackets = [')', '」', ']'];
	const xs = cumulativeSum(s.split('').map(c => {
		if (openBrackets.includes(c)) return 1;
		if (closeBrackets.includes(c)) return -1;
		return 0;
	}));
	const firstOrphanedCloseBracket = xs.findIndex(x => x < 0);
	if (firstOrphanedCloseBracket !== -1) return s.substr(0, firstOrphanedCloseBracket);
	const lastMatched = xs.lastIndexOf(0);
	return s.substr(0, lastMatched + 1);
}

const checkUrl = (source: string, cursor: number, remain: string): [Tree<MfmNode>, number] | [null, number] => {
	const match = remain.match(urlRegex);
	if (!match) return [null, 0];
	let url = match[0];
	url = removeOrphanedBrackets(url);
	url = url.replace(/[.,]*$/, '');
	return [createLeaf('url', { url: url }), url.length];
};

const checkMention = (source: string, cursor: number, remain: string): [Tree<MfmNode>, number] | [null, number] => {
	const match = remain.match(/^@\w([\w-]*\w)?(?:@[\w.\-]+\w)?/);
	if (!match) return [null, 0];
	if (source[cursor - 1] != null && source[cursor - 1].match(/[a-z0-9]/i)) return [null, 0];
	const mention = match[0];
	const { username, host } = parseAcct(mention);
	const canonical = host != null ? `@${username}@${toUnicode(host)}` : mention;
	return [createLeaf('mention', { canonical, username, host, acct: mention }), mention.length];
};

const checkHashtag = (source: string, cursor: number, remain: string): [Tree<MfmNode>, number] | [null, number] => {
	const match = remain.match(/^#([^\s.,!?'"#:\/\[\]【】]+)/i);
	if (!match) return [null, 0];
	let hashtag = match[1];
	hashtag = removeOrphanedBrackets(hashtag);
	if (hashtag.match(/^(\u20e3|\ufe0f)/)) return [null, 0];
	if (hashtag.match(/^[0-9]+$/)) return [null, 0];
	if (source[cursor - 1] != null && source[cursor - 1].match(/[a-z0-9]/i)) return [null, 0];
	if (Array.from(hashtag || '').length > 128) return [null, 0];
	return [createLeaf('hashtag', { hashtag: hashtag }), ('#' + hashtag).length];
};

const checkEmoji = (source: string, cursor: number, remain: string): [Tree<MfmNode>, number] | [null, number] => {
	const nameMatch = remain.match(/^:([a-z0-9_+-]+):/i);
	if (nameMatch) {
		return [createLeaf('emoji', { name: nameMatch[1] }), nameMatch[0].length];
	}
	const codeMatch = remain.match(new RegExp('^' + emojiRegex.source));
	if (codeMatch) {
		return [createLeaf('emoji', { emoji: codeMatch[0] }), codeMatch[0].length];
	}
	return [null, 0];
};

function p(source: string, emojiOnly = false): MfmForest {
	const res: MfmForest = [];
	let cursor = 0;

	const syntaxes: ((source: string, cursor: number, remain: string) => [Tree<MfmNode>, number] | [null, number])[]
		= emojiOnly ? [checkEmoji] : [checkMention, checkHashtag, checkUrl, checkEmoji];

	while (cursor < source.length) {
		const remain = source.substr(cursor);

		let matched = false;

		for (const syntax of syntaxes) {
			const [x, inc] = syntax(source, cursor, remain);
			if (x) {
				res.push(x);
				cursor += inc;
				matched = true;
				break;
			}
		}

		if (!matched) {
			res.push(createLeaf('text', { text: remain[0] }));
			cursor++;
		}
	}

	return res;
}
