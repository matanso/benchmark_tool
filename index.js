/**
 * Created by Matan Sokolovsky on 2/29/2016.
 */

var request = require('request');

function loadTest (url, headers, concurrent, duration) {
    return new Promise((resolve, reject) => {
        let sent = 0;
        let errs = 0;
        let badCodes = 0;
        let avgLatency = 0;
        let active = true;
        if (!concurrent || concurrent <= 0) concurrent = 1;
        function bomb(url, headers) {
            if (active) {
                let now = Date.now();
                request({
                        url,
                        headers
                    },
                    (err, response, body) => {
                        if (err) {
                            errs++;
                        }
                        else {
                            sent++;
                            avgLatency += Date.now() - now;
                            if(response.statusCode < 200 || response.statusCode >= 400) badCodes++;
                        }
                        bomb(url, headers);
                    });
            }
        }

        for (var i = 0; i < concurrent; i++) {
            bomb(url, headers);
        }

        setTimeout(() => {
            active = false;
            resolve({sent, errs, concurrent, duration, badCodes, avgPerSec: sent * 1000 / duration, avgErrPerSec: errs * 1000 / duration, avgLatencyMS: avgLatency / sent});
        }, duration);
    })
}

module.exports = {
    loadTest
};

/*
    EXAMPLE USAGE

loadTest("http://www.google.com, {
    "User-Agent": "GoogleBot 1.0"
}, 1, 10 * 1000).then(console.log);

*/