addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
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
        exponent: function() {
        let exp = 0.52;
        if (hasUpgrade('a', 52)) exp = exp * 1.01;
        return exp;
    },
// Prestige currency exponent

    passiveGeneration: function() {
        let passiveGeneration = 0;
        if (hasUpgrade('a', 54)) passiveGeneration = passiveGeneration+0.01;
        if (hasUpgrade('a', 62)) passiveGeneration = passiveGeneration+0.09;
        if (hasUpgrade('a', 63)) passiveGeneration = passiveGeneration+0.9;
        if (hasUpgrade('sa', 11)) passiveGeneration = passiveGeneration+9;
        return passiveGeneration;
    },
    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade('p', 13)) mult = mult.times(upgradeEffect('p', 13))
        if (hasUpgrade('p', 14)) mult = mult.times(upgradeEffect('p', 14))
    if (hasUpgrade('sp', 31)) mult = mult.times(2)
        if (hasUpgrade('sp', 32)) mult = mult.times(upgradeEffect('sp', 32))
                if (hasUpgrade('a', 51)) mult = mult.times(upgradeEffect('a', 51))
                    if (hasMilestone('sp', 1)) mult = mult.times(1.2);  // ×1.2
    if (hasMilestone('sp', 4)) mult = mult.times(1.5);  // ×1.5
    if (hasMilestone('sp', 5)) mult = mult.times(10);    // (x10)
    if (hasUpgrade('p', 23)) mult = mult.times(upgradeEffect('p', 23))
        if (hasUpgrade('p', 24)) mult = mult.times(upgradeEffect('p', 24))
            if(hasUpgrade('sa', 12)) mult = mult.times(upgradeEffect('sa', 12))
                
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
tabFormat: {
        "Upgrades": {
            content: ["main-display", "prestige-button", "blank", "upgrades"]
        },
    },
    layerShown(){return true},    upgrades: {        11: {    title: "01",
    description: "双倍点数获取.",
    cost: new Decimal(1),

        },       
     12: {
        title: "02",
        description: "基于你的p点提升点数获取。",
        cost: new Decimal(5),  // 消耗5个P点
        unlocked() { return hasUpgrade('p', 11) },  // 例如：需要先购买升级11
        effect() {let base = player.p.points.add(1);
let raw = base.pow(0.5);
let cap = new Decimal("1e38");
if (raw.lte(cap)) return raw;
let ratio = raw.div(cap);
let capped = ratio.pow(0.25);
return cap.times(capped);
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
    },
    13: {
        title: "03",
        description: "基于你的点数提升p点获取。",
        cost: new Decimal(10),  
        unlocked() { return hasUpgrade('p', 12) }, 
            effect() {let base = player.points.add(1);
let raw = base.pow(0.175);
let cap = new Decimal("1e38");
if (raw.lte(cap)) return raw;
let ratio = raw.div(cap);
let capped = ratio.pow(0.0875);
return cap.times(capped);
    }, effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },   },
    14: {
        title: "04",
        description: "基于你的p点提升p点获取。",
        cost: new Decimal(250),  
        unlocked() { return hasUpgrade('p', 13) }, 
            effect() {
        let base = player.p.points.add(1);
let raw = base.pow(0.135);
let cap = new Decimal("1e38");
if (raw.lte(cap)) return raw;
let ratio = raw.div(cap);
let capped = ratio.pow(0.0675);
return cap.times(capped);
    },  effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },  },
     15: {
        title: "05",
        description: "基于你的p点提升sp点获取。",
        cost: new Decimal(10000),  
        unlocked() { return hasUpgrade('p', 14) }, 
            effect() {
        let base = player.p.points.add(1);
let raw = base.pow(0.0725);
let cap = new Decimal("1e38");
if (raw.lte(cap)) return raw;
let ratio = raw.div(cap);
let capped = ratio.pow(0.03625);
return cap.times(capped);
    },  effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },  },
    21: {
        title: "06",
        description: "基于你的点数提升点数获取。",
        cost: new Decimal(1000000),  
        unlocked() { return hasUpgrade('p', 15) }, 
            effect() {
        let base = player.points.add(1);
let raw = base.pow(0.135);
let cap = new Decimal("1e38");
if (raw.lte(cap)) return raw;
let ratio = raw.div(cap);
let capped = ratio.pow(0.0675);
return cap.times(capped);
    },  effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },  },
    22: {
        title: "07",
        description: "amplifier获取公式指数+0.03.",
        cost: new Decimal(1e9),  
        unlocked() { return hasUpgrade('p', 21) }, 
             },
     23: {
        title: "08",
        description: "p点获取*p点^0.015",
        cost: new Decimal(1e12),  
        unlocked() { return hasUpgrade('p', 22) }, 
             effect() {
        let base = player.p.points.add(1);
let raw = base.pow(0.015);
let cap = new Decimal("1e38");
if (raw.lte(cap)) return raw;
let ratio = raw.div(cap);
let capped = ratio.pow(0.0075);
return cap.times(capped);
    },  effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },  },
    24: {
        title: "09",
        description: "p点获取*p点^0.025.",
        cost: new Decimal(1e20),  
        unlocked() { return hasUpgrade('p', 23) }, 
             effect() {
        let base = player.p.points.add(1);
let raw = base.pow(0.025);
let cap = new Decimal("1e38");
if (raw.lte(cap)) return raw;
let ratio = raw.div(cap);
let capped = ratio.pow(0.0125);
return cap.times(capped);
    },  effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },  },
    25: {
        title: "10",
        description: "点数获取*p点^0.125",
        cost: new Decimal(1e25),  
        unlocked() { return hasUpgrade('p', 24) }, 
             effect() {
        let base = player.p.points.add(1);
let raw = base.pow(0.125);
let cap = new Decimal("1e38");
if (raw.lte(cap)) return raw;
let ratio = raw.div(cap);
let capped = ratio.pow(0.0625);
return cap.times(capped);
    },  effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },  },
    31: {
        title: "多出来的升级?",
        description: "点数获取*点数获取^0.025",
        cost: new Decimal(1e38),  
        unlocked() { return hasUpgrade('p', 25) }, 
             effect() {
        let base = player.points.add(1);
let raw = base.pow(0.025);
let cap = new Decimal("1e38");
if (raw.lte(cap)) return raw;
let ratio = raw.div(cap);
let capped = ratio.pow(0.0125);
return cap.times(capped);
    },  effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },  },
    32: {
        title: "666又来? 不对!",
        description: "软上限后点数获取*(1+点数获取^0.114514/114514)^1.4",
        cost: new Decimal("1e365"),  
        unlocked() { return hasUpgrade('p', 31) &&hasUpgrade('sa', 15) }, 
             effect() {
                let base = player.points.add(1).pow(0.114514).div(114514).add(1)
let raw = base.pow(1.4);
let cap = new Decimal("1e38");
if (raw.lte(cap)) return raw;
let ratio = raw.div(cap);
let capped = ratio.pow(0.7);
return cap.times(capped);
        
    },  effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },  },
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
    exponent: function() {
        let exp = 0.45;
        if (hasMilestone('sp', 2)) exp = exp+0.05;
        if (hasMilestone('sp', 4)) exp = exp+0.05;
        if (hasUpgrade('sp', 41)) exp = exp+upgradeEffect('sp', 41);
        return exp;
    },
    // 禁用里程碑弹窗
    milestonePopups: false,
    
    // 里程碑定义
    milestones: {
        0: {
            requirementDescription: "1 SP点",
            effectDescription: "点数获取速度×2",
            done() { 
                return player.sp.points.gte(1) 
            },
            onComplete() {
                console.log("里程碑解锁: 1 SP点");
            }
        },
        1: {
            requirementDescription: "5 SP点",
            effectDescription: "P点获取速度×1.2",
            done() { 
                return player.sp.points.gte(5) 
            },
            onComplete() {
                console.log("里程碑解锁: 5 SP点");
            }
        },
        2: {
            requirementDescription: "25 SP点",
            effectDescription: "点数获取速度×5，SP点获取指数+0.05",
            done() { 
                return player.sp.points.gte(25) 
            },
            onComplete() {
                console.log("里程碑解锁: 25 SP点");
            }
        },
        3: {
            requirementDescription: "1000 SP点",
            effectDescription: "进行SP重置不重置P升级",
            done() { 
                return player.sp.points.gte(1000) 
            },
            onComplete() {
                console.log("里程碑解锁: 1000 SP点 - SP重置不重置P升级");
            },
            
        },
        4: {
            requirementDescription: "10000 SP点",
            effectDescription: "P点获取速度×1.5，SP点获取指数+0.05",
            done() { 
                return player.sp.points.gte(10000) 
            },
            onComplete() {
                console.log("里程碑解锁: 10000 SP点");
            }
        },
        5: {
            requirementDescription: "1e6 SP点",
            effectDescription: "点数和P点获取×10",
            done() { 
                return player.sp.points.gte(1e6) 
            },
            onComplete() {
                console.log("里程碑解锁: 1e6 SP点 - 数和P点获取×10");
            },
            style: {
                "color": "#ff9900",
                "border": "2px solid #ff9900"
            }
        },
    },
    
    gainMult() {
        let mult = new Decimal(1)
if (hasUpgrade('p', 15)) mult = mult.times(upgradeEffect('p', 15))
    if (hasUpgrade('a', 51)) mult = mult.times(upgradeEffect('a', 51))
        if (hasUpgrade('a', 53)) mult = mult.times(upgradeEffect('a', 53))
            if (hasUpgrade('sp', 42)) mult = mult.times(upgradeEffect('sp', 42))
                if(hasUpgrade('lw', 12)) mult = mult.times(upgradeEffect('lw', 12))

        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    passiveGeneration: function() {
        let passiveGeneration = 0;
        if (hasUpgrade('a', 64)) passiveGeneration = passiveGeneration+0.01;
        if (hasUpgrade('a', 65)) passiveGeneration = passiveGeneration+0.99;
        if (hasUpgrade('lw', 11)) passiveGeneration = passiveGeneration+1.5;
        if (hasUpgrade('lw', 14)) passiveGeneration = passiveGeneration+7.5;
        return passiveGeneration;
    },
    row: 1, // 放在第二行（0是第一行，1是第二行）
    hotkeys: [
        {key: "s", description: "S: Reset for second prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    // 在mod.js中查找类似这样的函数
tabFormat: {
        "Upgrades": {
            content: ["main-display", "prestige-button", "blank", "upgrades"]
        },
        "Milestones": {
            content: ["main-display", "prestige-button", "blank", "milestones"]
        },
    },
    layerShown() {
        return player.p.points.gte(100) || player.sp.points.gte(1) ||hasUpgrade('sp', 31)// 可以根据解锁状态调整，例如：return player.sp.unlocked
    },
    upgrades: {31: {    title: "11",
    description: "双倍p点获取,基于你的sp点小幅度提升点数获取.",
    cost: new Decimal(1),
effect() {
        let base = player.sp.points.add(1);
let raw = base.pow(0.3);
let cap = new Decimal("1e38");
if (raw.lte(cap)) return raw;
let ratio = raw.div(cap);
let capped = ratio.pow(0.15);
return cap.times(capped);
    },  effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },  
        }, 
        32: {
        title: "12",
        description: "基于你的sp点提升P点获取。",
        cost: new Decimal(25),  
        unlocked() { return hasUpgrade('sp', 31) }, 
        effect() {let base = player.sp.points.add(1);
let raw = base.pow(0.35);
let cap = new Decimal("1e38");
if (raw.lte(cap)) return raw;
let ratio = base.div(cap);
let capped = ratio.pow(0.035);
return cap.times(capped);
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },},
    33: {
        title: "13",
        description: "基于你的sp点提升sp点获取。",
        cost: new Decimal(1e9),  
        unlocked() { return hasUpgrade('sp', 32) }, 
            effect() {
        let base = player.sp.points.add(1);
let raw = base.pow(0.025);
let cap = new Decimal("1e38");
if (raw.lte(cap)) return raw;
let ratio = raw.div(cap);
let capped = ratio.pow(0.0125);
return cap.times(capped);
    },  effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },  },
    34: {
        title: "14",
        description: "基于你的sp点提升点数获取。",
        cost: new Decimal(1e15),  
        unlocked() { return hasUpgrade('sp', 33) }, 
            effect() {let base = player.sp.points.add(1);
let raw = base.pow(0.33);
let cap = new Decimal("1e38");
if (raw.lte(cap)) return raw;
let ratio = raw.div(cap);
let capped = ratio.pow(0.165);
return cap.times(capped);},
   effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },  },
   35: {
        title: "15",
        description: "基于你的sp点提升点数获取。",
        cost: new Decimal(1e38),  
        unlocked() { return hasUpgrade('sp', 34) }, 
            effect() {let base = player.sp.points.add(1);
let raw = base.pow(0.25);
let cap = new Decimal("1e38");
if (raw.lte(cap)) return raw;
let ratio = raw.div(cap);
let capped = ratio.pow(0.125);
return cap.times(capped);},
   effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },  },
   41: {
        title: "16",
        description: "基于你的sp点提升sp点获取指数。",
        cost: new Decimal(1e100),  
        unlocked() {  return hasUpgrade('sp', 35)}, 
            effect() {let base = player.sp.points.add(1);
    let powResult = base.pow(0.0001);
    let raw = powResult.sub(1);
let cap = new Decimal("1");
if (raw.lte(cap)) return raw;
let ratio = raw.sub(cap);
let capped = ratio.pow(0.01);
return cap.add(capped);
;
},
   effectDisplay() { return "+"+format(upgradeEffect(this.layer, this.id)) },  },
   42: {
        title: "17",
        description: "基于你的点数提升sp点获取。",
        cost: new Decimal(1e120),  
        unlocked() { return hasUpgrade('sp', 41) }, 
            effect() {let base = player.points.add(1);
let raw = base.pow(0.044);
let cap = new Decimal("1e38");
if (raw.lte(cap)) return raw;
let ratio = raw.div(cap);
let capped = ratio.pow(0.022);
return cap.times(capped);},
   effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },  },
   43: {
        title: "18",
        description: "基于你的sp点提升amplifier获取。",
        cost: new Decimal(1e150),  
        unlocked() { return hasUpgrade('sp', 42) }, 
            effect() {let base = player.sp.points.add(1);
let raw = base.pow(0.0066);
let cap = new Decimal("1e38");
if (raw.lte(cap)) return raw;
let ratio = raw.div(cap);
let capped = ratio.pow(0.0033);
return cap.times(capped);},
   effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },  },
    44: {
        title: "19",
        description: "软上限再弱化1.05",
        cost: new Decimal(1e175),  
        unlocked() { return hasUpgrade('sp', 43) }, 
            },
     45: {
        title: "20",
        description: "软上限再弱化1.05",
        cost: new Decimal(1e180),  
        unlocked() { return hasUpgrade('sp', 44) }, 
            },
    51: {
        title: "666还有第二关",
        description: "软上限再弱化1.05",
        cost: new Decimal(1e200),  
        unlocked() { return hasUpgrade('sp', 45) }, 
            },
    },
})
        // 这里可以定义该层的升级，结构参考P层 

