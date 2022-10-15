const TELEGRAMA = require('node-telegram-bot-api')
const DIR = require("path")
const ARCH = require("fs")
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./videos.db');

module.exports.run_script_telegram = (TOKEN, CHANNELS) => {

    if (!TOKEN)
        return setInterval(() => {
            console.log('[ERROR] No has agregado un token. \nServicio Telegram.')
        }, 3000);

    if (!CHANNELS)
        return setInterval(() => {
            console.log('[ERROR] No has agregado los canales de envio. \nServicio Telegram.')
        }, 3000);



    if (!Array.isArray(CHANNELS))
        return setInterval(() => {
            console.log('[ERROR] El envio de canales tiene que ser array. \nServicio Telegram.')
        }, 3000);

    const CLIENT = new TELEGRAMA(TOKEN, { polling: true })

    CLIENT.on('polling_error', console.log);
    CLIENT.on('error', console.log)

    // CLIENT.on("channel_post", Canal => {
    //     console.log(Canal);
    //   })

    function manda_fight_k() {

        let sqlite_get_random = `SELECT * FROM videos_k WHERE enviado = 'no' ORDER BY RANDOM() LIMIT 1`

        db.get(sqlite_get_random, (err, rows) => {
            if (!rows)
                return console.log('No hay material para subir' +
                    '\nBuscando nuevo material en 1 minuto') + setTimeout(() => {manda_fight_k()}, 60000);

            let dir_video = DIR.join(rows.ruta)

            let sqlite_offenvio= `UPDATE videos_k SET enviado = 'si' WHERE title = '${rows.title}'`
            db.run(sqlite_offenvio)

            CHANNELS.forEach(enviar_mensaje => {
                CLIENT.sendVideo(
                    chat_id = enviar_mensaje,
                    dir_video,
                    { caption: "<b>" + rows.title + " </b>", parse_mode: 'HTML', thumb: (rows.thumb || '') },
                    { contentType: 'video/mp4' }
                ).then(() => {
                    ARCH.unlinkSync(dir_video)

                    setTimeout(() => {
                        manda_fight_k()
                    }, 501000)

                }).catch(error => {
                    console.log("Hubo un problema subiendo el video: " + rows.title + " \n\nServicio de telegram");
                    console.log("Error detallado: " + error.response.body.description);
                })

            })
        })
    }

    manda_fight_k()

}
