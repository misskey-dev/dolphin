import { toUnicode } from 'punycode';
import { MfmForest, createLeaf, MfmNode, urlRegex } from './prelude';
import { normalize } from './normalize';
import parseAcct from '../misc/acct/parse';
import { cumulativeSum } from '../prelude/array';
import { Tree } from '../prelude/tree';
import { emojiRegex } from '../misc/emoji-regex';

export function removeOrphanedBrackets(s: string): string {
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

	if (emojiOnly) {
		while (cursor < source.length) {
			const remain = source.substr(cursor);
	
			const [emoji, inc] = checkEmoji(source, cursor, remain);
			if (emoji) {
				res.push(emoji);
				cursor += inc;
				continue;
			}
	
			res.push(createLeaf('text', { text: remain[0] }));
			cursor++;
		}	
	} else {
		while (cursor < source.length) {
			const remain = source.substr(cursor);
	
			{
				const [mention, inc] = checkMention(source, cursor, remain);
				if (mention) {
					res.push(mention);
					cursor += inc;
					continue;
				}
			}
			{
				const [hashtag, inc] = checkHashtag(source, cursor, remain);
				if (hashtag) {
					res.push(hashtag);
					cursor += inc;
					continue;
				}
			}
			{
				const [url, inc] = checkUrl(source, cursor, remain);
				if (url) {
					res.push(url);
					cursor += inc;
					continue;
				}
			}
			{
				const [emoji, inc] = checkEmoji(source, cursor, remain);
				if (emoji) {
					res.push(emoji);
					cursor += inc;
					continue;
				}
			}
	
			res.push(createLeaf('text', { text: remain[0] }));
			cursor++;
		}	
	}

	return res;
}
