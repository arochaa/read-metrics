const hdw = require('node-os-utils');
const fetch = require('node-fetch');
const moment = require('moment');
let cpu = hdw.cpu;
let mem = hdw.mem;
let disco = hdw.drive;
let os = hdw.os;

function convertS(s) {
    var d, h, m, day;
    m = Math.floor(s / 60);
    s = s % 60;
    h = Math.floor(m / 60);
    m = m % 60;
    d = Math.floor(h / 24);
    h = h % 24;
    day = (d > 1 ? 'Days' : 'Day');
    return 'upTime: ' + d + ' ' + day + ', ' + h + ':' + m + ':' + s + '';
};

async function metrics() {
    try {
        const obj = {
            createdAt: moment().toISOString(),
            system: {
                platform: os.platform(),
                upTime: convertS(os.uptime()),
                hostname: os.hostname(),
                type: os.type(),
                arch: os.arch(),
            },
            cpu: {
                vCpu: cpu.count(),
                cpuModel: cpu.model(),
                cpuFree: await cpu.free(),
                cpuUsage: await cpu.usage(),
                cpuLoad: {
                    last1: parseFloat(cpu.loadavgTime(1).toFixed(1)),
                    last5: parseFloat(cpu.loadavgTime(5).toFixed(1)),
                    last15: parseFloat(cpu.loadavgTime(15).toFixed(1)),
                }
            },
            memory: await mem.info(),
            drive: {
                freeDrivePerc: parseFloat((await disco.free()).freePercentage),
                freeDrive: parseFloat((await disco.free()).freeGb),
                totalDrive: parseFloat((await disco.free()).totalGb),
            },
            Process:{

            }
        };
        /**
         * @type {RequestInit}
         */
        const options = {
            method: 'post',
            body: JSON.stringify(obj),
            headers: {
                'Content-Type': 'application/json',
                // Authorization: 'Basic d2VicmlzOnJlZGVkb3JAMjAxOQ=='
            },
        }

        fetch(`http://10.36.143.177:9200/mirth_metrics_desenvolvimento-${moment().format('YYYY[.]MM[.]DD')}/doc`, options)
            .then(res => res.json())
            .then(console.log);
    } catch (err) {
        console.error(err);
    }
}

setInterval(metrics, 3000);