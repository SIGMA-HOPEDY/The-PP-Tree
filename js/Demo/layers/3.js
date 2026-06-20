addLayer("ALPEA", {
    name: "ALPEA", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "ALPEA", // This appears on the layer's node. Default is the id with the first letter capitalized
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
        let exp = new Decimal(0.52);
        if (hasUpgrade('a', 52)) exp = exp.times(1.01);
        if (hasUpgrade('sp', 53)) exp = exp.add(upgradeEffect('sp', 53));
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
                if(hasUpgrade('tp', 11)) mult = mult.times(upgradeEffect('tp', 11)); 
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
    layerShown(){return true},    
    autoUpgrade: function() { return hasMilestone('tp', 1); }, 
   upgrades: {
       11: {
           title: "01",
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
let capped = ratio.pow(new Decimal(0.91).div((player.p.points.add(1).log10().add(1).log10().add(1))));
return cap.times(capped);
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
    },
    13: {
        title: "03",
        description: "基于你的点数提升p点获取。(到100p点解锁SP重置)",
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
        description: "基于你的p点提升sp点获取。(到1e6p点解锁A重置)",
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
        description: "p点获取*p点^0.1",
        cost: new Decimal(1e12),  
        unlocked() { return hasUpgrade('p', 22) }, 
             effect() {
        let base = player.p.points.add(1);
let raw = base.pow(0.1);
let cap = new Decimal("1e38");
if (raw.lte(cap)) return raw;
let ratio = raw.div(cap);
let capped = ratio.pow(0.05);
return cap.times(capped);
    },  effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },  },
    24: {
        title: "09",
        description: "p点获取*p点^0.05.",
        cost: new Decimal(1e20),  
        unlocked() { return hasUpgrade('p', 23) }, 
             effect() {
        let base = player.p.points.add(1);
let raw = base.pow(0.05);
let cap = new Decimal("1e38");
if (raw.lte(cap)) return raw;
let ratio = raw.div(cap);
let capped = ratio.pow(0.025);
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
        description: "点数获取*点数^0.05",
        cost: new Decimal(1e38),  
        unlocked() { return hasUpgrade('p', 25) }, 
             effect() {
        let base = player.points.add(1);
let raw = base.pow(0.05);
let cap = new Decimal("1e38");
if (raw.lte(cap)) return raw;
let ratio = raw.div(cap);
let capped = ratio.pow(0.025);
return cap.times(capped);
    },  effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },  },
    32: {
        title: "666又来? 不对!",
        description: "软上限后点数获取*(1+点数^0.114514/114514)^1.4",
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
33: {
        title: "更进一歩!",
        description: "二重软上限后点数获取*(1+lg(点数+1))^ {1.919810+lg(lg(点数+1)+1)}",
        cost: new Decimal("1e455"),  
        unlocked() { return hasUpgrade('p', 32)  }, 
             effect() {
                let base = player.points.add(1).log10().add(1);
let raw = base.pow(player.points.add(1).log10().add(1).log10().add(1.919810))
let cap = new Decimal("1e38");
if (raw.lte(cap)) return raw;
let ratio = raw.div(cap);
let capped = ratio.pow(0.91);
return cap.times(capped);
        
    },  effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },  },
    34: {
        title: "升级18太弱了!",
        description: "升级18效果^2.88(有神秘小彩蛋哦)",
        cost: new Decimal("1e465"),  
        unlocked() { return hasUpgrade('p', 33)  },  },
    35: {
        title: "可笑的软上限",
        description: "软上限延迟1e14,弱化软上限1.14514,解锁一个新的LW升级",
        cost: new Decimal("1e475"),  
        unlocked() { return hasUpgrade('p', 34)  },  },
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
    let exp = new Decimal(0.45);
    if (hasMilestone('sp', 2)) exp = exp.add(0.05);
    if (hasMilestone('sp', 4)) exp = exp.add(0.05);
    if (hasUpgrade('sp', 41)) exp = exp.add(upgradeEffect('sp', 41));
    if (hasUpgrade('sp', 52)) exp = exp.add(upgradeEffect('sp', 52));
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
if(hasUpgrade('tp', 11)) mult = mult.times(upgradeEffect('tp', 11)); 
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
    autoUpgrade: function() { return hasMilestone('tp', 2); }, 
    upgrades: {31: {    title: "11",
    description: "双倍p点获取,基于你的sp点小幅度提升点数获取.",
    cost: new Decimal(1),
effect() {
        let base = player.sp.points.add(1);
let raw = base.pow(0.3);
let cap = new Decimal("1e38");
if (raw.lte(cap)) return raw;
let ratio = raw.div(cap);
let capped = ratio.pow(new Decimal(0.5).div((player.sp.points.add(1).log10().add(1).log10().add(1))));
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
let capped = ratio.pow(new Decimal(0.13).div((player.sp.points.add(1).log10().add(1).log10().add(1))));
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
let raw = base.pow(0.25);
let cap = new Decimal("1e38");
if (raw.lte(cap)) return raw;
let ratio = raw.div(cap);
let capped = ratio.pow(new Decimal(0.5).div((player.sp.points.add(1).log10().add(1).log10().add(1))));
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
let capped = ratio.pow(new Decimal(0.66).div((player.sp.points.add(1).log10().add(1).log10().add(1))));
return cap.times(capped);
    },  effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },  },
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
let capped = ratio.pow(new Decimal(0.5).div((player.sp.points.add(1).log10().add(1).log10().add(1))));
return cap.times(capped);},
   effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },  },
  41: {
    title: "16",
    description: "基于你的sp点提升sp点获取指数。",
    cost: new Decimal(1e100),  
    unlocked() { return hasUpgrade('sp', 35); }, 
    effect() {
        let base = player.sp.points.add(1);
        let powResult = base.pow(0.0001);
        let raw = powResult.sub(1);
        let cap = new Decimal("0.5");
        if (raw.lte(cap)) return raw;
        let power = new Decimal(0.0005).div((player.sp.points.add(1).log10().add(1).log10().add(1)));
        let capped = cap.times(raw.div(cap).pow(power));
        return capped;
    },
    effectDisplay() { return "+" + format(upgradeEffect(this.layer, this.id)); },
},
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
            effect() {
    let base = player.sp.points.add(1);
    let raw = base.pow(0.0066);                 
    if (hasUpgrade('p', 34)) {
        raw = raw.pow(2.88);                     
    }
    let cap = new Decimal("1e38");
    if (raw.lte(cap)) return raw;
    let ratio = raw.div(cap);
    let capped = ratio.pow(0.0033);   
    if (hasUpgrade('p', 34)) {
        capped = capped.pow(1.44);              //       没想到吧?升级34还会影响这个软上限的弱化程度(✿◡‿◡)
    }          
    return cap.times(capped);

},
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
     52: {
    title: "!?强?!",
    description: "基于你的SP点提升SP点获取指数。",
    cost: new Decimal("1e600"),
    unlocked() { return hasUpgrade('sp', 51) &&hasUpgrade('lw', 15)  },
    effect() {
        let safePoints = player.sp.points.max(1);
let base = safePoints.add(1).log10().div(1000).add(1);
    let powResult = base.pow(0.066);
    let raw = powResult.add(-1);
let cap = new Decimal("0.15");
 if (raw.lte(cap)) return raw;
        let power = new Decimal(0.0005).div((player.sp.points.add(1).log10().add(1).log10().add(1)));
        let capped = cap.times(raw.div(cap).pow(power));
        return capped;
    },
    effectDisplay() { return "+" + format(upgradeEffect(this.layer, this.id)) },
},
53: {
    title: "666还有第三关",
    description: "基于你的SP点提升P点获取指数。",
    cost: new Decimal("6.66e666"),
    unlocked() { return hasUpgrade('sp', 52)  },
    effect() {
        let safePoints = player.sp.points.max(1);
let base = safePoints.add(1).log10().div(666).add(1);
    let powResult = base.pow(0.15);
    let raw = powResult.add(-1);
let cap = new Decimal("0.66");
 if (raw.lte(cap)) return raw;
        let power = new Decimal(0.0005).div((player.sp.points.add(1).log10().add(1).log10().add(1)));
        let capped = cap.times(raw.div(cap).pow(power));
        return capped;
    },
    effectDisplay() { return "+" + format(upgradeEffect(this.layer, this.id)) },
},
54: {
    title: "我勒个高考750分",
    description: "基于你的SP点提升Amplifier获取指数。",
    cost: new Decimal("1e750"),
    unlocked() { return hasUpgrade('sp', 53)  },
    effect() {let safePoints = player.sp.points.max(1);
let base = safePoints.add(1).log10().div(444).add(1);
    let powResult = base.pow(0.066);
    let raw = powResult.add(-1);
let cap = new Decimal("0.17");
 if (raw.lte(cap)) return raw;
        let power = new Decimal(0.00005).div((player.sp.points.add(1).log10().add(1).log10().add(1)));
        let capped = cap.times(raw.div(cap).pow(power));
        return capped;
    },
    effectDisplay() { return "+" + format(upgradeEffect(this.layer, this.id)) },
},
55: {
    title: "千禧之刻",
    description: "二重软上限延迟lg(前两行点数+1)之积,二重软上限后点数获取*1000,解锁一个新的RE升级",
    cost: new Decimal("1e1000"),
    unlocked() { return hasUpgrade('sp', 54)  },
    effect() {let safePointsp = player.p.points.max(1);
        let safePointssp = player.sp.points.max(1);
        let safePointsa = player.a.points.max(1);
let basep = safePointsp.add(1).log10();
let basesp = safePointssp.add(1).log10();
let basea = safePointsa.add(1).log10();
    let raw = basep.times(basesp).times(basea);
let cap = new Decimal("1e9");
if (raw.lte(cap)) return raw;
let ratio = raw.sub(cap);
let capped = ratio.pow(0.91);
return cap.add(capped);
    },
    effectDisplay() { return "*" + format(upgradeEffect(this.layer, this.id)) },
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
        let exp = new Decimal(0.025);
        if (hasUpgrade('p', 22)) exp = exp.add(0.03);
        if (hasUpgrade('sp', 54)) exp = exp.add(upgradeEffect('sp', 54));
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
    autoUpgrade: function() { return hasMilestone('tp', 3); }, 

    gainMult() {
        let mult = new Decimal(1)
        if(hasUpgrade('sp', 43)) mult = mult.times(upgradeEffect('sp', 43))
         if(hasUpgrade('re', 12)) mult = mult.times(upgradeEffect('re', 12))
            if(hasUpgrade('a', 74)) mult = mult.times((upgradeEffect('a', 74)).add(1).log10().add(1).pow(1.44))
                if(hasUpgrade('tp', 11)) mult = mult.times(upgradeEffect('tp', 11)); 
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
let buyableEff = tmp.tp.buyables?.[11]?.effect ?? new Decimal(1);
let raw = base.pow(buyableEff); 
    // 可选：调整软上限
    let cap = new Decimal("1e38");
    let limited;
    if (raw.lte(cap)) {
        limited = raw;
    } else {
        let ratio = raw.div(cap);
        let capped = ratio.pow(new Decimal(1.25).div((player.a.points.add(1).log10().add(1).log10().add(1)).pow(0.33)));
        limited = cap.times(capped);
    }
    return limited;
},
            effectDisplay() {
    let eff = tmp.tp.buyables?.[11]?.effect ?? new Decimal(1);
    return `基础效果^${format(eff)} (当前: ${format(upgradeEffect(this.layer, this.id))}x)`;
}
        },
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
74: {
        title: 
        "1e288",
        description: "点数获取*lg(点数+1)^2.88,amplifier获取*lg(lg(点数+1)^2.88+1)^1.44",
        cost: new Decimal(1e288),  
        unlocked() { return hasUpgrade('a', 73) && hasUpgrade('re', 15)},
        effect() {
            let base = player.points.add(1).log10().add(1);
let raw = base.pow(2.88)
let cap = new Decimal("1e38");
if (hasUpgrade('tp', 15)) {
        raw = raw.pow(2.026);                     
    }
if (raw.lte(cap)) return raw;
let ratio = raw.div(cap);
let capped = ratio.pow(1.88);
return cap.times(capped);

    },  effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x"+","+((upgradeEffect(this.layer, this.id).add(1).log10().add(1).pow(1.44))+"x" )},  },
    75: {
        title: 
        "新的层级?",
        description: "解锁新的层级",
        cost: new Decimal(1.79e308),  
        unlocked() { return hasUpgrade('a', 74) },
             },     
    }}
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
        let exp = new Decimal(0.01);
        return exp;
    },
        autoUpgrade: function() { return hasUpgrade('pp', 13); }, 
    // 禁用里程碑弹窗
    milestonePopups: false,
    passiveGeneration: function() {
        let passiveGeneration = 0;
        if (hasMilestone('pp', 0)) passiveGeneration = passiveGeneration+0.001;
        return passiveGeneration;
    },
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
        if(hasUpgrade('tp', 11)) mult = mult.times(upgradeEffect('tp', 11)); 
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
let capped = ratio.pow(new Decimal(0.78).div((player.lw.points.add(1).log10().add(1).log10().add(1))));
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
let capped = ratio.pow(new Decimal(0.13).div((player.lw.points.add(1).log10().add(1).log10().add(1))));
return cap.times(capped);
    },  effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },   }, 
    15: {
        title: "更多...",
        description: "lw重置时不重置前两行,解锁更多sp层升级.",
        cost: new Decimal(1e20), 
        unlocked() { return hasUpgrade('lw', 14) &&hasUpgrade('sa', 15) &&hasUpgrade('p', 35)}, 
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
        let exp = new Decimal(0.01);

        return exp;
    },
        autoUpgrade: function() { return hasUpgrade('pp', 13); }, 
    // 禁用里程碑弹窗
    milestonePopups: false,
    passiveGeneration: function() {
        let passiveGeneration = 0;
        if (hasMilestone('pp', 0)) passiveGeneration = passiveGeneration+0.001;
        return passiveGeneration;
    },
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
         if(hasUpgrade('tp', 11)) mult = mult.times(upgradeEffect('tp', 11)); 
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
let capped = ratio.pow(new Decimal(0.78).div((player.sa.points.add(1).log10().add(1).log10().add(1))));
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
let capped = ratio.pow(new Decimal(0.13).div((player.sa.points.add(1).log10().add(1).log10().add(1))));
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
        let exp = new Decimal(0.01);
        return exp;
    },
    // 禁用里程碑弹窗
    milestonePopups: false,
        autoUpgrade: function() { return hasUpgrade('pp', 13); }, 
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
    passiveGeneration: function() {
        let passiveGeneration = 0;
        if (hasMilestone('pp', 0)) passiveGeneration = passiveGeneration+0.001;
        return passiveGeneration;
    },
    gainMult() {
        let mult = new Decimal(1)
        if(hasUpgrade('re', 14)) mult = mult.times(upgradeEffect('re', 14)); 
        if(hasUpgrade('tp', 11)) mult = mult.times(upgradeEffect('tp', 11)); 
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
let capped = ratio.pow(new Decimal(0.78).div((player.re.points.add(1).log10().add(1).log10().add(1))));
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
let capped = ratio.pow(new Decimal(0.13).div((player.re.points.add(1).log10().add(1).log10().add(1))));
return cap.times(capped);

    },  effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },   },  
    15: {
        title: "更多...",
        description: "re重置时不重置前两行,解锁更多a层升级.",
        cost: new Decimal(1e40), 
        unlocked() { return hasUpgrade('re', 14) &&hasUpgrade('sa', 15) &&hasUpgrade('lw', 15) &&hasUpgrade('sp', 55) }, 
        effect() {
                
    },   }, 
      },}
)
addLayer("tp", {
    name: "Time Points",
    symbol: "TP",
    position: 0,
    startData() {
    return {
        unlocked: false,
        points: new Decimal(0),
        timesPower: new Decimal(0),   // 新增子资源
    };
},
    color: "rgba(255, 0, 221, 1)",
    requires: new Decimal("1e1000"),
    resource: "Time points",
    baseResource: "points",
    baseAmount() { return player.points },
    type: "normal",
    exponent: function() {
        return new Decimal(0.012345);
    },
    milestonePopups: false,
    milestones: {},
    gainMult() { let mult = new Decimal(1)
        if(hasUpgrade('tp', 13)) mult = mult.times(upgradeEffect('tp', 13)); 
        if (player.timesPower && player.timesPower instanceof Decimal) {
        let timesPowerBonus = player.timesPower.add(1).pow(1.3);
        mult = mult.times(timesPowerBonus);
    }
        return mult },
    gainExp() { return new Decimal(1) },
    row: 3,
    hotkeys: [{
        key: "T",
        description: "R: Reset for Time Points",
        onPress(){ if (canReset(this.layer)) doReset(this.layer) }
    }],
    layerShown() {
        return hasUpgrade('a', 75) || player.tp.points.gte(1) || hasUpgrade('tp', 11)
    },
update(diff) {
    if (!(player.timesPower instanceof Decimal)) {
        player.timesPower = new Decimal(player.timesPower || 0);
    }
    if (hasUpgrade('tp', 21)) {
        let tpPoints = player.tp.points;
        let gainpow = new Decimal(1.14514);
        if(hasUpgrade('tp', 22)) gainpow = new Decimal(1.919810);
        let gainPerSecond = tpPoints.add(1).log10().pow(gainpow);
        let gain = gainPerSecond.times(diff);
        if (hasUpgrade('tp', 24)) gain = gain.times(upgradeEffect('tp', 24));
        player.timesPower = player.timesPower.add(gain);
    }
},

    tabFormat: {
        "Upgrades": {
            content: ["main-display", "prestige-button", "blank", "times-power-display", "upgrades"]
        },
        "Milestones": {
            content: ["main-display", "prestige-button", "blank", "milestones"]
        },
        "Buyables": {
            content: ["main-display", "prestige-button", "blank", "buyables"]
        },
    },

    upgrades: {
        11: {
            title: "时间的力量...",
            description: "软上限弱化1.25,二重软上限弱化1.25,之前所有资源获取*(TP+10)^2",
            cost: new Decimal(1),
            effect() {
                let base = player.tp.points.add(10);
                let raw = base.pow(2);
                let cap = new Decimal("1e38");
                if (raw.lte(cap)) return raw;
                let ratio = raw.div(cap);
                let capped = ratio.pow(new Decimal(0.78).div((player.tp.points.add(1).log10().add(1).log10().add(1))));
                return cap.times(capped);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        12: {
            title: "改变...",
            description: "三重软上限延迟1e314",
            cost: new Decimal(1),
            unlocked() { return hasUpgrade('tp', 11) }, 
        },
        13: {
            title: "碎片化...",
            description: "解锁时间碎片,tp增加tp获取",
            cost: new Decimal(3),
            effect() {
                let base = player.tp.points.add(1);
                let raw = base.pow(0.33);
                let cap = new Decimal("1e38");
                if (raw.lte(cap)) return raw;
                let ratio = raw.div(cap);
                let capped = ratio.pow(new Decimal(0.114514).div((player.tp.points.add(1).log10().add(1).log10().add(1))));
                return cap.times(capped);
            },
             unlocked() { return hasUpgrade('tp', 12) }, 
             effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        14: {
            title: "时间之晶？",
            description: "解锁时间之晶,时间碎片效果公式提升至0.52",
            cost: new Decimal(65536),
            unlocked() { return hasUpgrade('tp', 13) }
        },
        15: {
            title: "时蚀之刻",
            description: "解锁时蚀之刻,时间碎片效果公式提升至0.66,升级'1e288'效果再^2.026",
            cost: new Decimal(114514),
            unlocked() { return hasUpgrade('tp', 14) }
        },
         21: {
        title: "时间之力",
        description: "解锁 Times power,自动获得 +[log10(TP+1)]^1.14514/秒,基于(tpr+1)^1.3给TP一个获取倍数",
        cost: new Decimal(1919810),   // 根据平衡调整成本
        unlocked() { return hasUpgrade('tp', 15); }, // 可根据需要调整前置
        effectDisplay() {
            let tpPoints = player.tp.points;
        let gainpow = new Decimal(1.14514);
        if(hasUpgrade('tp', 22)) gainpow = new Decimal(1.919810);
            let gainPerSec = tpPoints.add(1).log10().pow(gainpow);
            if(hasUpgrade('tp', 24)) gainPerSec = gainPerSec.times(upgradeEffect('tp', 24));
            return `+${format(gainPerSec)}/s`;
        }

    },
    22: {
        title: "优化时间",
        description: "优化Tpr自动获得指数为1.919810",
        cost: new Decimal(1e9),   // 根据平衡调整成本
        unlocked() { return hasUpgrade('tp', 21); }, // 可根据需要调整前置
        
    },
    23: {
        title: "时间浮动",
        description: "优化Tpr效果指数为2.026",
        cost: new Decimal(1e16),   // 根据平衡调整成本
        unlocked() { return hasUpgrade('tp', 22); }, // 可根据需要调整前置
        
    },
    24: {
        title: "时间扭曲",
        description: "Tpr自动获得*(tpr+1)^0.1919810",
        cost: new Decimal(1e25),   // 根据平衡调整成本
        unlocked() { return hasUpgrade('tp', 23); }, // 可根据需要调整前置
        effect() {
    // 确保 timesPower 是 Decimal 对象
    let tp = player.timesPower;
    if (!tp || !(tp instanceof Decimal)) tp = new Decimal(0);
    let base = tp.add(1);
    let raw = base.pow(0.1919810);
    let cap = new Decimal("1e38");
    if (raw.lte(cap)) return raw;
    let ratio = raw.div(cap);
    let capped = ratio.pow(0.114514);
    return cap.times(capped);
},
             effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        
    },
    25: {
        title: "时间侵蚀",
        description: "软上限(一重、二重、三重、四重)指数分别乘以1.02,1.03,1.04,1.05,至1e7000points解锁新内容",
        cost: new Decimal(1e36),   // 根据平衡调整成本
        unlocked() { return hasUpgrade('tp', 24); }, // 可根据需要调整前置
        
    },
    },

    
    buyables: {
    11: {
        title: "时间碎片",
        unlocked() { return hasUpgrade('tp', 13); },
        cost(x) {
            if (x.eq(0)) return new Decimal(1);
            let base = Decimal.pow(x.pow(2), x).floor();
            let discount = getTimeCrystalDiscount();
            let cost = base.times(discount).max(1);
            return cost;
        },
       effect(x) {
    if (x.eq(0)) return new Decimal(1);
    let exp;
    if (hasUpgrade('tp', 15)) exp = 0.66;
    else if (hasUpgrade('tp', 14)) exp = 0.52;
    else exp = 0.5;
    let raw = x.pow(exp).div(10).add(1);
    // 软上限：效果 > 1 时，取其平方根
    if (raw.gt(1)) {
        return raw.sqrt();
    }
    return raw;
},
        display() {
            let x = player[this.layer].buyables[this.id] || new Decimal(0);
            let cost = tmp[this.layer].buyables[this.id]?.cost || new Decimal(0);
            let eff = tmp[this.layer].buyables[this.id]?.effect || new Decimal(1);
            let limit = getTimeFragmentBaseLimit();
            return `花费: ${format(cost)} TP\n已购买: ${formatWhole(x)} / ${formatWhole(limit)}\n效果: 升级21效果 ^${format(eff,4,true)}`;
        },
        canAfford() {
            let cost = tmp[this.layer].buyables[this.id]?.cost;
            if (!cost) return false;
            return player[this.layer].points.gte(cost);
        },
        buy() {
            let x = player[this.layer].buyables[this.id] || new Decimal(0);
            let limit = getTimeFragmentBaseLimit().floor();
            if (x.gte(limit)) return;
            let cost = tmp[this.layer].buyables[this.id].cost;
            player[this.layer].points = player[this.layer].points.sub(cost);
            player[this.layer].buyables[this.id] = x.add(1);
            updateTemp();
        },
    },
    12: {
        title: "时间之晶",
        unlocked() { return hasUpgrade('tp', 14); },
        cost(x) {
            if (x.eq(0)) return new Decimal(4);
            return Decimal.pow(5, x).floor();
        },
        effect(x) {
            if (x.eq(0)) return new Decimal(1);
            return Decimal.pow(x.div(114514), x);
        },
        display() {
    let x = player[this.layer].buyables[this.id] || new Decimal(0);
    let cost = tmp[this.layer].buyables[this.id]?.cost || new Decimal(0);
    let discount = getTimeCrystalDiscount();
    let limitBonus = new Decimal(1.425).pow(getTimeCrystalLimitBonus()).add(1);
    return `花费: ${format(cost)} 时间碎片\n已购买: ${formatWhole(x)} / 4\n效果: 时间碎片成本 x${format(discount, 4, true)}，上限 *${format(limitBonus, 4, true)}`;
},
        canAfford() {
            let need = tmp[this.layer].buyables[this.id]?.cost;
            if (!need) return false;
            let have = player[this.layer].buyables[11] || new Decimal(0);
            return have.gte(need);
        },
        buy() {
            let x = player[this.layer].buyables[this.id] || new Decimal(0);
            if (x.gte(4)) return;
            let cost = tmp[this.layer].buyables[this.id].cost;
            player[this.layer].buyables[11] = player[this.layer].buyables[11].sub(cost);
            player[this.layer].buyables[this.id] = x.add(1);
            updateTemp();
        },
        purchaseLimit: 4,
    },
    13: {
    title: "时蚀之刻",
    unlocked() { return hasUpgrade('tp', 15); },
    cost(x) {
        if (x.eq(0)) return new Decimal(1);
        return Decimal.pow(2, x).floor();
    },
    effect(x) {
        if (x.eq(0)) return new Decimal(1);
        return Decimal.pow(1.05, x);
    },
    display() {
        let x = player[this.layer].buyables[this.id] || new Decimal(0);
        let cost = tmp[this.layer].buyables[this.id]?.cost || new Decimal(0);
        let factor1 = getEclipseMultiplier(1);
        let factor2 = getEclipseMultiplier(2);
        let factor3 = getEclipseMultiplier(3);
        return `花费: ${format(cost)} 时间碎片\n已购买: ${formatWhole(x)} / 10\n效果: 一重软上限指数 *${format(factor1, 4, true)}\n      二重软上限指数 *${format(factor2, 4, true)}\n      三重软上限指数 *${format(factor3, 4, true)}`;
    },
    canAfford() {
        let need = tmp[this.layer].buyables[this.id]?.cost;
        if (!need) return false;
        let have = player[this.layer].buyables[11] || new Decimal(0);
        return have.gte(need);
    },
    buy() {
        let x = player[this.layer].buyables[this.id] || new Decimal(0);
        if (x.gte(10)) return;   // 上限检查
        let cost = tmp[this.layer].buyables[this.id].cost;
        player[this.layer].buyables[11] = player[this.layer].buyables[11].sub(cost);
        player[this.layer].buyables[this.id] = x.add(1);
        updateTemp();
    },
    purchaseLimit: 10,   // 框架可能自动使用该值，双重保障
}
},milestones: {
        1: {
            requirementDescription: "1 tp",
            effectDescription: "自动购买p层升级",
            done() { 
                return player.tp.points.gte(1) 
            },
            onComplete() {
                console.log("里程碑解锁: 1 tp");
            }
        },
        2: {
            requirementDescription: "3 tp",
            effectDescription: "自动购买sp层升级",
            done() { 
                return player.tp.points.gte(3) 
            },
            onComplete() {
                console.log("里程碑解锁: 3 tp");
            }
        },
        3: {
            requirementDescription: "5 tp",
            effectDescription: "自动购买a层升级",
            done() { 
                return player.tp.points.gte(5) 
            },
            onComplete() {
                console.log("里程碑解锁: 5 tp");
            }
        },
    },})
    addLayer("pp", {
    name: "Points Power",
    symbol: "PP",
    position: 0,
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),      // 当前 PP 点数
            bestPoints: new Decimal(0),  // 历史最高点数（用于计算上限）
        };
    },
    color: "#fd6868ff",
    requires: new Decimal("1e7000"),    // 需要 1e7000 点数才能解锁
    resource: "PP 点",
    baseResource: "points",
    baseAmount() { return player.points; },
    type: "normal",
    
    // 重置时获得 PP 点的公式：log10(points+1)，但受上限限制
    getResetGain() {
        let currentPP = player.pp.points;
        let maxPoints = player.pp.bestPoints.max(player.points); // 历史最高点数
        let cap = maxPoints.add(1).log10();                       // 上限 = log10(最高点数+1)
        let rawGain = player.points.add(1).log10();               // 理论获得值
        let gain = rawGain.sub(currentPP).max(0);                 // 不超过上限的部分
        if (currentPP.add(gain).gt(cap)) gain = cap.sub(currentPP).max(0);
        return gain.floor().max(0);
    },
    
    exponent: function() { return new Decimal(1); },  // PP 层本身获取不受其他加成影响（可选）
    gainMult() { return new Decimal(1); },
    gainExp() { return new Decimal(1); },
    row: 4,
    hotkeys: [
        { key: "P", description: "P: Reset for PP points", onPress(){ if(canReset(this.layer)) doReset(this.layer); } }
    ],
    layerShown() { 
        return player.points.gte("1e7000") || player.pp?.points?.gte(1); 
    },
    tabFormat: {
        "Upgrades": { content: ["main-display", "prestige-button", "blank", "upgrades"] },
        "Milestones": { content: ["main-display", "prestige-button", "blank", "milestones"] }
    },
    
    // 每次重置前更新 bestPoints
    onPrestige(gain) {
        player.pp.bestPoints = player.pp.bestPoints.max(player.points);
    },
    
    upgrades: {11: {
    title: "点数指数",
    description: "每秒点数获取^(pp+1)^ {(1+lg(lg(pp+1)+1))/ (2(lg(pp+1)+10))},先于软上限生效",
    cost: new Decimal(7000), 
    unlocked() { return true; }, // 始终解锁（或根据你的条件）
    effect() {
        let x = player.pp.points;
        if (x.eq(0)) return new Decimal(1); // 防止无意义计算
        // 计算 log10(x+1)
        let logX = x.add(1).log10();
        // 计算 log10(log10(x+1)+1)
        let logLog = logX.add(1).log10();
        // 指数 numerator = 1 + logLog
        let numerator = new Decimal(1).add(logLog);
        // 分母 denominator = 2 * (logX + 10)
        let denominator = new Decimal(4).times(logX.add(10));
        // 最终指数 exponent = numerator / denominator
        let exponent = numerator.div(denominator);
        // 返回 y = (x+1)^exponent
        let y = x.add(1).pow(exponent);
        // 防止过大，可加软上限（可选）
        let cap = new Decimal("9"); // 或更大
        if (y.gt(cap)) y = cap;
        return y;
    },
    effectDisplay() { return "^" + format(upgradeEffect(this.layer, this.id)); }
},
    12: {
        title: "指数软化",
        description: "软上限(三重、四重)指数再分别乘以1.3,1.4",
        cost: new Decimal(7000),   // 根据平衡调整成本
        unlocked() { return hasUpgrade('pp', 11); }, // 可根据需要调整前置
        
    },    
    13: {
        title: "指数自动",
        description: "自动购买sa,lw,re层升级",
        cost: new Decimal(7000),   // 根据平衡调整成本
        unlocked() { return hasUpgrade('pp', 12); }, // 可根据需要调整前置
        
    },   
        // 更多升级可继续添加
    },
    
    milestones: {
        0: {
            requirementDescription: "7000 PP 点",
            effectDescription: "每秒获得重置时sa,lw,re的0.1%.",
            done() { return player.pp.points.gte(7000); },
        },
        
    },
});
addLayer("ach", {
    name: "Achievements",
    symbol: "A",
    position: 0,
    row: "side",
    color: "#fbff00ff",
    resource: "achievements",
    type: "none",

    startData() { return { unlocked: true, points: new Decimal(0) } },
    layerShown() { return true },

    achievements: {

    },
});