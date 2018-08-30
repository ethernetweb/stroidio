var serverData = {
    "serverTimeMS": Date.now(),
    "serverStartStamp": Date.now(),
    "serverUpdateRate": 20,
    "fixedUpdateRate": 60,
    "lastFixedUpdate": Date.now(),
    "bullets": [],
    "players": {},
    "limitX": 3840 - 20,
    "limitY": 2160 - 20,
};
module.exports = serverData;
