"use strict";

function ArrayCache(initData) {
	this.d = initData || [];
}

ArrayCache.prototype.find = function (cacheType, time, start, end) {
	var pos;

	if (typeof start === 'undefined') {
		return this.find(cacheType, time, 0, this.d.length);
	}

	if (!time) {
		return end;
	}
	if (start >= end) return start;
	pos = ((start + end) / 2) | 0;

	if (this.d[pos] && this.d[pos][cacheType] < time) {
		return this.find(cacheType, time, pos + 1, end);
	} else if (this.d[pos - 1] && this.d[pos - 1][cacheType] >= time) {
		return this.find(cacheType, time, start, pos - 1);
	} else {
		return pos;
	}
};

ArrayCache.prototype.put = function (cacheType, data) {
	if (!data.length) return;
	var startLimit = data[0][cacheType],
		endLimit = data[data.length - 1][cacheType],
		start = this.find(cacheType, startLimit),
		end = this.find(cacheType, endLimit);

	while ( /* data[0].endtype && data[0].endtype == 'time' && */ this.d[start - 1] && this.d[start - 1][cacheType] == startLimit) {
		start--;
	}

	while ( /* data[data.length-1].endtype && data[data.length-1].endtype == 'time' && */ this.d[end] && this.d[end][cacheType] == endLimit) {
		end++;
	}

	if ((!this.d[start - 1] && this.d[start] && this.d[start].type != 'result-start') || (
		this.d[start - 1] && this.d[start - 1].type != 'result-end' && data[0].type == 'result-start'
	)) {
		data.shift();
	}
	if ((!this.d[end] && this.d[end - 1] && this.d[end - 1].type != 'result-end') || (
		this.d[end] && this.d[end].type != 'result-start' && data[data.length - 1].type == 'result-end'
	)) {
		data.pop();
	}

	[].splice.apply(this.d, [start, end - start].concat(data));
};

ArrayCache.prototype.get = function (cacheType, query) {
	var time = query[cacheType],
		before = Math.max(0, query.before || 0),
		after = Math.max(0, query.after || 0),
		partials = query.partials || false,
		pos, l = this.d.length,
		self = this;

	pos = time ? this.find(cacheType, time) : l;

	function walk(start, steps, direction) {
		var res = [],
			m, i, obj;
		for (i = start; i >= 0 && i < l && res.length < steps; i += direction) {
			m = self.d[i];
			if (typeof m !== 'object') throw new Error('ArrayCache contains non-object');
			if (m.type == 'result-start') {
				if (!partials) return null;
			} else if (m.type == 'result-end') {
				if (partials) {
					obj = {
						type: 'missing'
					};
					obj[cacheType] = m[cacheType];
					res.push(obj);
				} else return null;
			} else res.push(m);
		}

		return direction < 0 ? res.reverse() : res;
	}

	if (before) {
		while (this.d[pos] && this.d[pos][cacheType] == time) pos++;
		return walk(pos - 1, before, -1);
	} else if (after) {
		while (this.d[pos] && this.d[pos][cacheType] == time) pos--;
		return walk(pos + 1, after, 1);
	}
	return null;
};

module.exports = ArrayCache;