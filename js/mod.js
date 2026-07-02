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
    name: "Literally nothing",
}

let changelog = `<h1>Changelog:</h1><br>
    <h3>v0.0</h3><br>
        - Added things.<br>
        - Added stuff.`

let winText = `这便是终点...了?`

var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints() {
    return new Decimal(modInfo.initialStartPoints)
}

function canGenPoints() {
    return true
}

function addedPlayerData() {
    return {
        cleanedUpgrades: false   // 新增：升级清理标志
    };
}
// 清理非法升级ID（仅保留 11‑15, 21‑25, 31‑35 … 格式）
function cleanUpgrades() {
    for (let layer in layers) {
        if (layers[layer].upgrades) {
            const upgradeKeys = Object.keys(layers[layer].upgrades);
            // 构建合法ID集合（十位1‑9，个位1‑5）
            const valid = new Set();
            for (let ten = 1; ten <= 3; ten++) {
                for (let one = 1; one <= 5; one++) {
                    valid.add(ten * 10 + one);
                }
            }
            // 过滤玩家已购买的升级
            if (player[layer] && player[layer].upgrades) {
                player[layer].upgrades = player[layer].upgrades.filter(id => valid.has(id));
            }
        }
    }
}

function getPointGen() {
      // 一次性清理旧升级
    if (!player.cleanedUpgrades) {
        cleanUpgrades();
        player.cleanedUpgrades = true;
    }
    if (!canGenPoints()) return new Decimal(0);

    function isValidDecimal(v) {
        return v instanceof Decimal && v.isFinite() && !v.isNan();
    }

    let gain = new Decimal(1);
    if (hasUpgrade('p', 11)) gain = gain.times(2);
    if (hasUpgrade('p', 12)) gain = gain.times(upgradeEffect('p', 12));
    if (hasUpgrade('p', 21)) gain = gain.times(upgradeEffect('p', 21));
    if (hasUpgrade('p', 25)) gain = gain.times(upgradeEffect('p', 25));
    if (hasUpgrade('p', 31)) gain = gain.times(upgradeEffect('p', 31));
    if (hasUpgrade('sp', 11)) gain = gain.times(upgradeEffect('sp', 11));
    if (hasUpgrade('sp', 14)) gain = gain.times(upgradeEffect('sp', 14));
    if (hasUpgrade('sp', 15)) gain = gain.times(upgradeEffect('sp', 15)); // 修复为15
    if (hasUpgrade('a', 11)) gain = gain.times(upgradeEffect('a', 11));
    if (hasUpgrade('a', 32)) gain = gain.times(1e9);
    if (hasUpgrade('a', 33)) gain = gain.times(1e9);
    if (hasUpgrade('a', 34)) gain = gain.times(upgradeEffect('a', 34));
    if (hasMilestone('sp', 0)) gain = gain.times(2);
    if (hasMilestone('sp', 2)) gain = gain.times(5);
    if (hasMilestone('sp', 5)) gain = gain.times(10);
    if (hasMilestone('a', 0)) gain = gain.times(25);
    if (hasMilestone('lw', 0)) gain = gain.times(100);
    if (hasMilestone('re', 0)) gain = gain.times(100);
    if (hasMilestone('sa', 0)) gain = gain.times(100);
    if (hasUpgrade('pp', 11)) gain = gain.pow(upgradeEffect('pp', 11));
    if (hasUpgrade('pp', 21)) gain = gain.pow(upgradeEffect('pp', 21));
    if (hasUpgrade('p', 45)) gain = gain.pow(upgradeEffect('p', 45));

    if (player.pp.activeChallenge == 11) gain = gain.pow(0.6);
    if (player.pp.activeChallenge == 12) gain = gain.pow(0.5);

    // 一重软上限
    let pointmax = new Decimal(1e9);
    if (hasUpgrade('sa', 13)) pointmax = pointmax.times(1e9);
    if (hasUpgrade('lw', 13)) pointmax = pointmax.times(1e9);
    if (hasUpgrade('re', 13)) pointmax = pointmax.times(1e9);
    if (hasUpgrade('p', 35)) pointmax = pointmax.times(1e14);
    const softcapThreshold = new Decimal(pointmax);

    let postSoftcapGain;
    if (gain.gt(softcapThreshold) && isValidDecimal(gain)) {
        let excess = gain.minus(softcapThreshold);
        if (excess.lte(0)) {
            postSoftcapGain = gain;
        } else {
            let ratio = gain.div(softcapThreshold);
            if (ratio.lte(1)) ratio = new Decimal(1.0000000001);
            let Log10Gain = ratio.log10();
            let Log10Log10Gain = Log10Gain.log10();
            if (!isValidDecimal(Log10Log10Gain)) {
                postSoftcapGain = softcapThreshold.plus(excess);
            } else {
                let exponent = new Decimal(8.2).div(new Decimal(9).plus(Log10Log10Gain));
                if (hasUpgrade('a', 21)) exponent = exponent.times(1.05); // a-61->21
                if (hasUpgrade('sp', 24)) exponent = exponent.times(1.05);
                if (hasUpgrade('sp', 25)) exponent = exponent.times(1.05);
                if (hasUpgrade('sp', 31)) exponent = exponent.times(1.05);
                if (hasUpgrade('a', 31)) exponent = exponent.times(1.05); // a-71->31
                if (hasUpgrade('a', 33)) exponent = exponent.times(1.05);
                if (hasUpgrade('sa', 12)) exponent = exponent.times(1.05);
                if (hasUpgrade('lw', 12)) exponent = exponent.times(1.05);
                if (hasUpgrade('re', 12)) exponent = exponent.times(1.05);
                if (hasUpgrade('p', 35)) exponent = exponent.times(1.14514);
                if (hasUpgrade('tp', 11)) exponent = exponent.times(1.25);
                if (hasUpgrade('tp', 25)) exponent = exponent.times(1.02);
                if (hasUpgrade('pp', 25)) exponent = exponent.times(1.04);
                if (hasUpgrade('p', 44)) exponent = exponent.times(1.04);
                let eclipseMult1 = getEclipseMultiplier(1);
                exponent = exponent.times(eclipseMult1);
                if (!isValidDecimal(exponent) || exponent.lte(0)) exponent = new Decimal(0.9);
                let cappedExcess = excess.pow(exponent);
                if (!isValidDecimal(cappedExcess)) cappedExcess = excess;
                postSoftcapGain = softcapThreshold.plus(cappedExcess);
                if (hasUpgrade('p', 32)) postSoftcapGain = postSoftcapGain.times(upgradeEffect('p', 32));
                if (tmp && tmp.other) {
                    tmp.other.softcapHint = "点数获取大于" + format(pointmax,3,true) + "后,受到软上限!(^" + format(exponent,9,true) + ")";
                    tmp.other.softcappedPointGen = postSoftcapGain;
                }
            }
        }
    } else {
        postSoftcapGain = gain;
        if (tmp && tmp.other) {
            tmp.other.softcapHint = "";
            tmp.other.softcappedPointGen = gain;
        }
    }

    // 二重软上限
    let doublepointmax = new Decimal("1e308");
    if (hasUpgrade('re', 14)) doublepointmax = doublepointmax.times(10);
    if (hasUpgrade('sp', 35)) doublepointmax = doublepointmax.times(upgradeEffect('sp', 35));
    const doubleSoftcapThreshold = new Decimal(doublepointmax);
    let doubleCappedGain;
    if (postSoftcapGain.gt(doubleSoftcapThreshold)) {
        let doubleExcess = postSoftcapGain.minus(doubleSoftcapThreshold);
        let Log10Post = (postSoftcapGain.div(doublepointmax).add(1)).log10();
        let Log10Log10Post = (Log10Post.add(1)).log10();
        let doubleExponent = new Decimal(8).div(new Decimal(9.1).plus(Log10Log10Post));
        if (hasUpgrade('sa', 12)) doubleExponent = doubleExponent.times(1.05);
        if (hasUpgrade('lw', 12)) doubleExponent = doubleExponent.times(1.05);
        if (hasUpgrade('re', 12)) doubleExponent = doubleExponent.times(1.05);
        if (hasUpgrade('sa', 13)) doubleExponent = doubleExponent.times(1.01);
        if (hasUpgrade('tp', 11)) doubleExponent = doubleExponent.times(1.25);
        if (hasUpgrade('tp', 25)) doubleExponent = doubleExponent.times(1.03);
        if (hasUpgrade('pp', 25)) doubleExponent = doubleExponent.times(1.03);
        if (hasUpgrade('p', 44)) doubleExponent = doubleExponent.times(1.04);
        let eclipseMult2 = getEclipseMultiplier(2);
        doubleExponent = doubleExponent.times(eclipseMult2);
        let doubleCappedExcess = doubleExcess.pow(doubleExponent);
        doubleCappedGain = doubleSoftcapThreshold.plus(doubleCappedExcess);
        if (hasUpgrade('p', 33)) doubleCappedGain = doubleCappedGain.times(upgradeEffect('p', 33));
        if (hasUpgrade('sp', 35)) doubleCappedGain = doubleCappedGain.times(upgradeEffect('sp', 35));
        if (tmp && tmp.other) {
            tmp.other.doubleSoftcapHint = "点数获取大于" + format(doublepointmax,3,true) + "后,受到二重软上限!(^" + format(doubleExponent,9,true) + ")";
        }
    } else {
        if (tmp && tmp.other) tmp.other.doubleSoftcapHint = "";
        doubleCappedGain = postSoftcapGain;
    }

    // 三重软上限
    let triplepointmax = new Decimal("1e1000");
    if (hasUpgrade('tp', 12)) triplepointmax = triplepointmax.times('1e314');
    const tripleSoftcapThreshold = new Decimal(triplepointmax);
    let tripleCappedGain;
    if (doubleCappedGain.gt(tripleSoftcapThreshold)) {
        let tripleExcess = doubleCappedGain.minus(tripleSoftcapThreshold);
        let Log10PostTriple = (doubleCappedGain.div(triplepointmax).add(1)).log10();
        let Log10Log10PostTriple = (Log10PostTriple.add(1)).log10();
        let tripleExponent = new Decimal(6.9).div(new Decimal(10.78).plus(Log10Log10PostTriple));
        if (hasUpgrade('tp', 25)) tripleExponent = tripleExponent.times(1.04);
        if (hasUpgrade('pp', 12)) tripleExponent = tripleExponent.times(1.3);
        if (hasUpgrade('pp', 25)) tripleExponent = tripleExponent.times(1.02);
        if (hasUpgrade('p', 44)) tripleExponent = tripleExponent.times(1.04);
        let eclipseMult3 = getEclipseMultiplier(3);
        tripleExponent = tripleExponent.times(eclipseMult3);
        let tripleCappedExcess = tripleExcess.pow(tripleExponent);
        tripleCappedGain = tripleSoftcapThreshold.plus(tripleCappedExcess);
        if (tmp && tmp.other) {
            tmp.other.tripleSoftcapHint = "点数获取大于" + format(triplepointmax,3,true) + "后,受到三重软上限!(^" + format(tripleExponent,9,true) + ")";
        }
    } else {
        if (tmp && tmp.other) tmp.other.tripleSoftcapHint = "";
        tripleCappedGain = doubleCappedGain;
    }

    // 四重软上限
    let quadruplepointmax = new Decimal("1e7000");
    if (hasUpgrade('pp', 14)) quadruplepointmax = quadruplepointmax.times('1e3000');
    const quadrupleSoftcapThreshold = new Decimal(quadruplepointmax);
    let quadrupleCappedGain;
    if (tripleCappedGain.gt(quadrupleSoftcapThreshold)) {
        let quadrupleExcess = tripleCappedGain.minus(quadrupleSoftcapThreshold);
        let Log10PostQuad = (tripleCappedGain.div(quadruplepointmax).add(1)).log10();
        let Log10Log10PostQuad = (Log10PostQuad.add(1)).log10();
        let quadrupleExponent = new Decimal(7.8).div(new Decimal(17).plus(Log10Log10PostQuad));
        if (hasUpgrade('tp', 25)) quadrupleExponent = quadrupleExponent.times(1.05);
        if (hasUpgrade('pp', 12)) quadrupleExponent = quadrupleExponent.times(1.4);
        if (hasUpgrade('pp', 25)) quadrupleExponent = quadrupleExponent.times(1.01);
        if (hasUpgrade('p', 44)) quadrupleExponent = quadrupleExponent.times(1.04);
        let quadrupleCappedExcess = quadrupleExcess.pow(quadrupleExponent);
        quadrupleCappedGain = quadrupleSoftcapThreshold.plus(quadrupleCappedExcess);
        if (tmp && tmp.other) {
            tmp.other.quadrupleSoftcapHint = "点数获取大于" + format(quadruplepointmax,3,true) + "后,受到四重软上限!(^" + format(quadrupleExponent,9,true) + ")";
        }
    } else {
        if (tmp && tmp.other) tmp.other.quadrupleSoftcapHint = "";
        quadrupleCappedGain = tripleCappedGain;
    }

    // 五重软上限
    let quintuplePointMax = new Decimal("1e50000");
    const quintupleSoftcapThreshold = new Decimal(quintuplePointMax);
    let quintupleCappedGain;
    if (quadrupleCappedGain.gt(quintupleSoftcapThreshold)) {
        let quintupleExcess = quadrupleCappedGain.minus(quintupleSoftcapThreshold);
        let Log10PostQuint = (quadrupleCappedGain.div(quintuplePointMax).add(1)).log10();
        let Log10Log10PostQuint = (Log10PostQuint.add(1)).log10();
        let quintupleExponent = new Decimal(6.5).div(new Decimal(25).plus(Log10Log10PostQuint));
        if (hasUpgrade('p', 43)) quintupleExponent = quintupleExponent.times(2);
        if (hasUpgrade('p', 44)) quintupleExponent = quintupleExponent.times(1.04);
        let quintupleCappedExcess = quintupleExcess.pow(quintupleExponent);
        quintupleCappedGain = quintupleSoftcapThreshold.plus(quintupleCappedExcess);
        if (tmp && tmp.other) {
            tmp.other.quintupleSoftcapHint = "点数获取大于" + format(quintuplePointMax,3,true) + "后,受到五重软上限!(^" + format(quintupleExponent,9,true) + ")";
        }
    } else {
        if (tmp && tmp.other) tmp.other.quintupleSoftcapHint = "";
        quintupleCappedGain = quadrupleCappedGain;
    }

    // 六重软上限
    let sextuplePointMax = new Decimal("1e1e6");
    const sextupleSoftcapThreshold = new Decimal(sextuplePointMax);
    let sextupleCappedGain;
    if (quintupleCappedGain.gt(sextupleSoftcapThreshold)) {
        let sextupleExcess = quintupleCappedGain.minus(sextupleSoftcapThreshold);
        let Log10PostSext = (quintupleCappedGain.div(sextuplePointMax).add(1)).log10();
        let Log10Log10PostSext = (Log10PostSext.add(1)).log10();
        let sextupleExponent = new Decimal(5.5).div(new Decimal(35).plus(Log10Log10PostSext));
        let sextupleCappedExcess = sextupleExcess.pow(sextupleExponent);
        sextupleCappedGain = sextupleSoftcapThreshold.plus(sextupleCappedExcess);
        if (tmp && tmp.other) {
            tmp.other.sextupleSoftcapHint = "点数获取大于" + format(sextuplePointMax,3,true) + "后,受到六重软上限!(^" + format(sextupleExponent,9,true) + ")";
        }
    } else {
        if (tmp && tmp.other) tmp.other.sextupleSoftcapHint = "";
        sextupleCappedGain = quintupleCappedGain;
    }

    // 七重软上限
    let septuplePointMax = new Decimal("1e1e7");
    const septupleSoftcapThreshold = new Decimal(septuplePointMax);
    let septupleCappedGain;
    if (sextupleCappedGain.gt(septupleSoftcapThreshold)) {
        let septupleExcess = sextupleCappedGain.minus(septupleSoftcapThreshold);
        let Log10PostSept = (sextupleCappedGain.div(septuplePointMax).add(1)).log10();
        let Log10Log10PostSept = (Log10PostSept.add(1)).log10();
        let septupleExponent = new Decimal(4.5).div(new Decimal(50).plus(Log10Log10PostSept));
        let septupleCappedExcess = septupleExcess.pow(septupleExponent);
        septupleCappedGain = septupleSoftcapThreshold.plus(septupleCappedExcess);
        if (tmp && tmp.other) {
            tmp.other.septupleSoftcapHint = "点数获取大于" + format(septuplePointMax,3,true) + "后,受到七重软上限!(^" + format(septupleExponent,9,true) + ")";
        }
    } else {
        if (tmp && tmp.other) tmp.other.septupleSoftcapHint = "";
        septupleCappedGain = sextupleCappedGain;
    }

    // 八重软上限
    let octuplePointMax = new Decimal("1e1e8");
    const octupleSoftcapThreshold = new Decimal(octuplePointMax);
    let octupleCappedGain;
    if (septupleCappedGain.gt(octupleSoftcapThreshold)) {
        let octupleExcess = septupleCappedGain.minus(octupleSoftcapThreshold);
        let Log10PostOct = (septupleCappedGain.div(octuplePointMax).add(1)).log10();
        let Log10Log10PostOct = (Log10PostOct.add(1)).log10();
        let octupleExponent = new Decimal(3.5).div(new Decimal(70).plus(Log10Log10PostOct));
        let octupleCappedExcess = octupleExcess.pow(octupleExponent);
        octupleCappedGain = octupleSoftcapThreshold.plus(octupleCappedExcess);
        if (tmp && tmp.other) {
            tmp.other.octupleSoftcapHint = "点数获取大于" + format(octuplePointMax,3,true) + "后,受到八重软上限!(^" + format(octupleExponent,9,true) + ")";
        }
    } else {
        if (tmp && tmp.other) tmp.other.octupleSoftcapHint = "";
        octupleCappedGain = septupleCappedGain;
    }

    // 九重软上限
    let nonuplePointMax = new Decimal("1e1e9");
    const nonupleSoftcapThreshold = new Decimal(nonuplePointMax);
    let nonupleCappedGain;
    if (octupleCappedGain.gt(nonupleSoftcapThreshold)) {
        let nonupleExcess = octupleCappedGain.minus(nonupleSoftcapThreshold);
        let Log10PostNon = (octupleCappedGain.div(nonuplePointMax).add(1)).log10();
        let Log10Log10PostNon = (Log10PostNon.add(1)).log10();
        let nonupleExponent = new Decimal(2.5).div(new Decimal(100).plus(Log10Log10PostNon));
        let nonupleCappedExcess = nonupleExcess.pow(nonupleExponent);
        nonupleCappedGain = nonupleSoftcapThreshold.plus(nonupleCappedExcess);
        if (tmp && tmp.other) {
            tmp.other.nonupleSoftcapHint = "点数获取大于" + format(nonuplePointMax,3,true) + "后,受到九重软上限!(^" + format(nonupleExponent,9,true) + ")";
        }
    } else {
        if (tmp && tmp.other) tmp.other.nonupleSoftcapHint = "";
        nonupleCappedGain = octupleCappedGain;
    }

    return nonupleCappedGain;
}

var displayThings = [];

function isEndgame() {
    return player.points.gte(new Decimal("1e50000"))
}

var backgroundStyle = {};

function maxTickLength() {
    return 3600;
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