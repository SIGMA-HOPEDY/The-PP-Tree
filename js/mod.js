let modInfo = {
    name: "The PP Tree",
    author: "sigma",
    pointsName: "points",
    modFiles: ["globals.js", "layers.js", "tree.js"],
    discordName: "",
    discordLink: "",
    initialStartPoints: new Decimal(10),
    offlineLimit: 5,
}

let VERSION = {
    num: "0.0",
    name: "nothing",
}

let changelog = `<h1>Changelog:</h1><br>
    <h3>v0.0</h3><br>
        - Added things.<br>
        - Added stuff.`

let winText = `这便是终点...了?`

var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

// 基础
function getStartPoints() {
    return new Decimal(modInfo.initialStartPoints)
}

function canGenPoints() {
    return true
}

function addedPlayerData() {
    return {
        cleanedUpgrades: false
    };
}

// ==================== 自动购买 ====================
function autoBuyables() {
    if (!player || !player.ach || !player.p || !player.sp || !player.tp) return;
    if (!player.sp.buyables) return;          // 新增：防止 buyables 不存在
    if (!hasMilestone('ach', 2)) return;

    // 调用各购买项自带的 buyMax 方法，并检查 unlocked()
    if (layers.p.buyables[11].unlocked()) layers.p.buyables[11].buyMax();
    if (layers.sp.buyables[11].unlocked()) layers.sp.buyables[11].buyMax();

    if (hasChallenge('pp', 14) && layers.tp.buyables[11].unlocked()) {
        layers.tp.buyables[11].buyMax();
    }
}

