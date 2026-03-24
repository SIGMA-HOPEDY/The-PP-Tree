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

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

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
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(1);
    if (hasUpgrade('p', 11)) gain = gain.times(2);
    if (hasUpgrade('p', 12)) gain = gain.times(upgradeEffect('p', 12));
    if (hasUpgrade('p', 21)) gain = gain.times(upgradeEffect('p', 21));
	if (hasUpgrade('p', 25)) gain = gain.times(upgradeEffect('p', 25));
	if (hasUpgrade('p', 31)) gain = gain.times(upgradeEffect('p', 31));
    if (hasUpgrade('sp', 31)) gain = gain.times(upgradeEffect('sp', 31));
	if (hasUpgrade('sp', 34)) gain = gain.times(upgradeEffect('sp', 34));
    if (hasUpgrade('sp', 35)) gain = gain.times(upgradeEffect('sp', 35));
    if (hasUpgrade('a', 51)) gain = gain.times(upgradeEffect('a', 51));
    if (hasMilestone('sp', 0)) gain = gain.times(2);
    if (hasMilestone('sp', 2)) gain = gain.times(5);
    if (hasMilestone('sp', 5)) gain = gain.times(10);
    if (hasMilestone('a', 0)) gain = gain.times(25);
    const softcapThreshold = new Decimal(1e9);
    if (gain.gt(softcapThreshold)) {
        let excess = gain.minus(softcapThreshold);
        // lg(lg(gain)) = log10(log10(gain))
        let Log10Gain = gain.log10();
        let Log10Log10Gain = Log10Gain.log10();
        let exponent = new Decimal(8).div(new Decimal(9).plus(Log10Log10Gain));
        let cappedExcess = excess.pow(exponent);
        let cappedGain = softcapThreshold.plus(cappedExcess);
        
        // 设置软上限提示
                if (tmp && tmp.other) {
            tmp.other.softcapHint = "由于你的点数获取大于1e9,点数获取受到软上限!（效果：超过部分^" + exponent + "）";
            tmp.other.softcappedPointGen = cappedGain;
        }
        // 计算软上限后的点数获取
        
        return cappedGain;
    } else {
        // 清除提示
        if (tmp && tmp.other) {
            tmp.other.softcapHint = "";
            tmp.other.softcappedPointGen = gain;
        }
        return gain;
    }
}

// You can add non-layer related variables that should go into "player" and be saved here, along with default values
function addedPlayerData() { return {
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