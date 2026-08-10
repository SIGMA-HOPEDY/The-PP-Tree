let modInfo = {
    name: "The PP Tree",
    author: "sigma",
    pointsName: "points",
    modFiles: ["globals.js", "layers.js", "tree.js"],
    discordName: "",
    discordLink: "",
    initialStartPoints: new Decimal(0),
    offlineLimit: 5,
}

let VERSION = {
    num: "0.0",
    name: "更新至330成就点(96个成就)",
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
        cleanedUpgrades: false,
        // ── AB 层开关（全局，不受层重置影响）──
        autoPUpgrade: false,
        autoPBuyable: false,
        autoSPUpgrade: false,
        autoSPBuyable: false,
        autoAUpgrade: false,
        autoSAUpgrade: false,
        autoLWUpgrade: false,
        autoREUpgrade: false,
        autoTPFragment: false,
        autoTPCrystalEclipse: false,
        autoMProd: false,
        autoMClass: false,
        // ── CM16 记录 ──
        cm16BestPoints: new Decimal(0),
        cm16BestPointsPerSec: new Decimal(0),

        // 永久解锁标记（对应原来 canClick 中的条件）
        permUP: false,       // 对应 hasMilestone('ach',0)
        permBP1: false,      // 对应 hasMilestone('ach',2)
        permUSP: false,      // 对应 hasMilestone('ach',0)
        permBSP1: false,     // 对应 hasMilestone('ach',2)
        permUA: false,       // 对应 hasMilestone('ach',0)
        permUSA: false,      // 对应 hasMilestone('ach',5) || hasUpgrade('pp',13)
        permULW: false,      // 同上
        permURE: false,      // 同上
        permUTP: false,      // 对应 hasChallenge('pp',14)
        permBTP23: false,    // 对应 hasMilestone('ach',6)
        permBM: false,       // 对应 hasMilestone('m',4)
        permBM4: false       // 对应 hasMilestone('m',5)
    };
}

