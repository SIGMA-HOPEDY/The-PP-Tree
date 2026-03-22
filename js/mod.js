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
    if (hasUpgrade('p', 16)) gain = gain.times(upgradeEffect('p', 16));
    if (hasUpgrade('sp', 31)) gain = gain.times(upgradeEffect('sp', 31));
    if (hasUpgrade('a', 51)) gain = gain.times(upgradeEffect('a', 51));
    if (hasMilestone('sp', 0)) gain = gain.times(2);
    if (hasMilestone('sp', 2)) gain = gain.times(5);
    if (hasMilestone('sp', 5)) gain = gain.times(10);
    return gain;
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