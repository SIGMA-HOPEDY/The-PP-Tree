let modInfo = {
    name: "The ??? Tree",
    author: "sigma",
    pointsName: "微小点数",
    modFiles: ["globals.js", "layers.js", "tree.js", 'ach.js'],
    discordName: "",
    discordLink: "",
    initialStartPoints: new Decimal(0),
    offlineLimit: 5,
}

let VERSION = {
    num: "0.1",
    name: "当前残局:达e1e64点数",
}
let changelog = `<h1>Changelog:</h1><br>
    <h3>v0.1</h3><br>
        - 新增升级<br>
        - 增加成就<br>
        - 调整平衡<br>
    <h3>v0.0</h3><br>
        - Added things.<br>
        - Added stuff.`
let winText = `这便是终点...了?`

var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]
function fixOldSave(oldVersion) {
    // 可留空，若需要兼容旧版本可在此添加修复逻辑
}
// 基础
function getStartPoints() {
    return new Decimal(modInfo.initialStartPoints)
}

function canGenPoints() {
    return true
}

function addedPlayerData() {
    return {
    };
}
function getPointGen() {
    if (!canGenPoints()) return new Decimal(0);
    let gain = new Decimal(0);
    return gain;
}

// ==================== 杂项 ====================
var displayThings = [
    function() {
        return '当前残局:???';
    }
];

function isEndgame() {
    return player.points.gte(new Decimal("1e1e64"))
}

var backgroundStyle = {};

function maxTickLength() {
    return 36000;
}