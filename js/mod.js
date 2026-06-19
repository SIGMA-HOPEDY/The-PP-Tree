let modInfo = {
    name: "The Particle Tree",
    author: "sigma",
    pointsName: "Particles",
    modFiles: ["layers.js", "tree.js"],

    discordName: "",
    discordLink: "",
    initialStartPoints: new Decimal (0),
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

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

function canGenPoints(){
    return true
}

function addedPlayerData() {
    return {

    };
}
function getPointGen() {
    if (!canGenPoints()) return new Decimal(0);

    let gain = new Decimal(0);
    if (hasUpgrade('A', 11)) gain = gain.add(upgradeEffect('A', 11));
    if (hasUpgrade('A', 12)) gain = gain.add(upgradeEffect('A', 12));
    if (hasUpgrade('A', 13)) gain = gain.add(upgradeEffect('A', 13));

    if (hasBuyables('A', 11)) gain = gain.add(buyableEffect('A', 11));
    if (hasBuyables('A', 12)) gain = gain.times(buyableEffect('A', 12));
    if (hasBuyables('A', 13)) gain = gain.pow(buyableEffect('A', 13));

    function isValidDecimal(v) {
        return v instanceof Decimal && v.isFinite() && !v.isNan();
    }

    let pointmax = new Decimal(1e9);
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
                let eclipseMult1 = getEclipseMultiplier(1);
                exponent = exponent.times(eclipseMult1);
                if (!isValidDecimal(exponent) || exponent.lte(0)) {
                    exponent = new Decimal(0.9);
                }

                let cappedExcess = excess.pow(exponent);
                if (!isValidDecimal(cappedExcess)) {
                    cappedExcess = excess;
                }
                postSoftcapGain = softcapThreshold.plus(cappedExcess);
                if (tmp && tmp.other) {
                    tmp.other.softcapHint = "由于你的粒子获取大于" + pointmax + ",粒子获取受到软上限!（效果：超过部分^" + exponent + "）";
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

    let doublepointmax = new Decimal("1e308");
    const doubleSoftcapThreshold = new Decimal(doublepointmax);
    let doubleCappedGain;
    if (postSoftcapGain.gt(doubleSoftcapThreshold)) {
        let doubleExcess = postSoftcapGain.minus(doubleSoftcapThreshold);
        let Log10Post = (postSoftcapGain.div(doublepointmax).add(1)).log10();
        let Log10Log10Post = (Log10Post.add(1)).log10();
        let doubleExponent = new Decimal(8).div(new Decimal(9.1).plus(Log10Log10Post));
        let eclipseMult2 = getEclipseMultiplier(2);
        doubleExponent = doubleExponent.times(eclipseMult2);
        let doubleCappedExcess = doubleExcess.pow(doubleExponent);
        doubleCappedGain = doubleSoftcapThreshold.plus(doubleCappedExcess);
        if (tmp && tmp.other) {
            tmp.other.doubleSoftcapHint = "由于你的粒子获取大于"+ doublepointmax+",粒子获取受到二重软上限!(效果：超过部分^" + doubleExponent + ")";
        }
    } else {
        if (tmp && tmp.other) {
            tmp.other.doubleSoftcapHint = "";
        }
        doubleCappedGain = postSoftcapGain;
    }

    let triplepointmax = new Decimal("1e1000");
    const tripleSoftcapThreshold = new Decimal(triplepointmax);
    if (doubleCappedGain.gt(tripleSoftcapThreshold)) {
        let tripleExcess = doubleCappedGain.minus(tripleSoftcapThreshold);
        let Log10PostTriple = (doubleCappedGain.div(triplepointmax).add(1)).log10();
        let Log10Log10PostTriple = (Log10PostTriple.add(1)).log10();
        let tripleExponent = new Decimal(6.9).div(new Decimal(10.78).plus(Log10Log10PostTriple));
        let eclipseMult3 = getEclipseMultiplier(3);
        tripleExponent = tripleExponent.times(eclipseMult3);
        let tripleCappedExcess = tripleExcess.pow(tripleExponent);
        let tripleCappedGain = tripleSoftcapThreshold.plus(tripleCappedExcess);
        if (tmp && tmp.other) {
            tmp.other.tripleSoftcapHint = "由于你的粒子获取大于"+ triplepointmax+",粒子获取受到三重软上限!(效果：超过部分^" + tripleExponent + ")";
        }

        let quadruplepointmax = new Decimal("1e7000");
        const quadrupleSoftcapThreshold = new Decimal(quadruplepointmax);
        if (tripleCappedGain.gt(quadrupleSoftcapThreshold)) {
            let quadrupleExcess = tripleCappedGain.minus(quadrupleSoftcapThreshold);
            let Log10PostQuad = (tripleCappedGain.div(quadruplepointmax).add(1)).log10();
            let Log10Log10PostQuad = (Log10PostQuad.add(1)).log10();
            let quadrupleExponent = new Decimal(7.8).div(new Decimal(17).plus(Log10Log10PostQuad));
            let quadrupleCappedExcess = quadrupleExcess.pow(quadrupleExponent);
            let quadrupleCappedGain = quadrupleSoftcapThreshold.plus(quadrupleCappedExcess);
            if (tmp && tmp.other) {
                tmp.other.quadrupleSoftcapHint = "由于你的粒子获取大于" + quadruplepointmax + ",粒子获取受到四重软上限!(效果：超过部分^" + quadrupleExponent + ")";
            }
            return quadrupleCappedGain;
        } else {
            if (tmp && tmp.other) {
                tmp.other.quadrupleSoftcapHint = "";
            }
            return tripleCappedGain;
        }
    } else {
        if (tmp && tmp.other) {
            tmp.other.tripleSoftcapHint = "";
        }
        return doubleCappedGain;
    }
}
// 辅助函数：检查是否拥有指定 buyable
function hasBuyables(layer, id) {
    let amt = player[layer]?.buyables?.[id];
    return amt instanceof Decimal ? amt.gt(0) : false;
}



function getLimit() {
    return new Decimal(100)
}

function getEclipseCount() {
    return player.A?.buyables?.[13] || new Decimal(0);
}

function getEclipseMultiplier(level) {
    let cnt = getEclipseCount();
    if (level === 1) return Decimal.pow(1.01, cnt);
    if (level === 2) return Decimal.pow(1.02, cnt);
    if (level === 3) return Decimal.pow(1.03, cnt);
    return new Decimal(1);
}



var displayThings = [
]

function isEndgame() {
    return player.points.gte(new Decimal("1e114514"))
}

var backgroundStyle = {

}

function maxTickLength() {
    return 3600
}

Vue.component('times-power-display', {
    template: `
        <div style="margin: 10px 0;">
            时间之力: {{format(player.timesPower || new Decimal(0))}}<br>
            TP获取倍数: {{format(getTimesPowerMultiplier())}}x
        </div>
    `,
    methods: {
        getTimesPowerMultiplier() {
            let tp = player.timesPower;
            if (!tp || !(tp instanceof Decimal)) tp = new Decimal(0);
            let tpr = new Decimal(1.3);
            if (hasUpgrade('tp', 23)) tpr = new Decimal(2.026);
            return tp.add(1).pow(tpr);
        }
    }
});