addLayer("a", {
    name: "amplifier",
    symbol: "A",
    position: 0,
    startData() {
        return {
            unlocked: false, // 通常新层默认是锁定的，通过条件解锁
            points: new Decimal(0),
        }
    },
    color: "#1900ffff",
    requires: new Decimal(1e6), // 需要1e6个P点才能解锁此层
    resource: "amplifier", // 该层的货币名称
    baseResource: "prestige points", // 基于的货币（P点）
    baseAmount() { return player.p.points }, // 这里应指向P层的点数，注意路径
    type: "normal", 
   exponent: function() {
        let exp = 0.025;
        if (hasUpgrade('p', 22)) exp = exp + 0.03;
        return exp;
    },
    // 禁用里程碑弹窗
    milestonePopups: false,
    
    // 里程碑定义
    milestones: {
        0: {
            requirementDescription: "1 amplifier",
            effectDescription: "点数获取速度×25",
            done() { 
                return player.a.points.gte(1) 
            },
            onComplete() {
                console.log("里程碑解锁: 1 amplifier");
            }
        },
        
    },
    
    gainMult() {
        let mult = new Decimal(1)
        if(hasUpgrade('sp', 43)) mult = mult.times(upgradeEffect('sp', 43))
         if(hasUpgrade('re', 12)) mult = mult.times(upgradeEffect('re', 12))
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    row: 1, // 放在第三行（0是第一行，1是第二行，2是第三行）
       hotkeys: [
        {key: "a", description: "A: Reset for amplifier", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {
        return player.p.points.gte(1e6) || player.a.points.gte(1) ||hasUpgrade('a', 51)// 可以根据解锁状态调整，例如：return player.a.unlocked
    },
passiveGeneration: function() {
        let passiveGeneration = 0;
        if (hasUpgrade('re', 11)) passiveGeneration = passiveGeneration+0.01;
        if (hasUpgrade('re', 14)) passiveGeneration = passiveGeneration+9.99;
        return passiveGeneration;
    },
    tabFormat: {
        "Upgrades": {
            content: ["main-display", "prestige-button", "blank", "upgrades"]
        },
        "Milestones": {
            content: ["main-display", "prestige-button", "blank", "milestones"]
        },
    },
    upgrades: {51: {
        title: "21",
        description: "基于你的amplifier提升点数,P点,sp点获取。(加成不低于10)",
        cost: new Decimal(1),  
            effect() {
               let base = player.a.points.add(1).times(10);
let raw = base.pow(1);
let cap = new Decimal("1e38");
if (raw.lte(cap)) return raw;
let ratio = raw.div(cap);
let capped = ratio.pow(0.78);
return cap.times(capped);
    },  effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },  },
52: {
        title: "22",
        description: "P点获取公式指数x1.01.",
        cost: new Decimal(5),  
        unlocked() { return hasUpgrade('a', 51) },
             },
53: {
        title: "23",
        description: "基于你的amplifier提升sp点获取。(加成不低于10)",
        cost: new Decimal(10000000),  
        unlocked() { return hasUpgrade('a', 52) },
            effect() {
        let base = player.a.points.add(100);
let raw = base.pow(0.66);
let cap = new Decimal("1e38");
if (raw.lte(cap)) return raw;
let ratio = raw.div(cap);
let capped = ratio.pow(0.33);
return cap.times(capped);
    },  effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },  }, 
54: {
        title: "24",
        description: "每秒获得重置时P点的1%.",
        cost: new Decimal(1e9),  
        unlocked() { return hasUpgrade('a', 53) },
             },
55: {
        title: "25",
        description: "进行A重置不重置P升级",
        cost: new Decimal(1e10),  
        unlocked() { return hasUpgrade('a', 54) },
             },
61: {
        title: "26",
        description: "软上限弱化1.05",
        cost: new Decimal(1e12),  
        unlocked() { return hasUpgrade('a', 55) },
             },
 62: {
        title: "27",
        description: "每秒再获得重置时P点的9%.",
        cost: new Decimal(1e13),  
        unlocked() { return hasUpgrade('a', 61) },
             },
63: {
        title: "28",
        description: "每秒再获得重置时P点的90%.",
        cost: new Decimal(1e14),  
        unlocked() { return hasUpgrade('a', 62) },
             },
64: {
        title: "29",
        description: "每秒获得重置时SP点的1%.",
        cost: new Decimal(1e15),  
        unlocked() { return hasUpgrade('a', 63) },
             },
65: {
        title: "30",
        description: "每秒获得重置时SP点的99%.",
        cost: new Decimal(1e16),  
        unlocked() { return hasUpgrade('a', 64) },
             },
71: {
        title: "我感受到了...",
        description: "软上限再弱化1.05",
        cost: new Decimal(1e17),  
        unlocked() { return hasUpgrade('a', 65)&& hasUpgrade('sp', 51) },
             }, 
 72: {
        title: 
        "这是...?",
        description: "点数获取*1e9",
        cost: new Decimal(1e18),  
        unlocked() { return hasUpgrade('a', 71) },
             },          
73: {
        title: 
        "三相之力?",
        description: "软上限再弱化1.05,点数获取*1e9",
        cost: new Decimal(2.5e18),  
        unlocked() { return hasUpgrade('a', 72) },
             },             
    }
}
)
addLayer("lw", {
    name: "Law Weaving",
    symbol: "LW",
    position: 0,
    startData() {
        return {
            unlocked: false, // 通常新层默认是锁定的，通过条件解锁
            points: new Decimal(0),
        }
    },
    color: "#c2f310ff",
    requires: new Decimal(1e308), // 需要???才能解锁此层
    resource: "Law Weaving", // 该层的货币名称
    baseResource: "points", // 基于的货币
    baseAmount() { return player.points }, // 这里应指向点数，注意路径
    type: "normal", 
   exponent: function() {
        let exp = 0.01;
        return exp;
    },
    // 禁用里程碑弹窗
    milestonePopups: false,
    
    // 里程碑定义
    milestones: {
       0: {
            requirementDescription: "1 Law Weaving",
            effectDescription: "点数获取速度×100",
            done() { 
                return player.lw.points.gte(1) 
            },
            onComplete() {
                console.log("里程碑解锁: 1 Law Weaving");
           }
        },
        1: {
            requirementDescription: "3 law Weaving",
            effectDescription: "lw重置时不重置SP层升级",
            done() { 
                return player.lw.points.gte(3) 
            },
            onComplete() {
                console.log("里程碑解锁: 3 law Weaving");
           }
        },
        
    },
    
    gainMult() {
        let mult = new Decimal(1)
        if(hasUpgrade('lw', 14)) mult = mult.times(upgradeEffect('lw', 14));
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    row: 2, // 放在第三行（0是第一行，1是第二行，2是第三行）
       hotkeys: [
        {key: "shift+s", description: "L: Reset for Law Weaving", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {
        return hasUpgrade('a', 73) || player.lw.points.gte(1)||hasUpgrade('lw', 11)
    },

    tabFormat: {
        "Upgrades": {
            content: ["main-display", "prestige-button", "blank", "upgrades"]
        },
        "Milestones": {
            content: ["main-display", "prestige-button", "blank", "milestones"]
        },
    },

    
    upgrades: {
        11: {
        title: "始",
        description: "每秒再获得重置时SP点的150%.",
        cost: new Decimal(1),  
             },
        12: {
        title: "破限",
        description: "基于lw提升SP点获取(不低于100),软上限弱化1.05,二重软上限弱化1.05.",
        cost: new Decimal(1), 
        unlocked() { return hasUpgrade('lw', 11) }, 
        effect() {
               let base = player.lw.points.add(10);
let raw = base.pow(2);
let cap = new Decimal("1e38");
if (raw.lte(cap)) return raw;
let ratio = raw.div(cap);
let capped = ratio.pow(0.91);
return cap.times(capped);
    },  effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },  },
    13: {
        title: "软上限有什么用？",
        description: "软上限延迟1e9",
        cost: new Decimal(5), 
        unlocked() { return hasUpgrade('lw', 12) }, 
        effect() {
                },  },  
    14: {
        title: "开始膨胀",
        description: "自我增幅,每秒再获得重置时SP点的750%.",
        cost: new Decimal(10), 
        unlocked() { return hasUpgrade('lw', 13) }, 
        effect() {
                let base = player.lw.points.add(1);
let raw = base.pow(1);
let cap = new Decimal("1e38");
if (raw.lte(cap)) return raw;
let ratio = raw.div(cap);
let capped = ratio.pow(0.78);
return cap.times(capped);
    },  effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },   }, 
    15: {
        title: "更多...",
        description: "lw重置时不重置前两行,解锁更多sp层升级.",
        cost: new Decimal(1e9), 
        unlocked() { return hasUpgrade('lw', 14) &&hasUpgrade('sa', 15) &&hasUpgrade('p', 91)}, 
        effect() {
                
    },   }, 
     }
}
)
addLayer("sa", {
    name: "Source Amplification",
    symbol: "SA",
    position: 0,
    startData() {
        return {
            unlocked: false, // 通常新层默认是锁定的，通过条件解锁
            points: new Decimal(0),
        }
    },
    color: "#00ffbfff",
    requires: new Decimal(1e308), // 需要???才能解锁此层
    resource: "Source Amplification", // 该层的货币名称
    baseResource: "points", // 基于的货币
    baseAmount() { return player.points }, // 这里应指向点数，注意路径
    type: "normal", 
   exponent: function() {
        let exp = 0.01;
        return exp;
    },
    // 禁用里程碑弹窗
    milestonePopups: false,
    
    // 里程碑定义
    milestones: {
        0: {
            requirementDescription: "1 Source Amplification",
            effectDescription: "点数获取速度×100",
            done() { 
                return player.sa.points.gte(1) 
            },
            onComplete() {
                console.log("里程碑解锁: 1 Source Amplification");
           }
        },
        1: {
            requirementDescription: "3 Source Amplification",
            effectDescription: "sa重置时不重置P层升级",
            done() { 
                return player.sa.points.gte(3) 
            },
            onComplete() {
                console.log("里程碑解锁: 3 Source Amplification");
           }
        },
        
    },
    
    gainMult() {
        let mult = new Decimal(1)
         if(hasUpgrade('sa', 14)) mult = mult.times(upgradeEffect('sa', 14));
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    row: 2, // 放在第三行（0是第一行，1是第二行，2是第三行）
       hotkeys: [
        {key: "shift+a", description: "S: Reset for Source Amplification", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {
        return hasUpgrade('a', 73) || player.sa.points.gte(1)||hasUpgrade('sa', 11)
    },

    tabFormat: {
        "Upgrades": {
            content: ["main-display", "prestige-button", "blank", "upgrades"]
        },
        "Milestones": {
            content: ["main-display", "prestige-button", "blank", "milestones"]
        },
    },

        upgrades: {
        11: {
        title: "始",
        description: "每秒再获得重置时P点的900%.",
        cost: new Decimal(1),  
             }, 
        12: {
        title: "破限",
        description: "基于sa提升P点获取(不低于1e4),软上限弱化1.05,二重软上限弱化1.05.",
        cost: new Decimal(1), 
        unlocked() { return hasUpgrade('sa', 11) }, 
        effect() {
                let base = player.sa.points.add(100);
let raw = base.pow(2);
let cap = new Decimal("1e38");
if (raw.lte(cap)) return raw;
let ratio = raw.div(cap);
let capped = ratio.pow(0.91);
return cap.times(capped);
    },  effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },  },
    13: {
        title: "软上限有什么用？",
        description: "软上限延迟1e9",
        cost: new Decimal(5), 
        unlocked() { return hasUpgrade('sa', 12) }, 
        effect() {
                },  },  
                14: {
        title: "开始膨胀",
        description: "自我增幅,弱化并延迟二重软上限(1.01,10)",
        cost: new Decimal(10), 
        unlocked() { return hasUpgrade('sa', 13) }, 
        effect() {
                let base = player.sa.points.add(1);
let raw = base.pow(1);
let cap = new Decimal("1e38");
if (raw.lte(cap)) return raw;
let ratio = raw.div(cap);
let capped = ratio.pow(0.78);
return cap.times(capped);

    },  effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },   }, 
    15: {
        title: "更多...",
        description: "sa重置时不重置前两行,解锁更多p层升级.",
        cost: new Decimal(1e9), 
        unlocked() { return hasUpgrade('sa', 14) }, 
        effect() {
                
    },   }, 
     
             },}
)

addLayer("re", {
    name: "Recursive Echo",
    symbol: "RE",
    position: 0,
    startData() {
        return {
            unlocked: false, // 通常新层默认是锁定的，通过条件解锁
            points: new Decimal(0),
        }
    },
    color: "rgba(0, 89, 255, 1)",
    requires: new Decimal(1e308), // 需要???才能解锁此层
    resource: "Recursive Echo", // 该层的货币名称
    baseResource: "points", // 基于的货币
    baseAmount() { return player.points }, // 这里应指向点数，注意路径
    type: "normal", 
   exponent: function() {
        let exp = 0.01;
        return exp;
    },
    // 禁用里程碑弹窗
    milestonePopups: false,
    
    // 里程碑定义
    milestones: {
       0: {
            requirementDescription: "1 Recursive Echo",
            effectDescription: "点数获取速度×100",
            done() { 
                return player.re.points.gte(1) 
            },
            onComplete() {
                console.log("里程碑解锁: 1 Recursive Echo");
           }
        },
        1: {
            requirementDescription: "3 Recursive Echo",
            effectDescription: "re重置时不重置Amplifier层升级",
            done() { 
                return player.re.points.gte(3) 
            },
            onComplete() {
                console.log("里程碑解锁: 3 Recursive Echo");
           }
        },
        
    },
    
    gainMult() {
        let mult = new Decimal(1)
        if(hasUpgrade('re', 14)) mult = mult.times(upgradeEffect('re', 14)); 
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    row: 2, // 放在第三行（0是第一行，1是第二行，2是第三行）
       hotkeys: [
        {key: "shift+R", description: "R: Reset for Recursive Echo", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {
        return hasUpgrade('a', 73) || player.re.points.gte(1) ||hasUpgrade('re', 11) // 可以根据解锁状态调整，例如：return player.a.unlocked
    },

    tabFormat: {
        "Upgrades": {
            content: ["main-display", "prestige-button", "blank", "upgrades"]
        },
        "Milestones": {
            content: ["main-display", "prestige-button", "blank", "milestones"]
        },
    },
    upgrades: {
        11: {
        title: "始",
        description: "每秒获得重置时Amplifier的1%.",
        cost: new Decimal(1),  
             },
        12: {
        title: "破限",
        description: "基于re提升amplifier获取(不低于100),软上限弱化1.05,二重软上限弱化1.05.",
        cost: new Decimal(1), 
        unlocked() { return hasUpgrade('re', 11) }, 
        effect() {
                let base = player.re.points.add(10);
let raw = base.pow(2);
let cap = new Decimal("1e38");
if (raw.lte(cap)) return raw;
let ratio = raw.div(cap);
let capped = ratio.pow(0.91);
return cap.times(capped);

    },  effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },  },    
    13: {
        title: "软上限有什么用？",
        description: "软上限延迟1e9",
        cost: new Decimal(5), 
        unlocked() { return hasUpgrade('re', 12) }, 
        effect() {
                },  },   
                14: {
        title: "开始膨胀",
        description: "自我增幅,每秒再获得重置时Amplifier的999%.",
        cost: new Decimal(10), 
        unlocked() { return hasUpgrade('re', 13) }, 
        effect() {
                let base = player.re.points.add(1);
let raw = base.pow(1);
let cap = new Decimal("1e38");
if (raw.lte(cap)) return raw;
let ratio = raw.div(cap);
let capped = ratio.pow(0.78);
return cap.times(capped);

    },  effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },   },  
    15: {
        title: "更多...",
        description: "re重置时不重置前两行,解锁更多a层升级.",
        cost: new Decimal(1e9), 
        unlocked() { return hasUpgrade('re', 14) &&hasUpgrade('sa', 15) &&hasUpgrade('lw', 15) }, 
        effect() {
                
    },   }, 
      },}
)
