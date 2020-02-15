const api = require('node-osu').Api

const sampleUnrankMap = {
    id: '-1',
    beatmapSetId: '-1',
    approvalStatus: 'Unranked',
    titie: 'unknown',
    creator: 'someone',
    artist: 'catgirl',
     difficulty: {
      rating: 0,
      aim: 0,
      speed: 0,
      size: 0,
      overall: 0,
      approach: 0,
      drain: 0
    },
    length: { total: 0, drain: 0 },
    hasDownload: false,
}

function mapPool(config) {
    this.bancho = new api(config.key, config.config);
}

mapPool.prototype = [];
mapPool.prototype.test = async function() {
    this.push(...await this.bancho.getBeatmaps({ b: '765567' }))
    return this;
}
mapPool.prototype.addUploadedMap = async function(selector, options) {
    this.push(...(await this.bancho.getBeatmaps(selector)).map(map => Object.assign(map, options)))
}
mapPool.prototype.addCustomMap = async function(beatmap, options) {
    this.push(Object.assign(sampleUnrankMap, beatmap, options));
}
mapPool.prototype.splitByBracket = function() {
    return this.reduce((acc, cur) => {
        if (cur.bracket == undefined) {
            if (typeof acc.undefined == undefined) acc.undefined = [];
            acc.undefined.push(cur);
        } else {
            if (acc[cur.bracket] == undefined) acc[cur.bracket] = [];
            acc[cur.bracket].push(cur);
        }
        return acc;
    }, {})
}


module.exports = mapPool;