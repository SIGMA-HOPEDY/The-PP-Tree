let modInfo = {
    name: "The PP Tree",
    author: "sigma",
    pointsName: "points",
    modFiles: ["layers.js", "tree.js"],
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

// ==================== 基础工具函数 ====================

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

// 清理非法升级ID（仅执行一次）
function cleanUpgrades() {
    for (let layer in layers) {
        if (layers[layer].upgrades && player[layer] && player[layer].upgrades) {
            const valid = new Set();
            for (let ten = 1; ten <= 9; ten++) {
                for (let one = 1; one <= 5; one++) {
                    valid.add(ten * 10 + one);
                }
            }
            player[layer].upgrades = player[layer].upgrades.filter(id => valid.has(id));
        }
    }
}

function applySoftcap(gain, threshold, baseExponent, upgrades, hintKey, penalty = 1) {
    let exponentBase = new Decimal(baseExponent);
    
    if (gain.lte(threshold)) {
        if (tmp && tmp.other && hintKey) tmp.other[hintKey] = "";
        return gain;
    }

    let excess = gain.minus(threshold);
    if (excess.lte(0)) return gain;

    let ratio = gain.div(threshold).max(1.0000000001);
    let logGain = ratio.log10();
    let loglogGain = logGain.add(1).log10();
    let exponent = exponentBase.div(new Decimal(9).plus(loglogGain));

    // 应用升级加成
    if (upgrades) {
        for (let upg of upgrades) {
            if (upg.cond()) exponent = exponent.times(upg.mult);
        }
    }

    // 应用额外的惩罚因子
    if (penalty !== 1) {
        exponent = exponent.times(penalty);
    }

    // 安全检查
    if (!exponent.isFinite() || exponent.isNan() || exponent.lte(0)) exponent = new Decimal(0.9);

    let cappedExcess = excess.pow(exponent);
    let result = threshold.plus(cappedExcess);

    // 设置提示
    if (tmp && tmp.other && hintKey) {
        tmp.other[hintKey] = `点数获取大于 ${format(threshold, 3, true)} 后，受到软上限！(^${format(exponent, 9, true)})`;
        if (hintKey === 'softcapHint') tmp.other.softcappedPointGen = result;
    }

    return result;
}

function getTimeCrystalDiscount() {
    let crystals = player.tp?.buyables?.[12] || new Decimal(0);
    return Decimal.pow(crystals.div(114514), crystals);
}

function getTimeCrystalLimitBonus() {
    let crystals = player.tp?.buyables?.[12] || new Decimal(0);
    return crystals;
}

function getTimeFragmentBaseLimit() {
    return new Decimal(100).times(new Decimal(1.425).pow(getTimeCrystalLimitBonus()).add(1));
}

function getEclipseCount() {
    return player.tp?.buyables?.[13] || new Decimal(0);
}

function getEclipseMultiplier(level) {
    let cnt = getEclipseCount();
    if (level === 1) return Decimal.pow(1.01, cnt);
    if (level === 2) return Decimal.pow(1.02, cnt);
    if (level === 3) return Decimal.pow(1.03, cnt);
    return new Decimal(1);
}

function getTimesPowerMultiplier() {
    let tp = player.timesPower;
    if (!tp || !(tp instanceof Decimal)) tp = new Decimal(0);
    let tpr = new Decimal(1.3);
    if (hasUpgrade('tp', 23)) tpr = new Decimal(2.026);
    return tp.add(1).pow(tpr);
}

// ==================== 自动购买相关函数 ====================

// 通用“购买最大数量”逻辑，采用倍增搜索+二分逼近
// 获取购买项上限
function getBuyableLimit(layer, id) {
    // 时间碎片动态上限
    if (layer === 'tp' && id === 11) {
        return getTimeFragmentBaseLimit().floor();
    }
    // 其他购买项如果有 purchaseLimit 属性
    let buyable = layers[layer]?.buyables?.[id];
    if (buyable?.purchaseLimit) {
        return new Decimal(buyable.purchaseLimit);
    }
    return Decimal.infinity;
}

function buyMaxDirect(layer, id) {
    let buyable = layers[layer]?.buyables?.[id];
    if (!buyable || !buyable.unlocked?.()) return;
    let x = player[layer].buyables[id] || new Decimal(0);
    let points = player[layer].points;
    let limit = getBuyableLimit(layer, id);       // 最多能拥有的数量
    let count = 0;
    let totalCost = new Decimal(0);

    while (count < 100) {
        // 达到上限就不再买
        if (x.add(count).gte(limit)) break;

        let nextCost = buyable.cost(x.add(count));
        let newTotal = totalCost.add(nextCost);
        if (points.gte(newTotal)) {
            totalCost = newTotal;
            count++;
        } else {
            break;
        }
    }

    if (count > 0) {
        player[layer].points = points.sub(totalCost);
        player[layer].buyables[id] = x.add(count);
        updateTemp();
    }
}
function autoBuyables() {
    if (!player || !player.ach || !player.p || !player.sp) return;
    if (!hasMilestone('ach', 2)) return;

    buyMaxDirect('p', 11);    // 自增器
    buyMaxDirect('sp', 11);   // 凝聚器
    
    if (hasChallenge('pp', 14)) {   // 只有完成挑战14才自动买时间碎片
        buyMaxDirect('tp', 11);
    }
}

function getPointGen() {
    if (!canGenPoints()) return new Decimal(0);

    // 清理旧升级（仅一次）
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

    // ---- 软上限处理（带提示） ----
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
        { cond: () => hasUpgrade('p', 44), mult: 1.04 },
        { cond: () => hasUpgrade('re', 23), mult: 1.01 },
        { cond: () => hasUpgrade('sa', 32), mult: 1.03 },
    ], 'quadrupleSoftcapHint');

    // 五重软上限（惩罚 0.4）
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
], 'quintupleSoftcapHint', 0.4);   // ← 加入惩罚因子

// 六重软上限（惩罚 0.2）
gain = applySoftcap(gain, new Decimal("1e1e6"), 5.5, [], 'sextupleSoftcapHint', 0.2);

// 七重软上限（惩罚 0.1）
gain = applySoftcap(gain, new Decimal("1e1e7"), 4.5, [], 'septupleSoftcapHint', 0.1);

// 八重软上限（惩罚 0.05）
gain = applySoftcap(gain, new Decimal("1e1e8"), 3.5, [], 'octupleSoftcapHint', 0.05);

// 九重软上限（惩罚 0.025）
gain = applySoftcap(gain, new Decimal("1e1e9"), 2.5, [], 'nonupleSoftcapHint', 0.025);

    return gain;
}



// ==================== 杂项 ====================

var displayThings = [
    function() {
        return '当前残局: 1e720000 点数';
    }
];

function isEndgame() {
    return player.points.gte(new Decimal("1e720000"))
}

var backgroundStyle = {};

function maxTickLength() {
    return 3600;
}

// ==================== 初始化 ====================

// 启动自动购买循环
setInterval(autoBuyables, 500);