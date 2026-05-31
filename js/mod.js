let modInfo = {
	name: "The PP Tree",
	author: "sigma",
	pointsName: "points",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 5,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.0",
	name: "Literally nothing",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.0</h3><br>
		- Added things.<br>
		- Added stuff.`

let winText = `这便是终点...了?`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
    return true
}
// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() {
    return {
        
        // 其他原有字段...
    };
}
// 根据升级和里程碑计算增益
function getPointGen() {
    if (!canGenPoints()) return new Decimal(0);

    let gain = new Decimal(1);
    // 应用各种加成（保持不变）
    if (hasUpgrade('p', 11)) gain = gain.times(2);
    if (hasUpgrade('p', 12)) gain = gain.times(upgradeEffect('p', 12));
    if (hasUpgrade('p', 21)) gain = gain.times(upgradeEffect('p', 21));
    if (hasUpgrade('p', 25)) gain = gain.times(upgradeEffect('p', 25));
    if (hasUpgrade('p', 31)) gain = gain.times(upgradeEffect('p', 31));
    if (hasUpgrade('sp', 31)) gain = gain.times(upgradeEffect('sp', 31));
    if (hasUpgrade('sp', 34)) gain = gain.times(upgradeEffect('sp', 34));
    if (hasUpgrade('sp', 35)) gain = gain.times(upgradeEffect('sp', 35));
    if (hasUpgrade('a', 51)) gain = gain.times(upgradeEffect('a', 51));
    if (hasUpgrade('a', 72)) gain = gain.times(1e9);
    if (hasUpgrade('a', 73)) gain = gain.times(1e9);
    if (hasUpgrade('a', 74)) gain = gain.times(upgradeEffect('a', 74));
    if (hasMilestone('sp', 0)) gain = gain.times(2);
    if (hasMilestone('sp', 2)) gain = gain.times(5);
    if (hasMilestone('sp', 5)) gain = gain.times(10);
    if (hasMilestone('a', 0)) gain = gain.times(25);
    if (hasMilestone('lw', 0)) gain = gain.times(100);
    if (hasMilestone('re', 0)) gain = gain.times(100);
    if (hasMilestone('sa', 0)) gain = gain.times(100);

    // 安全函数：确保值有效
    function isValidDecimal(v) {
        return v instanceof Decimal && v.isFinite() && !v.isNan();
    }

    // 计算软上限阈值
    let pointmax = new Decimal(1e9);
    if (hasUpgrade('sa', 13)) pointmax = pointmax.times(1e9);
    if (hasUpgrade('lw', 13)) pointmax = pointmax.times(1e9);
    if (hasUpgrade('re', 13)) pointmax = pointmax.times(1e9);
    if (hasUpgrade('p', 35)) pointmax = pointmax.times(1e14);
    const softcapThreshold = new Decimal(pointmax);

    let postSoftcapGain;
    if (gain.gt(softcapThreshold) && isValidDecimal(gain)) {
        let excess = gain.minus(softcapThreshold);
        // 防止 excess 为负数或 0（理论上不会，但安全起见）
        if (excess.lte(0)) {
            postSoftcapGain = gain;
        } else {
            // 计算指数，使用原始公式：log10(log10(gain / softcapThreshold))
            let ratio = gain.div(softcapThreshold);
            // 防止 ratio 恰好等于 1 或小于 1（由于浮点误差）
            if (ratio.lte(1)) ratio = new Decimal(1.0000000001);
            let Log10Gain = ratio.log10();
            let Log10Log10Gain = Log10Gain.log10();

            // 检查 Log10Log10Gain 是否有效
            if (!isValidDecimal(Log10Log10Gain)) {
                // 降级：使用线性软上限
                postSoftcapGain = softcapThreshold.plus(excess);
            } else {
                let exponent = new Decimal(8.2).div(new Decimal(9).plus(Log10Log10Gain));
                // 应用各种加成
                if (hasUpgrade('a', 61)) exponent = exponent.times(1.05);
                if (hasUpgrade('sp', 44)) exponent = exponent.times(1.05);
                if (hasUpgrade('sp', 45)) exponent = exponent.times(1.05);
                if (hasUpgrade('sp', 51)) exponent = exponent.times(1.05);
                if (hasUpgrade('a', 71)) exponent = exponent.times(1.05);
                if (hasUpgrade('a', 73)) exponent = exponent.times(1.05);
                if (hasUpgrade('sa', 12)) exponent = exponent.times(1.05);
                if (hasUpgrade('lw', 12)) exponent = exponent.times(1.05);
                if (hasUpgrade('re', 12)) exponent = exponent.times(1.05);
                if (hasUpgrade('p', 35)) exponent = exponent.times(1.14514);
if (hasUpgrade('tp', 11)) exponent = exponent.times(1.25);
if (hasUpgrade('tp', 25)) exponent = exponent.times(1.025);
let eclipseMult1 = getEclipseMultiplier(1);
exponent = exponent.times(eclipseMult1);
                // 确保 exponent 是正有限数
                if (!isValidDecimal(exponent) || exponent.lte(0)) {
                    exponent = new Decimal(0.9);
                }

                let cappedExcess = excess.pow(exponent);
                if (!isValidDecimal(cappedExcess)) {
                    cappedExcess = excess; // 降级
                }
                postSoftcapGain = softcapThreshold.plus(cappedExcess);
                if (hasUpgrade('p', 32)) postSoftcapGain = postSoftcapGain.times(upgradeEffect('p', 32));

                // 设置提示（可选）
                if (tmp && tmp.other) {
                    tmp.other.softcapHint = "由于你的点数获取大于" + pointmax + ",点数获取受到软上限!（效果：超过部分^" + exponent + "）";
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

     // 二重软上限检查
    let doublepointmax = new Decimal("1e308");
    if(hasUpgrade('re', 14)) doublepointmax = doublepointmax.times(10);
    if(hasUpgrade('sp', 55)) doublepointmax = doublepointmax.times(upgradeEffect('sp', 55));
    const doubleSoftcapThreshold = new Decimal(doublepointmax);
    let doubleCappedGain;
    if (postSoftcapGain.gt(doubleSoftcapThreshold)) {
        let doubleExcess = postSoftcapGain.minus(doubleSoftcapThreshold);
        // lg(lg(在软上限生效后的点数获取)) = log10(log10(postSoftcapGain))
        let Log10Post = (postSoftcapGain.div(doublepointmax).add(1)).log10();
        let Log10Log10Post = (Log10Post.add(1)).log10();
        let doubleExponent = new Decimal(7.8).div(new Decimal(9.1).plus(Log10Log10Post)); 
        if(hasUpgrade('sa', 12)) doubleExponent = doubleExponent.times(1.05);
        if(hasUpgrade('lw', 12)) doubleExponent = doubleExponent.times(1.05);
        if(hasUpgrade('re', 12)) doubleExponent = doubleExponent.times(1.05);
        if(hasUpgrade('sa', 13)) doubleExponent = doubleExponent.times(1.01);
        if(hasUpgrade('tp', 11)) doubleExponent = doubleExponent.times(1.25);
        if(hasUpgrade('tp', 25)) doubleExponent = doubleExponent.times(1.05);
        let eclipseMult2 = getEclipseMultiplier(2);
doubleExponent = doubleExponent.times(eclipseMult2);
        let doubleCappedExcess = doubleExcess.pow(doubleExponent);
        doubleCappedGain = doubleSoftcapThreshold.plus(doubleCappedExcess);
        if (hasUpgrade('p', 33)) doubleCappedGain = doubleCappedGain.times(upgradeEffect('p', 33));
        if (hasUpgrade('sp', 55)) doubleCappedGain = doubleCappedGain.times(upgradeEffect('sp', 55));
        // 设置二重软上限提示
        if (tmp && tmp.other) {
            tmp.other.doubleSoftcapHint = "由于你的点数获取大于"+ doublepointmax+",点数获取受到二重软上限!(效果：超过部分^" + doubleExponent + ")";
        }
    } else {
        // 清除二重软上限提示
        if (tmp && tmp.other) {
            tmp.other.doubleSoftcapHint = "";
        }
        doubleCappedGain = postSoftcapGain;
    }

    // 三重软上限检查
    let triplepointmax = new Decimal("1e1000");
    if(hasUpgrade('tp', 12)) triplepointmax = triplepointmax.times('1e314');
    const tripleSoftcapThreshold = new Decimal(triplepointmax);
    if (doubleCappedGain.gt(tripleSoftcapThreshold)) {
        let tripleExcess = doubleCappedGain.minus(tripleSoftcapThreshold);
        // lg(lg(在二重软上限生效后的点数获取)) = log10(log10(doubleCappedGain))
        let Log10PostTriple = (doubleCappedGain.div(triplepointmax).add(1)).log10();
        let Log10Log10PostTriple = (Log10PostTriple.add(1)).log10();
        let tripleExponent = new Decimal(6.9).div(new Decimal(10.78).plus(Log10Log10PostTriple));
        if (hasUpgrade('tp', 25)) tripleExponent = tripleExponent.times(1.075);
let eclipseMult3 = getEclipseMultiplier(3);
tripleExponent = tripleExponent.times(eclipseMult3);
        let tripleCappedExcess = tripleExcess.pow(tripleExponent);
        let tripleCappedGain = tripleSoftcapThreshold.plus(tripleCappedExcess);
        
        // 设置三重软上限提示（更红一点）
        if (tmp && tmp.other) {
            tmp.other.tripleSoftcapHint = "由于你的点数获取大于"+ triplepointmax+",点数获取受到三重软上限!(效果：超过部分^" + tripleExponent + ")";
        }
        // 四重软上限检查
let quadruplepointmax = new Decimal("1e114514");
const quadrupleSoftcapThreshold = new Decimal(quadruplepointmax);
if (tripleCappedGain.gt(quadrupleSoftcapThreshold)) {
    let quadrupleExcess = tripleCappedGain.minus(quadrupleSoftcapThreshold);
    // 使用对数压缩公式，与前三重风格一致
    let Log10PostQuad = (tripleCappedGain.div(quadruplepointmax).add(1)).log10();
    let Log10Log10PostQuad = (Log10PostQuad.add(1)).log10();
    let quadrupleExponent = new Decimal(114514).div(new Decimal(1919810).plus(Log10Log10PostQuad));
    if (hasUpgrade('tp', 25)) quadrupleExponent = quadrupleExponent.times(1.1);
    let quadrupleCappedExcess = quadrupleExcess.pow(quadrupleExponent);
    let quadrupleCappedGain = quadrupleSoftcapThreshold.plus(quadrupleCappedExcess);
    
    // 设置四重软上限提示
    if (tmp && tmp.other) {
        tmp.other.quadrupleSoftcapHint = "由于你的点数获取大于" + quadruplepointmax + ",点数获取受到四重软上限!(效果：超过部分^" + quadrupleExponent + ")";
    }
    return quadrupleCappedGain;
} else {
    if (tmp && tmp.other) {
        tmp.other.quadrupleSoftcapHint = "";
    }
    return tripleCappedGain;
}    } else {
        // 清除三重软上限提示
        if (tmp && tmp.other) {
            tmp.other.tripleSoftcapHint = "";
        }
        return doubleCappedGain;
    }

}
// You can add non-layer related variables that should go into "player" and be saved here, along with default values

// Display extra things at the top of the page

var displayThings = [
]
// doNotCallTheseFunctionsEveryTick.push("autoBuyUpgrades");
// Determines when the game "ends"
function isEndgame() {
	return player.points.gte(new Decimal("1e114514"))
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}  
// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
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
    // 基础上限 100
    return new Decimal(100).times(new Decimal(1.425).pow(getTimeCrystalLimitBonus()).add(1));
}
function getEclipseCount() {
    return player.tp?.buyables?.[13] || new Decimal(0);
}

function getEclipseCount() {
    return player.tp?.buyables?.[13] || new Decimal(0);
}

function getEclipseMultiplier(level) {
    // level: 1 表示一重软上限，2 表示二重，3 表示三重
    let cnt = getEclipseCount();
    if (level === 1) return Decimal.pow(1.01, cnt);
    if (level === 2) return Decimal.pow(1.02, cnt);
    if (level === 3) return Decimal.pow(1.03, cnt);
    return new Decimal(1);
}
// 注册显示组件
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