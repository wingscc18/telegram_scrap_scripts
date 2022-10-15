const { run_script_telegram } = require('./modules_scripts/telegram_script.js')
const { run_script_get_videos_1 } = require('./modules_scripts/get_videos_fuente_1.js')

async function start_all() {

    try {
        let TOKEN_BOT_TELEGRAM = 'TU_TOKEN_BOT_TELEGRAM'
        let CHANNELS = ["ID_CHANNEL", "ID_CHANNEL_2"] 
        // puedes agrear tambien mensajes privados o grupos o canal de todo.

        run_script_telegram(TOKEN_BOT_TELEGRAM, CHANNELS)

    } catch (err) {
        console.log("Hubo un error: ", err.message, "\n\nServicio Telegram.");
    }

    try {
        run_script_get_videos_1()

        setInterval(() => {
            run_script_get_videos_1()
        }, 3600000);
    } catch (err) {
        console.log("Hubo un error: ", err.message, "\n\nServicio de obtener videos fuente 1.");

    }

}


start_all()