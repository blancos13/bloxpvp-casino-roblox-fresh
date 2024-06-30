const captcha = require("hcaptcha");
const config = require("./config");

class HCaptcha {
    constructor() { }

    async verify(token) {
        return new Promise((res, rej) => {
            captcha.verify(config.HCAPTCHA_SECRET, token)
                .then((data) => {
                    if (data.success == true) {
                        console.log(`[${token}]: HCaptcha Verified`, data);
                        res([true, data])
                    } else {
                        res([false, data])
                    }
                })
                .catch(err => {
                    // weird fucking error
                    console.log(err)
                    rej(err)
                });
        })
    }
}

// const verified = await HCaptcha.verify("000-000-000")
// console.log(verified[0], verified[1])

module.exports = new HCaptcha();