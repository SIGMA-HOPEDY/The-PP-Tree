let modInfo = {
	name: "The PP Tree",
	author: "sigma",
	pointsName: "points",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
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
function addedPlayerData() { return {
}}
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
    if (hasUpgrade('a', 72)) gain = gain.times(100);
    if (hasUpgrade('a', 73)) gain = gain.times(100);
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
                if (hasUpgrade('a', 56)) exponent = exponent.times(1.03);
                if (hasUpgrade('sp', 44)) exponent = exponent.times(1.03125);
                if (hasUpgrade('sp', 45)) exponent = exponent.times(1.0325);
                if (hasUpgrade('sp', 51)) exponent = exponent.times(1.0335);
                if (hasUpgrade('a', 71)) exponent = exponent.times(1.035);
                if (hasUpgrade('a', 73)) exponent = exponent.times(1.0375);
                if (hasUpgrade('sa', 12)) exponent = exponent.times(1.05);
                if (hasUpgrade('lw', 12)) exponent = exponent.times(1.05);
                if (hasUpgrade('re', 12)) exponent = exponent.times(1.05);

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
    if(hasUpgrade('re', 13)) doublepointmax = doublepointmax.times(1e17);
    const doubleSoftcapThreshold = new Decimal(doublepointmax);
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
        let doubleCappedExcess = doubleExcess.pow(doubleExponent);
        let finalGain = doubleSoftcapThreshold.plus(doubleCappedExcess);
        
        // 设置二重软上限提示
        if (tmp && tmp.other) {
            tmp.other.doubleSoftcapHint = "由于你的点数获取大于"+ doublepointmax+",点数获取受到二重软上限!(效果：超过部分^" + doubleExponent + ")";
        }
        return finalGain;
    } else {
        // 清除二重软上限提示
        if (tmp && tmp.other) {
            tmp.other.doubleSoftcapHint = "";
        }
        return postSoftcapGain;
    }
}
// You can add non-layer related variables that should go into "player" and be saved here, along with default values
function addedPlayerData() { return { // 全局挑战奖励加成乘数
}}

// Display extra things at the top of the page

var displayThings = [
]
// 在mod.js的某个每帧调用的函数中
// function autoBuyUpgrades() {
//     if (hasMilestone('sp', 3)) {
//         // 自动购买P层可购买的升级
//         for (let id in layers.p.upgrades) {
//             let upg = layers.p.upgrades[id];
//             if (upg.unlocked && upg.unlocked() && !hasUpgrade('p', id)) {
//                 if (player.p.points.gte(upg.cost)) {
//                     // 执行购买
//                     player.p.points = player.p.points.minus(upg.cost);
//                     player.p.upgrades[id] = true;
//                     console.log(`自动购买了P层升级 ${id}`);
//                 }
//             }
//         }
//     }
// }

// 确保这个函数被添加到doNotCallTheseFunctionsEveryTick数组
// doNotCallTheseFunctionsEveryTick.push("autoBuyUpgrades");
// Determines when the game "ends"
function isEndgame() {
	return player.points.gte(new Decimal("1e308"))
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}  
// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}