// ==================== 点数生成 ====================
function getPointGen() {
    if (!canGenPoints()) return new Decimal(0);

    if (!player.cleanedUpgrades) {
        cleanUpgrades();
        player.cleanedUpgrades = true;
    }

    let gain = new Decimal(1);

    // ---- 基础加成 ----
    if (hasUpgrade('p', 11)) gain = gain.times(2);
    if (hasUpgrade('p', 12)) gain = gain.times(upgradeEffect('p', 12));
    if (hasUpgrade('p', 21)) gain = gain.times(upgradeEffect('p', 21));
    if (hasUpgrade('p', 25)) gain = gain.times(upgradeEffect('p', 25));
    if (hasUpgrade('p', 31)) gain = gain.times(upgradeEffect('p', 31));
    if (hasUpgrade('sp', 11)) gain = gain.times(upgradeEffect('sp', 11));
    if (hasUpgrade('sp', 14)) gain = gain.times(upgradeEffect('sp', 14));
    if (hasUpgrade('sp', 15)) gain = gain.times(upgradeEffect('sp', 15));
    if (hasUpgrade('a', 11)) gain = gain.times(upgradeEffect('a', 11));
    if (hasUpgrade('a', 32)) gain = gain.times(1e9);
    if (hasUpgrade('a', 33)) gain = gain.times(1e9);
    if (hasUpgrade('a', 34)) gain = gain.times(upgradeEffect('a', 34));
    if (hasUpgrade('sa', 31)) gain = gain.times(upgradeEffect('sa', 31));

    // ---- 里程碑 ----
    if (hasMilestone('sp', 0)) gain = gain.times(2);
    if (hasMilestone('sp', 2)) gain = gain.times(5);
    if (hasUpgrade('m', 11)) {
    let eff = upgradeEffect('m', 11);
    if (eff.points) gain = gain.times(eff.points);
}
    if (hasMilestone('sp', 5)) gain = gain.times(10);
    if (hasMilestone('a', 0)) gain = gain.times(25);
    if (hasMilestone('lw', 0)) gain = gain.times(100);
    if (hasMilestone('re', 0)) gain = gain.times(100);
    if (hasMilestone('sa', 0)) gain = gain.times(100);
    if (tmp.ach?.effect) gain = gain.times(tmp.ach.effect);

    // ---- 指数加成（软上限前） ----
    if (hasUpgrade('pp', 11)) gain = gain.pow(upgradeEffect('pp', 11));
    if (hasUpgrade('pp', 21)) gain = gain.pow(upgradeEffect('pp', 21));
    if (hasUpgrade('p', 45)) gain = gain.pow(upgradeEffect('p', 45));

    // ---- 挑战压缩 ----
    if (player.pp.activeChallenge == 11) gain = gain.pow(0.6);
    if (player.pp.activeChallenge == 12) gain = gain.pow(0.5);
    if (player.pp.activeChallenge == 13) gain = gain.pow(0.4);
    if (player.pp.activeChallenge == 14) gain = gain.pow(0.3);
    if (player.pp.activeChallenge == 15) gain = gain.pow(0.25);
    // ---- 软上限处理 ----
    // 一重
    let p1 = new Decimal(1e9);
    if (hasUpgrade('sa', 13)) p1 = p1.times(1e9);
    if (hasUpgrade('lw', 13)) p1 = p1.times(1e9);
    if (hasUpgrade('re', 13)) p1 = p1.times(1e9);
    if (hasUpgrade('p', 35)) p1 = p1.times(1e14);
    if (hasUpgrade('sa', 44)) p1 = p1.pow(upgradeEffect('sa', 44));
    gain = applySoftcap(gain, p1, 8.2, [
        { cond: () => hasUpgrade('a', 21), mult: 1.05 },
        { cond: () => hasUpgrade('sp', 24), mult: 1.05 },
        { cond: () => hasUpgrade('sp', 25), mult: 1.05 },
        { cond: () => hasUpgrade('sp', 31), mult: 1.05 },
        { cond: () => hasUpgrade('a', 31), mult: 1.05 },
        { cond: () => hasUpgrade('a', 33), mult: 1.05 },
        { cond: () => hasUpgrade('sa', 12), mult: 1.05 },
        { cond: () => hasUpgrade('lw', 12), mult: 1.05 },
        { cond: () => hasUpgrade('re', 12), mult: 1.05 },
        { cond: () => hasUpgrade('p', 35), mult: 1.14514 },
        { cond: () => hasUpgrade('tp', 11), mult: 1.25 },
        { cond: () => hasUpgrade('tp', 25), mult: 1.02 },
        { cond: () => hasUpgrade('pp', 25), mult: 1.04 },
        { cond: () => hasUpgrade('p', 44), mult: 1.04 },
        { cond: () => hasUpgrade('sa', 23), mult: 1.01 },
        { cond: () => hasUpgrade('lw', 23), mult: 1.01 },
        { cond: () => hasUpgrade('re', 23), mult: 1.01 },
        { cond: () => true, mult: getEclipseMultiplier(1) }
    ], 'softcapHint');
    if (hasUpgrade('p', 32)) gain = gain.times(upgradeEffect('p', 32));

    // 二重
    let p2 = new Decimal("1e308");
    if(hasUpgrade('re', 14)) p2 = p2.times(10);
    if(hasUpgrade('sp', 35)) p2 = p2.times(upgradeEffect('sp', 35));
    if (hasUpgrade('sa', 44)) p2 = p2.pow(upgradeEffect('sa', 44));
    gain = applySoftcap(gain, p2, 8, [
        { cond: () => hasUpgrade('sa', 12), mult: 1.05 },
        { cond: () => hasUpgrade('lw', 12), mult: 1.05 },
        { cond: () => hasUpgrade('re', 12), mult: 1.05 },
        { cond: () => hasUpgrade('sa', 13), mult: 1.01 },
        { cond: () => hasUpgrade('tp', 11), mult: 1.25 },
        { cond: () => hasUpgrade('tp', 25), mult: 1.03 },
        { cond: () => hasUpgrade('pp', 25), mult: 1.03 },
        { cond: () => hasUpgrade('p', 44), mult: 1.04 },
        { cond: () => hasUpgrade('sa', 23), mult: 1.01 },
        { cond: () => hasUpgrade('lw', 23), mult: 1.01 },
        { cond: () => hasUpgrade('re', 23), mult: 1.01 },
        { cond: () => true, mult: getEclipseMultiplier(2) }
    ], 'doubleSoftcapHint');
    if (hasUpgrade('p', 33)) gain = gain.times(upgradeEffect('p', 33));
    if (hasUpgrade('sp', 35)) gain = gain.times(upgradeEffect('sp', 35));

    // 三重
    let p3 = new Decimal("1e1000");
    if(hasUpgrade('tp', 12)) p3 = p3.times('1e314');
    if (hasUpgrade('sa', 44)) p3 = p3.pow(upgradeEffect('sa', 44));
    gain = applySoftcap(gain, p3, 6.9, [
        { cond: () => hasUpgrade('tp', 25), mult: 1.04 },
        { cond: () => hasUpgrade('pp', 12), mult: 1.3 },
        { cond: () => hasUpgrade('pp', 25), mult: 1.02 },
        { cond: () => hasUpgrade('p', 44), mult: 1.04 },
        { cond: () => hasUpgrade('sa', 23), mult: 1.01 },
        { cond: () => hasUpgrade('lw', 23), mult: 1.01 },
        { cond: () => hasUpgrade('re', 23), mult: 1.01 },
        { cond: () => true, mult: getEclipseMultiplier(3) }
    ], 'tripleSoftcapHint');

    // 四重
    let p4 = new Decimal("1e7000");
    if(hasUpgrade('pp', 14)) p4 = p4.times('1e3000');
    if (hasUpgrade('sa', 44)) p4 = p4.pow(upgradeEffect('sa', 44));
    gain = applySoftcap(gain, p4, 7.8, [
        { cond: () => hasUpgrade('tp', 25), mult: 1.05 },
        { cond: () => hasUpgrade('pp', 12), mult: 1.4 },
        { cond: () => hasUpgrade('pp', 25), mult: 1.01 },
        { cond: () => hasUpgrade('sa', 23), mult: 1.01 },
        { cond: () => hasUpgrade('lw', 23), mult: 1.01 },
        { cond: () => hasUpgrade('re', 23), mult: 1.01 },
        { cond: () => hasUpgrade('p', 44), mult: 1.04 },
        { cond: () => hasUpgrade('sa', 32), mult: 1.03 },
    ], 'quadrupleSoftcapHint');

    // 五重（加强惩罚）
    let p5 = new Decimal("1e50000");
    if (hasUpgrade('sa', 44)) p5 = p5.pow(upgradeEffect('sa', 44));
    gain = applySoftcap(gain, p5, 6.5, [
        { cond: () => hasUpgrade('p', 43), mult: 1.5 },
        { cond: () => hasUpgrade('p', 44), mult: 1.04 },
        { cond: () => hasUpgrade('sa', 23), mult: 1.01 },
        { cond: () => hasUpgrade('a', 41), mult: 1.16 },
        { cond: () => hasUpgrade('lw', 23), mult: 1.01 },
        { cond: () => hasUpgrade('re', 23), mult: 1.01 },
        { cond: () => hasUpgrade('sa', 43), mult: 1.05 },
    ], 'quintupleSoftcapHint', 0.4);

    // 六～九重（递增惩罚）
    gain = applySoftcap(gain, new Decimal("1e1e6"), 5.5, [], 'sextupleSoftcapHint', 0.2);
    gain = applySoftcap(gain, new Decimal("1e1e7"), 4.5, [], 'septupleSoftcapHint', 0.1);
    gain = applySoftcap(gain, new Decimal("1e1e8"), 3.5, [], 'octupleSoftcapHint', 0.05);
    gain = applySoftcap(gain, new Decimal("1e1e9"), 2.5, [], 'nonupleSoftcapHint', 0.025);

    return gain;
}

// ==================== 杂项 ====================
var displayThings = [
    function() {
        return '当前残局:1e1000000点数+200成就点';
    }
];

function isEndgame() {
    return player.points.gte(new Decimal("1e1000000"))
}

var backgroundStyle = {};

function maxTickLength() {
    return 3600;
}

// 启动自动购买循环
setInterval(autoBuyables, 100);