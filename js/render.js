/*
display a loading screen.
*/
async function loading(loading, toggle = ['#table'], message = 'loading...') {
    if (loading) {
        toggle.map((s) => $(s).css('display', 'none'));
        $('#loading').html(message);
        $('#loading').css('display', '');
    } else {
        toggle.map((s) => $(s).css('display', ''));
        $('#loading').css('display', 'none');
    }
}

async function getMapFromElo(map) {
    return ((res = await (await fetch(`http://47.101.168.165:5005/api/map/${map.map_id}`)).json()) !== null) ?
        new osu.Beatmap({ parseNumeric: true }, res[0]) :
        adapter.toNodeOsuBeatmap(map);
}
const getMapFromEloCache = getMapFromElo.memoize();
/*
update elo map pool table
*/
async function updateTable(mappool) {
    loading(true);
    let json = await (await fetch(`http://47.101.168.165:5005/api/mappool/${mappool}`)).json();
    console.log(json);
    json = await Promise.all(json.map(async map => getMapFromEloCache(map)));
    console.log(json)
    // let pool = new MapPool();
    // pool.unshift(...json);
    // console.log(pool);
    $(`#table`).bootstrapTable('load', json);
    loading(false);
}
/*
init function
*/
async function init() {
    loading(true, ['#name'], '正在加载图池...');
    const all = await (await fetch('http://47.101.168.165:5005/api/tourney/ewc')).json();
    const pools = await Promise.all(all.map(async tour => ({
        pools: await (await fetch(`http://47.101.168.165:5005/api/mappool/mplist/${tour}`)).json(),
        tournament: tour,
    })));
    loading(true, [], '正在绘图...');
    // console.log(pools)
    const groups = pools.map(({ tournament, pools }) => {
        const g = document.createElement("OPTGROUP");
        g.setAttribute("label", tournament);
        pools.map(pool => {
            const options = document.createElement("OPTION");
            options.setAttribute('id', pool.mappool_name);
            options.setAttribute('value', pool.mappool_name);
            options.innerHTML = pool.mappool_name;
            g.appendChild(options);
        })
        return g;
    })
    const defOpt = document.createElement("OPTION");
    defOpt.innerHTML = 'select pools to view';
    const def = document.createElement("OPTGROUP");
    def.setAttribute("label", 'default');
    def.appendChild(defOpt);
    groups.unshift(def);
    $('#name').append(...groups);
    $('#name').selectpicker('refresh');
    $('#name').selectpicker('render');
    $(function() {
        $("#name").on("changed.bs.select", function(e, clickedIndex, newValue, oldValue) {
            const selectedD = $(this).find('option').eq(clickedIndex).text();
            // console.log('selectedD: ' + selectedD + '  newValue: ' + newValue + ' oldValue: ' + oldValue);
            updateTable(selectedD);
        });
    });
    loading(false, ['#name']);
}
// const [config, mapPool, EloAdapter] = reqs = [require('config'), require('mapPool'), require('EloAdapter')];

const [osu, MapPool, EloAdapter] = [require('node-osu'), require('mapPool'), require('elo-adapter')];
const adapterConfig = { autoComplete: false };
const adapter = new EloAdapter(adapterConfig);
// $('#customSwitch1').on('change.bootstrapSwitch', function(e) {
//     adapter.autoComplete = e.target.checked;
// });


const columns = [{
        field: 'index',
        title: '#',
        width: 50,
        formatter: (value, row, index) => `${row.bracket || '*'}${value || index}`
    },
    {
        field: 'id',
        title: 'Beatmap ID',
        width: 100,
        formatter: (value) => `<a href='#'>${value}</a>`,
        detailFormatter: (index, row) => Object.entries({
            bancho: (bm) => ([bm.id].every(col => col !== undefined)) ? `<a href = "https://osu.ppy.sh/b/${bm.id}">view topic</a>` : `need bancho api`,
            bloodcat: (bm) => ([bm.beatmapSetId].every(col => col !== undefined)) ? `<a href="https://bloodcat.com/osu/s/${bm.beatmapSetId}">download</a>` : `need bancho api`,
        }).map(([site, f]) => `${site}: ${f(row)}`).join("<br>")
    },
    {
        field: 'difficulty',
        title: 'difficulty',
        width: 80,
        formatter: (value) => `<a href='#'>${parseInt(value.rating * 100) / 100}</a>`,
        detailFormatter: (index, row) => Object.entries(row.difficulty).filter(([index, value]) => value >= 0).map(([index, value]) => `${index}: ${parseInt(value * 100) / 100}`).join("<br>")
    },
    {
        title: 'map',
        width: 400,
        formatter: (value, row) => `${row.artist} - ${row.title} [ ${row.version} ]`
    },
    {
        title: 'length(drain)',
        width: 120,
        formatter: (value, row) => {
            function toTime(seconds) {
                // multiply by 1000 because Date() requires miliseconds
                var date = new Date(seconds * 1000);
                var mm = date.getUTCMinutes();
                var ss = date.getSeconds();
                // These lines ensure you have two-digits
                if (mm < 10) { mm = "0" + mm; }
                if (ss < 10) { ss = "0" + ss; }
                // This formats your string to HH:MM:SS
                return mm + ":" + ss;
            }
            return `${toTime(row.length.total)} ( ${toTime(row.length.drain)} )`
        }
    },
];


//init table
const t = document.createElement("TABLE");
t.setAttribute("id", 'table');
// const c = t.createCaption();
// c.innerHTML = 'maps';
document.body.appendChild(t)
$(`#table`).bootstrapTable({
    detailView: true,
    detailViewByClick: true,
    data: [],
    columns
});
$('#table').css('display', 'none')

window.onload = init;