// ==================== 点数生成 ====================
function getPointGen() {
    if (!canGenPoints()) return new Decimal(0);

    if (!player.cleanedUpgrades) {
        cleanUpgrades();
        player.cleanedUpgrades = true;
    }
let energyFactor = tmp.m?.energyFactor || new Decimal(1);
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
    if (hasUpgrade('a', 33)) gain = gain.times(1e38);
    if (hasUpgrade('tp', 25)) gain = gain.times('1e1000');
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

    // ---- M-22: 将原本弱化/延迟一重软上限的效果转换为直接对 gain 的加成 ----
    if (hasUpgrade('m', 22)) {
         if (hasUpgrade('p', 32)) gain = gain.times(upgradeEffect('p', 32))
         // 延迟类（原 multiply threshold）：改为 gain*effect
        function delay(eff) {
            gain = gain.times(eff);
        }
        // 原本延长一重软上限的升级，现在改为直接乘法
        if (hasUpgrade('sa', 13)) delay(1e9);
        if (hasUpgrade('lw', 13)) delay(1e9);
        if (hasUpgrade('re', 13)) delay(1e9);
        if (hasUpgrade('p', 35)) delay(1e14);
        if (hasMilestone('m', 7)) delay(player.m.mass.add(1).pow(0.01));
        // 弱化类（原 multiply exponent）：改为 gain^effect（但效果^0.5）
        function weaken(eff) {
            let x = Decimal.pow(eff, 0.5); // 效果^0.5
            gain = gain.pow(x);
        }
        if (hasUpgrade('a', 21)) weaken(1.05);
        if (hasUpgrade('sp', 24)) weaken(1.05);
        if (hasUpgrade('sp', 25)) weaken(1.05);
        if (hasUpgrade('sp', 31)) weaken(1.05);
        if (hasUpgrade('a', 31)) weaken(1.05);
        if (hasUpgrade('a', 33)) weaken(1.05);
        if (hasUpgrade('sa', 12)) weaken(1.05);
        if (hasUpgrade('lw', 12)) weaken(1.05);
        if (hasUpgrade('re', 12)) weaken(1.05);
        if (hasUpgrade('p', 35)) weaken(1.14514);
        if (hasUpgrade('tp', 11)) weaken(1.25);
        if (hasUpgrade('tp', 25)) weaken(1.02);
        if (hasUpgrade('pp', 25)) weaken(1.04);
        if (hasUpgrade('p', 44)) weaken(1.04);
        if (hasUpgrade('sa', 23)) weaken(1.01);
        if (hasUpgrade('lw', 23)) weaken(1.01);
        if (hasUpgrade('re', 23)) weaken(1.01);
        weaken(getEclipseMultiplier(1));
    }

    // ---- 指数加成（软上限前） ----
    if (hasUpgrade('pp', 11)) gain = gain.pow(upgradeEffect('pp', 11));
    if (hasUpgrade('pp', 21)) gain = gain.pow(upgradeEffect('pp', 21));
    if (hasUpgrade('p', 45)) gain = gain.pow(upgradeEffect('p', 45));
    if (hasUpgrade('m', 61)) gain = gain.pow(upgradeEffect('m', 61));
    if (player.pr.points.gt(1)) gain = gain.pow(player.pr.points.add(1).pow(2));
    let bestPts = player.cm16BestPoints || new Decimal(0);
    let Ptseff = bestPts.add(1).log10().add(1) || new Decimal(1);
    if (bestPts.gt(1)) gain = gain.pow(Ptseff);
    let bestPps = player.cm16BestPointsPerSec || new Decimal(0);
    let Ppseff = bestPps.add(1).log10().add(1).pow(2) || new Decimal(1);
    if (bestPps.gt(1)) gain = gain.pow(Ppseff);
    let tpDensityEff = tmp.tp?.buyables?.[21]?.effect;
    if (tpDensityEff && tpDensityEff.gt(1)) gain = gain.pow(tpDensityEff);

    // ---- 挑战压缩 ----
    if (player.pp.activeChallenge == 11) gain = gain.pow(0.6);
    if (player.pp.activeChallenge == 12) gain = gain.pow(0.5);
    if (player.pp.activeChallenge == 13) gain = gain.pow(0.4);
    if (player.pp.activeChallenge == 14) gain = gain.pow(0.3);
    if (player.pp.activeChallenge == 15) gain = gain.pow(0.25);
    if (player.pp.activeChallenge == 16) gain = gain.pow(0.009);
    if (player.m.activeChallenge == 11) gain = gain.pow(0.01);
    if (player.m.activeChallenge == 12) gain = gain.pow(0.005);
    if (player.m.activeChallenge == 13) gain = gain.pow(0.0025);
    if (player.m.activeChallenge == 14) gain = gain.add(1).log10();
    if (player.m.activeChallenge == 15) gain = gain.add(1).log10().pow(5);
    if (player.m.activeChallenge == 16) gain = gain.pow(1.25e-7).add(10).log10();
    if (player.m.activeChallenge == 16){
        if (hasUpgrade('PI', 11)) gain = gain.times(2);
    if (hasUpgrade('PI', 12)) gain = gain.times(upgradeEffect('PI', 12));
    if (hasUpgrade('PI', 15)) gain = gain.times(upgradeEffect('PI', 15));
    }
    // ---- 软上限处理 ----

    // 如果 M-22 已购买，跳过一重软上限
    if (!hasUpgrade('m', 22)) {
        // 一重
        let p1 = new Decimal(1e9);
        if (hasUpgrade('sa', 13)) p1 = p1.times(1e9);
        if (hasUpgrade('lw', 13)) p1 = p1.times(1e9);
        if (hasUpgrade('re', 13)) p1 = p1.times(1e9);
        if (hasUpgrade('p', 35)) p1 = p1.times(1e14);
        if (hasMilestone('m', 7))p1=p1.times(player.m.mass.add(1).pow(0.01));
        if (hasUpgrade('sa', 44)) p1 = p1.pow(upgradeEffect('sa', 44));
        if (hasUpgrade('m', 13)) p1 = p1.pow(upgradeEffect('m', 13));
        if (hasChallenge('m', 11))p1=p1.pow(player.points.add(10).log10().pow(0.025));
    if (hasChallenge('m', 13))p1=p1.pow(player.pp.points.add(10).log10().pow(0.05));
        p1 = p1.pow(energyFactor);
        if (player.m.activeChallenge == 15) p1 = p1.log10();
        if (player.m.activeChallenge == 16) p1 = p1.log10().pow(0.2);
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
            { cond: () => player.m.activeChallenge == 16, mult: 0.5 },
            { cond: () => true, mult: getEclipseMultiplier(1) }
        ], 'softcapHint');
        if (hasUpgrade('p', 32)) gain = gain.times(upgradeEffect('p', 32));
    }

    // 二重
    let p2 = new Decimal("1e308");
    if (hasUpgrade('re', 14)) p2 = p2.times(10);
    if (hasUpgrade('sp', 35)) p2 = p2.times(upgradeEffect('sp', 35));
    if (hasMilestone('m', 7))p2=p2.times(player.m.mass.add(1).pow(0.01));
    if (hasUpgrade('sa', 44)) p2 = p2.pow(upgradeEffect('sa', 44));
    if (hasUpgrade('m', 13)) p2 = p2.pow(upgradeEffect('m', 13));
    if (hasUpgrade('m', 22)) p2 = p2.pow(10);
    if (hasChallenge('m', 11))p2=p2.pow(player.points.add(10).log10().pow(0.025));
    if (hasChallenge('m', 13))p2=p2.pow(player.pp.points.add(10).log10().pow(0.05));
   p2 = p2.pow(energyFactor);
   if (player.m.activeChallenge == 15) p2 = p2.log10();
   if (player.m.activeChallenge == 16) p2 = p2.log10().pow(0.2);
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
        { cond: () => player.m.activeChallenge == 16, mult: 0.5 },
        { cond: () => true, mult: getEclipseMultiplier(2) }
    ], 'doubleSoftcapHint');
    if (hasUpgrade('p', 33)) gain = gain.times(upgradeEffect('p', 33));
    if (hasUpgrade('sp', 35)) gain = gain.times(1e38);

    // 三重
    let p3 = new Decimal("1e1000");
    if (hasUpgrade('tp', 12)) p3 = p3.times('1e314');
    if (hasMilestone('m', 7))p3=p3.times(player.m.mass.add(1).pow(0.01));
    if (hasUpgrade('sa', 44)) p3 = p3.pow(upgradeEffect('sa', 44));
    if (hasUpgrade('m', 13)) p3 = p3.pow(upgradeEffect('m', 13));
    if (hasUpgrade('m', 22)) p3 = p3.pow(10);
    if (hasChallenge('m', 13))p3=p3.pow(player.pp.points.add(10).log10().pow(0.05));
    if (hasChallenge('m', 11))p3=p3.pow(player.points.add(10).log10().pow(0.025));
    p3 = p3.pow(energyFactor);
    if (player.m.activeChallenge == 15) p3 = p3.log10();
    if (player.m.activeChallenge == 16) p3 = p3.log10().pow(0.2);
    gain = applySoftcap(gain, p3, 6.9, [
        { cond: () => hasUpgrade('tp', 25), mult: 1.04 },
        { cond: () => hasUpgrade('pp', 12), mult: 1.3 },
        { cond: () => hasUpgrade('pp', 25), mult: 1.02 },
        { cond: () => hasUpgrade('p', 44), mult: 1.04 },
        { cond: () => hasUpgrade('sa', 23), mult: 1.01 },
        { cond: () => hasUpgrade('lw', 23), mult: 1.01 },
        { cond: () => hasUpgrade('re', 23), mult: 1.01 },
        { cond: () => player.m.activeChallenge == 16, mult: 0.5 },
        { cond: () => true, mult: getEclipseMultiplier(3) }
    ], 'tripleSoftcapHint');

    // 四重
    let p4 = new Decimal("1e7000");
    if (hasUpgrade('pp', 14)) p4 = p4.times('1e3000');
    if (hasMilestone('m', 7))p4=p4.times(player.m.mass.add(1).pow(0.01));
    if (hasUpgrade('sa', 44)) p4 = p4.pow(upgradeEffect('sa', 44));
    if (hasUpgrade('m', 13)) p4 = p4.pow(upgradeEffect('m', 13));
    if (hasUpgrade('m', 22)) p4 = p4.pow(10);
    if (hasChallenge('m', 13))p4=p4.pow(player.pp.points.add(10).log10().pow(0.05));
    if (hasChallenge('m', 11))p4=p4.pow(player.points.add(10).log10().pow(0.025));
   p4 = p4.pow(energyFactor);
   if (player.m.activeChallenge == 15) p4 = p4.log10();
   if (player.m.activeChallenge == 16) p4 = p4.log10().pow(0.2);
    gain = applySoftcap(gain, p4, 7.8, [
        { cond: () => hasUpgrade('tp', 25), mult: 1.05 },
        { cond: () => hasUpgrade('pp', 12), mult: 1.4 },
        { cond: () => hasUpgrade('pp', 25), mult: 1.01 },
        { cond: () => hasUpgrade('sa', 23), mult: 1.01 },
        { cond: () => hasUpgrade('lw', 23), mult: 1.01 },
        { cond: () => hasUpgrade('re', 23), mult: 1.01 },
        { cond: () => player.m.activeChallenge == 16, mult: 0.5 },
        { cond: () => hasUpgrade('p', 44), mult: 1.04 },
        { cond: () => hasUpgrade('sa', 32), mult: 1.03 },
    ], 'quadrupleSoftcapHint');

    // 五重
    let p5 = new Decimal("1e50000");
    if (hasMilestone('m', 7))p5=p5.times(player.m.mass.add(1).pow(0.01));
    if (hasUpgrade('sa', 44)) p5 = p5.pow(upgradeEffect('sa', 44));
    if (hasUpgrade('m', 13)) p5 = p5.pow(upgradeEffect('m', 13));
    if (hasUpgrade('m', 22)) p5 = p5.pow(10);
    if (hasChallenge('m', 13))p5=p5.pow(player.pp.points.add(10).log10().pow(0.05));
    if (hasChallenge('m', 11))p5=p5.pow(player.points.add(10).log10().pow(0.025));
    p5 = p5.pow(energyFactor);
    if (player.m.activeChallenge == 15) p5 = p5.log10();
    if (player.m.activeChallenge == 16) p5 = p5.log10().pow(0.2);
    gain = applySoftcap(gain, p5, 6.5, [
        { cond: () => hasUpgrade('p', 43), mult: 2.5 },
        { cond: () => hasUpgrade('p', 44), mult: 1.04 },
        { cond: () => hasUpgrade('sa', 23), mult: 1.01 },
        { cond: () => hasUpgrade('a', 41), mult: 1.16 },
        { cond: () => hasUpgrade('lw', 23), mult: 1.01 },
        { cond: () => hasUpgrade('re', 23), mult: 1.01 },
        { cond: () => hasUpgrade('m', 15), mult: 1.055 },
        { cond: () => player.m.activeChallenge == 16, mult: 0.5 },
        { cond: () => hasUpgrade('sa', 43), mult: 1.05 },
    ], 'quintupleSoftcapHint', 0.4);
    let pen6 = hasUpgrade('m', 22) ? 0.02 : 0.2; 
    let pen7 = hasUpgrade('m', 22) ? 0.01 : 0.1;
    let pen8 = hasUpgrade('m', 22) ? 0.005 : 0.05;
    let pen9 = hasUpgrade('m', 22) ? 0.0025 : 0.025;

    let p6 = new Decimal("1e1e6");
    if (hasUpgrade('m', 14)) p6 = p6.pow(10);
    if (hasUpgrade('m', 22)) p6 = p6.pow(10);
    if (hasChallenge('m', 12)) p6 = p6.pow(player.points.add(10).log10().pow(0.0125));
    if (hasChallenge('m', 13))p6=p6.pow(player.pp.points.add(10).log10().pow(0.05));
    p6 = p6.pow(energyFactor);
    if (player.m.activeChallenge == 15) p6 = p6.log10();
    if (player.m.activeChallenge == 16) p6 = p6.log10().pow(0.2);
    gain = applySoftcap(gain, p6, 5.5, [
         { cond: () => hasUpgrade('m', 34), mult: 25 },
         { cond: () => player.m.activeChallenge == 16, mult: 0.5 },
    ], 'sextupleSoftcapHint', pen6);

    let p7 = new Decimal("1e1e9");
   p7 = p7.pow(energyFactor);
   if (player.m.activeChallenge == 15) p7 = p7.log10();
   if (player.m.activeChallenge == 16) p7 = p7.log10().pow(0.2);
    gain = applySoftcap(gain, p7, 4.5, [{ cond: () => player.m.activeChallenge == 16, mult: 0.5 },], 'septupleSoftcapHint', pen7);

    let p8 = new Decimal("1e1e13");
   p8 = p8.pow(energyFactor);
   if (player.m.activeChallenge == 15) p8 = p8.log10();
   if (player.m.activeChallenge == 16) p8 = p8.log10().pow(0.2);
    gain = applySoftcap(gain, p8, 3.5, [{ cond: () => player.m.activeChallenge == 16, mult: 0.5 },], 'octupleSoftcapHint', pen8);

    let p9 = new Decimal("1e1e25");
    p9 = p9.pow(energyFactor);
    if (player.m.activeChallenge == 15) p9 = p9.log10();
    if (player.m.activeChallenge == 16) p9 = p9.log10().pow(0.2);
    gain = applySoftcap(gain, p9, 2.5, [{ cond: () => player.m.activeChallenge == 16, mult: 0.5 },], 'nonupleSoftcapHint', pen9);

    // ---- CM16 记录最高点数和点数/S ----
    if (player.m.activeChallenge == 16) {
        if (player.points.gt(player.cm16BestPoints)) player.cm16BestPoints = new Decimal(player.points);
        if (gain.gt(player.cm16BestPointsPerSec)) player.cm16BestPointsPerSec = new Decimal(gain);
    }

    return gain;
}

// ==================== 杂项 ====================
var displayThings = [
    function() {
        return '当前残局:达到1e1e20点数';
    }
];

function isEndgame() {
    return player.points.gte(new Decimal("1e1e20"))
}

var backgroundStyle = {};

function maxTickLength() {
    return 3600;
}