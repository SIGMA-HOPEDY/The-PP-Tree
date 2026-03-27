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
        effect() {if (player.p.points.add(1).pow(0.5)>1e38) 
            return (1e38*((player.p.points.div(1e38)).add(1).pow(0.05))); else
            return player.p.points.add(1).pow(0.5)
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
    },
    13: {
        title: "03",
        description: "基于你的点数提升p点获取。",
        cost: new Decimal(10),  
        unlocked() { return hasUpgrade('p', 12) }, 
            effect() {
        return player.points.add(1).pow(0.175)
    }, effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },   },
    14: {
        title: "04",
        description: "基于你的p点提升p点获取。",
        cost: new Decimal(250),  
        unlocked() { return hasUpgrade('p', 13) }, 
            effect() {
        return player.p.points.add(1).pow(0.135)
    },  effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },  },
     15: {
        title: "05",
        description: "基于你的p点提升sp点获取。",
        cost: new Decimal(10000),  
        unlocked() { return hasUpgrade('p', 14) }, 
            effect() {
        return player.p.points.add(1).pow(0.0725)
    },  effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },  },
    21: {
        title: "06",
        description: "基于你的点数提升点数获取。",
        cost: new Decimal(1000000),  
        unlocked() { return hasUpgrade('p', 15) }, 
            effect() {
        return player.points.add(1).pow(0.135)
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
        return player.p.points.add(1).pow(0.015)
    },  effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },  },
    24: {
        title: "09",
        description: "p点获取*p点^0.025.",
        cost: new Decimal(1e20),  
        unlocked() { return hasUpgrade('p', 23) }, 
             effect() {
        return player.p.points.add(1).pow(0.025)
    },  effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },  },
    25: {
        title: "10",
        description: "点数获取*p点^0.125",
        cost: new Decimal(1e25),  
        unlocked() { return hasUpgrade('p', 24) }, 
             effect() {
        return player.p.points.add(1).pow(0.1)
    },  effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },  },
    31: {
        title: "多出来的升级?",
        description: "点数获取*点数获取^0.025",
        cost: new Decimal(1e38),  
        unlocked() { return hasUpgrade('p', 25) }, 
             effect() {
        return player.points.add(1).pow(0.05)
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
        let exp = 0.4;
        if (hasMilestone('sp', 2)) exp = exp + 0.05;
        if (hasMilestone('sp', 4)) exp = exp + 0.05;
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

        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    passiveGeneration: function() {
        let passiveGeneration = 0;
        if (hasUpgrade('a', 64)) passiveGeneration = passiveGeneration+0.01;
        if (hasUpgrade('a', 65)) passiveGeneration = passiveGeneration+0.99;
        return passiveGeneration;
    },
    row: 1, // 放在第二行（0是第一行，1是第二行）
    hotkeys: [
        {key: "s", description: "S: Reset for second prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    // 在mod.js中查找类似这样的函数

    layerShown() {
        return true // 可以根据解锁状态调整，例如：return player.sp.unlocked
    },
    upgrades: {31: {    title: "11",
    description: "双倍p点获取,基于你的sp点小幅度提升点数获取.",
    cost: new Decimal(1),
effect() {
        return player.sp.points.add(1).pow(0.3)
    },  effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },  
        }, 
        32: {
        title: "12",
        description: "基于你的sp点提升P点获取。",
        cost: new Decimal(25),  
        unlocked() { return hasUpgrade('sp', 31) }, 
        effect() {if (player.sp.points.add(1).pow(0.35)>1e38) 
            return (1e38*player.sp.points.add(1).pow(0.035)); else
            return player.sp.points.add(1).pow(0.35)
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },},
    33: {
        title: "13",
        description: "基于你的sp点提升sp点获取。",
        cost: new Decimal(1e9),  
        unlocked() { return hasUpgrade('sp', 32) }, 
            effect() {
        return player.sp.points.add(1).pow(0.025)
    },  effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },  },
    34: {
        title: "14",
        description: "基于你的sp点提升点数获取。",
        cost: new Decimal(1e15),  
        unlocked() { return hasUpgrade('sp', 33) }, 
            effect() {if (player.sp.points.add(1).pow(0.33)>1e38) 
            return (1e38*((player.sp.points.div(1e38)).add(1).pow(0.165))); else
            return player.sp.points.add(1).pow(0.33)},
   effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },  },
   35: {
        title: "15",
        description: "基于你的sp点提升点数获取。",
        cost: new Decimal(1e38),  
        unlocked() { return hasUpgrade('sp', 34) }, 
            effect() {if (player.sp.points.add(1).pow(0.25)>1e38) 
            return (1e38*((player.sp.points.div(1e38)).add(1).pow(0.125))); else
            return player.sp.points.add(1).pow(0.25)},
   effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },  },
   41: {
        title: "16",
        description: "基于你的sp点提升sp点获取指数。",
        cost: new Decimal(1e100),  
        unlocked() {  return hasUpgrade('sp', 35)}, 
            effect() {if ((player.sp.points.add(1).pow(0.0001).add(-1))>1) 
            return (1e38*((player.sp.points.div(1e38)).add(1).pow(0.000025))); else
            return player.sp.points.add(1).pow(0.0001)},
   effectDisplay() { return "+"+format(upgradeEffect(this.layer, this.id).add(-1)) },  },
   42: {
        title: "17",
        description: "基于你的点数提升sp点获取。",
        cost: new Decimal(1e120),  
        unlocked() { return hasUpgrade('sp', 41) }, 
            effect() {if (player.points.add(1).pow(0.025)>1e38) 
            return (1e38*((player.points.div(1e38)).add(1).pow(0.0125))); else
            return player.points.add(1).pow(0.025)},
   effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },  },
   43: {
        title: "18",
        description: "基于你的sp点提升amplifier获取。",
        cost: new Decimal(1e150),  
        unlocked() { return hasUpgrade('sp', 42) }, 
            effect() {if (player.sp.points.add(1).pow(0.005)>1e38) 
            return (1e38*((player.sp.points.div(1e38)).add(1).pow(0.0025))); else
            return player.sp.points.add(1).pow(0.005)},
   effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },  },
    44: {
        title: "19",
        description: "软上限再弱化1.03125",
        cost: new Decimal(1e175),  
        unlocked() { return hasUpgrade('sp', 43) }, 
            },
     45: {
        title: "20",
        description: "软上限再弱化1.0325",
        cost: new Decimal(1e180),  
        unlocked() { return hasUpgrade('sp', 44) }, 
            },
    51: {
        title: "666还有第二关",
        description: "软上限再弱化1.0335",
        cost: new Decimal(1e200),  
        unlocked() { return hasUpgrade('sp', 45) }, 
            },
    },
})
        // 这里可以定义该层的升级，结构参考P层 

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
    color: "#1900ffff",
    requires: new Decimal(1e6), // 需要1e6个P点才能解锁此层
    resource: "amplifier", // 该层的货币名称
    baseResource: "prestige points", // 基于的货币（P点）
    baseAmount() { return player.p.points }, // 这里应指向P层的点数，注意路径
    type: "normal", 
   exponent: function() {
        let exp = 0.02;
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
        return true // 可以根据解锁状态调整，例如：return player.a.unlocked
    },

    upgrades: {51: {
        title: "21",
        description: "基于你的amplifier提升点数,P点,sp点获取。(加成不低于10)",
        cost: new Decimal(1),  
            effect() {
                {if (player.a.points.add(10).pow(1)>1e38) 
            return (1e38*((player.a.points.div(1e38)).add(10).pow(0.78))); else
            return player.a.points.add(10).pow(1)}
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
        return player.a.points.add(100).pow(0.5)
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
        description: "软上限弱化1.03",
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
        description: "软上限再弱化1.035",
        cost: new Decimal(1e17),  
        unlocked() { return hasUpgrade('a', 65)&& hasUpgrade('sp', 51) },
             }, 
 72: {
        title: 
        "这是...?",
        description: "点数获取*100",
        cost: new Decimal(1e18),  
        unlocked() { return hasUpgrade('a', 71) },
             },          
73: {
        title: 
        "三相之力?",
        description: "软上限再弱化1.0375,点数获取*100",
        cost: new Decimal(2.5e18),  
        unlocked() { return hasUpgrade('a', 72) },
             },             
    }
}
)