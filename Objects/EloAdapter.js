const node_osu = require('node-osu');
const osu = node_osu.Api

function EloAdapter({
    autoComplete = false,
    sample = {
        id: undefined,
        beatmapSetId: undefined,
        approvalStatus: undefined,
        titie: undefined,
        creator: undefined,
        artist: undefined,
        version: undefined,
        difficulty: {
            rating: -1,
            aim: -1,
            speed: -1,
            size: -1,
            overall: -1,
            approach: -1,
            drain: -1
        },
        length: { total: -1, drain: -1 },
        hasDownload: false,
    }
} = {}) {
    this.autoComplete = autoComplete;
    this.sample = sample;
    this.bancho = new osu('9aa58c3820b6a95beb5b4430df5f88f5812cdaf1', { parseNumeric: true });
}
EloAdapter.prototype.apiGetMap = function(mapped) {
    return this.bancho.getBeatmaps({ b: mapped.id }).then(result => result[0]).catch(e => Promise.resolve(mapped));
}
EloAdapter.prototype.mapping = function(map) {
    let downloadable = (map.map_id > -1) ? true : this.sample.hasDownload;
    return JSON.parse(JSON.stringify(Object.assign(this.sample, {
        id: map.map_id || -1,
        title: map.map_title,
        creator: map.map_creator,
        artist: map.map_artist,
        version: map.map_version,
        difficulty: Object.assign(this.sample.difficulty, {
            rating: map.difficulty_rating,
        }),
        hasDownload: downloadable,
    })));
}

EloAdapter.prototype.toNodeOsuBeatmap = async function(map) {
    const mapped = this.mapping(map);
    mapped.__proto__ = node_osu.Beatmap.prototype;
    if (this.autoComplete) {
        if (Object.entries(mapped).some(([prop, value]) => value == undefined)) return this.apiGetMap(mapped);
        else if ([mapped.difficulty, mapped.length].some((sub) => Object.entries(sub).map(([prop, value]) => value == undefined || value < 0))) return this.apiGetMap(mapped);
        else return mapped;
    } else {
        // mapped.__proto__ = node_osu.Beatmap.prototype;
        return mapped;
    }
}

EloAdapter.prototype.toNodeOsuBeatmapList = async function(list) {
    return Promise.all(list.map(async sel => await this.toNodeOsuBeatmap(sel)));
}

module.exports = EloAdapter;
// async function test() {
//     let adapter = new EloAdapter({ autoComplete: true });

//     console.log(await adapter.toNodeOsuBeatmapList([{
//         "map_id": 2227471,
//         "map_title": "Shape of the Sun",
//         "map_artist": "Creo",
//         "map_version": "Kite's Insane",
//         "map_creator": "NeilPerry",
//         "map_covers": 1051126,
//         "difficulty_rating": 4.23
//     }]))
// }
// test();