addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "p", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#4BDC13",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade('p', 13)) mult = mult.times(upgradeEffect('p', 13))
        if (hasUpgrade('p', 14)) mult = mult.times(upgradeEffect('p', 14))
        if (player.sp) {
        mult = mult.times(player.sp.points.add(1).pow(0.33))
    }
    if (player.a) {
        mult = mult.times(player.a.points.add(1).pow(0.44))

    }
    
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},    upgrades: {        11: {    title: "01",
    description: "双倍点数获取.",
    cost: new Decimal(1),

        },       
     12: {
        title: "02",
        description: "基于你的p点提升点数获取。",
        cost: new Decimal(5),  // 消耗5个P点
        unlocked() { return hasUpgrade('p', 11) },  // 例如：需要先购买升级11
        effect() {
            return player[this.layer].points.add(1).pow(0.5)
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
    },
    13: {
        title: "03",
        description: "基于你的点数提升P点获取。",
        cost: new Decimal(10),  
        unlocked() { return hasUpgrade('p', 12) }, 
            effect() {
        return player.points.add(1).pow(0.15)
    },    },
    14: {
        title: "04",
        description: "基于你的p点提升P点获取。",
        cost: new Decimal(250),  
        unlocked() { return hasUpgrade('p', 13) }, 
            effect() {
        return player.p.points.add(1).pow(0.25)
    },    },
}  
    },

        
    )
addLayer("sp", {
    name: "second prestige",
    symbol: "SP",
    position: 0,
    startData() {
        return {
            unlocked: false, // 通常新层默认是锁定的，通过条件解锁
            points: new Decimal(0),
        }
    },
    color: "#ffc400",
    requires: new Decimal(100), // 需要100个P点才能解锁此层
    resource: "second prestige points", // 该层的货币名称
    baseResource: "prestige points", // 基于的货币（P点）
    baseAmount() { return player.p.points }, // 这里应指向P层的点数，注意路径
    type: "normal", 
    exponent: 0.25,
    gainMult() {
        let mult = new Decimal(1)
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    row: 1, // 放在第二行（0是第一行，1是第二行）
    hotkeys: [
        {key: "s", description: "S: Reset for second prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {
        return true // 可以根据解锁状态调整，例如：return player.sp.unlocked
    },

    upgrades: {
        // 这里可以定义该层的升级，结构参考P层
    }
})
addLayer("a", {
    name: "amplifier",
    symbol: "a",
    position: 0,
    startData() {
        return {
            unlocked: false, // 通常新层默认是锁定的，通过条件解锁
            points: new Decimal(0),
        }
    },
    color: "#ff0000ff",
    requires: new Decimal(1000000), // 需要1000000个P点才能解锁此层
    resource: "amplifier", // 该层的货币名称
    baseResource: "prestige points", // 基于的货币（P点）
    baseAmount() { return player.p.points }, // 这里应指向P层的点数，注意路径
    type: "normal", 
    exponent: 0.125,
    gainMult() {
        let mult = new Decimal(1)
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    row: 1, // 放在第二行（0是第一行，1是第二行）
       hotkeys: [
        {key: "a", description: "A: Reset for amplifier", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {
        return true // 可以根据解锁状态调整，例如：return player.a.unlocked
    },

    upgrades: {
        // 这里可以定义该层的升级，结构参考P层
    }
})