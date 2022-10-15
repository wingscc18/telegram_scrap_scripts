const FETCH = require("node-fetch")
const HTML = require('cheerio')
const FILE = require("fs")
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./videos.db');

let page = 1

const fight_k__ = 'https://www.kaotic.com/category/fight?paged='


module.exports.run_script_get_videos_1 = () => {


    function start_bot() {
        console.log('\n\n\nleyendo sitio ' + page + "\n");
        const queue = []

        FETCH(fight_k__ + page)
            .then(r => r.text())
            .then(async t => {
                let pagina = HTML.load(t)
                let videos = pagina('.video-image a')

                console.log("Se encontraron... " + videos.length + " videos.", new Date().toLocaleTimeString());

                if (videos.length === 0) return

                for (let video of videos)
                    await get_video_src(video.attribs.href, video.attribs.title.replace(/[^a-zA-Z0-9 ]/g, ''), video.children[0].attribs.src)

            })


        async function get_video_src(video_url, video_title, video_thumb) {

            let get_video_html = await FETCH(video_url)
                .then(r => r.text())

            console.log('procesando', video_title, '...');

            let web_page = HTML.load(get_video_html)

            let videos_found = web_page('video source')

            videos_found.each((index, video) => {
                let video_source = video.attribs.src
                let type = video.attribs.type

                if (type !== 'video/mp4') return;

                let sqlite_select = `SELECT * FROM videos_k WHERE title ='${video_title}'`

                db.get(sqlite_select, async (err, row) => {

                    if (row) return

                    queue.push({
                        video_source_: video_source,
                        link_video: video_url,
                        type_: type,
                        thumb_: video_thumb,
                        title_: video_title
                    })

                })

            })
        }

        async function download_mp4() {

            if (queue.length == '0')
                return console.log('Hemos descargado algunos videos. en 1 hora la script volvera a buscar nuevos videos');

            const response = await FETCH(queue[0].video_source_)

            let peso = response.headers.get('content-length')
            let new_type = 'NORMAL'
            let archivo_ruta = './media/fight_k/' + queue[0].video_source_.split('/').pop()

            if (Number(peso) > 52428800) {
                archivo_ruta = './media/fight_k_pesados/' + queue[0].video_source_.split('/').pop()
                new_type = 'PESADO'
            }

            const buffer = await response.buffer();

            FILE.writeFile(archivo_ruta, buffer, err => {
                if (!err) {
                    console.log(archivo_ruta, "Guardado!", new Date().toLocaleTimeString())
                    save_db(new_type)
                }
            })

            async function save_db(new_type) {
                let inf = queue[0]

                let sqlite_add = `INSERT OR IGNORE INTO videos_k (title, src, date, type, thumb, link_video, ruta, enviado)  ` +
                    `VALUES ('${inf.title_}', '${inf.video_source_}', '${new Date()}',` +
                    `'${new_type}', '${inf.thumb_}', '${inf.link_video}','${archivo_ruta}', 'no')`

                await db.run(sqlite_add)

                delete queue[0];
                queue.splice(0, 1);
                download_mp4()
            }

        }

        setTimeout(() => {
            download_mp4()
            console.log('iNICIANDO CON LAS DESCARGAS DE LOS VIDEOS.');
        }, 10000);

    }

    console.log("Script de obtener videos fuente 1 iniciado");
    start_bot()
}


