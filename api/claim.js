const indexjs = require("../index.js");
const fs = require("fs");
const moment = require("moment");

module.exports.load = async function (app, db) {
    app.get("/claim", async (req, res) => {
        if (!req.session.pterodactyl) return res.redirect("/login");

        let theme = indexjs.get(req);

        // Check if claiming is enabled in settings
        let settings = JSON.parse(fs.readFileSync("./settings.json").toString());
        if (!settings.claiming.enabled) {
            return res.send("Claiming is currently disabled.");
        }

        // Check if the user has already claimed coins on the current day
        let lastClaimDate = await db.get("lastClaimDate-" + req.session.userinfo.id) || null;
        let currentDate = moment().format("YYYY-MM-DD");

        if (lastClaimDate === currentDate) {
            return res.send("You have already claimed your coins today.");
        }

        // Update last claim date for the user
        await db.set("lastClaimDate-" + req.session.userinfo.id, currentDate);

        // ... Rest of your existing code

        // Award coins for the claim
        let coinsPerClaim = settings.claiming.coinsPerClaim || 20;
        let coins = await db.get("coins-" + req.session.userinfo.id) || 0;
        coins = coins + coinsPerClaim;
        await db.set("coins-" + req.session.userinfo.id, coins);

        res.send(`You have successfully claimed ${coinsPerClaim} coins.`);

        let newSettings = JSON.parse(fs.readFileSync("./settings.json").toString());
    });
};
