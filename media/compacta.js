const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');
const ffprobe = require('ffprobe')
const ffprobeStatic = require('ffprobe-static')
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
const fs = require('fs');
const path = require('path')
let actual_video
let queue = []
let name_files = []

let path_k = "fight_k_pesados"
let path_czs = "fight_czs_pesados"

function add_videos() {

    const videos_founds = fs.readdirSync(path.join(__dirname, path_k))
        .filter((file) => file.endsWith(".mp4"));

    for (const video of videos_founds) {
        if (name_files.indexOf(video) == ! '-1') return
        name_files.push(video)
        queue.push({
            video_path: path.join(__dirname, path_k, video),
            number: queue.length + 1,
            name_file: video,
            name_path: './' + path_k.replace('_pesados', '') + '/'
        })
    }
    const videos_founds_czs = fs.readdirSync(path.join(__dirname, path_czs))
        .filter((file) => file.endsWith(".mp4"));

    for (const video of videos_founds_czs) {
        if (name_files.indexOf(video) == ! '-1') return
        name_files.push(video)
        queue.push({
            video_path: path.join(__dirname, path_czs, video),
            number: queue.length + 1,
            name_file: video,
            name_path: './' + path_czs.replace('_pesados', '') + '/'

        })
    }
}

function check_new_videos() {
    if (queue.length == '0') return
    if (queue[0].number == actual_video) return
    actual_video = queue[0].number
    console.log("Ha comenzado comprimir el archivo: " + queue[0].name_file);
    start_download_video(queue[0].video_path, queue[0].name_file, queue[0].name_path)

}

async function start_download_video(path_url, name_file, name_path) {
    try {

        const fileMetaData = await ffprobe(path_url, { path: ffprobeStatic.path })

        let width = fileMetaData.streams[0].width
        let height = fileMetaData.streams[0].height

        var run_ffmpeg = new ffmpeg()
            .addInput(path_url)
            .fps(30)
            .size(`${width}x${height}`)
            .addOptions([
                "-vcodec h264",
                "-crf 28",
                "-b:a 320k",
                "-preset veryfast"])
            .save(path.join(__dirname, name_path, name_file))
            .on("end", async () => {
                actual_video = undefined
                name_files.splice(name_files.indexOf(name_file), 1);
                delete queue[0];
                queue.splice(0, 1);
                fs.unlinkSync(path_url)
                await run_ffmpeg.kill()
                console.log('Ha terminado el archivo: ' + name_file);
            })
    } catch (error) {

    }
}

setInterval(() => {
    add_videos()
    check_new_videos()
}, 3000);
