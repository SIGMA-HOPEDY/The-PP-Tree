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

addLayer("A", {
    name: "α",
    symbol: "α",
    position: 0,
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
    }},
    color: "#e100ffff",
    requires: new Decimal(10),
    resource: "Alpha particles",
    baseResource: "points",
    baseAmount() {return player.points},
    type: "normal",
    exponent: function() {
        let exp = new Decimal(0.8);
        return exp;
    },
    passiveGeneration: function() {
        let passiveGeneration = 0;
        return passiveGeneration;
    },
    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade('A', 23)) mult = mult.mul(upgradeEffect('A', 23))
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    row: 0,
    hotkeys: [
        {},
    ],
    tabFormat: {
        "Upgrades": {
            content: ["main-display", "prestige-button", "blank", "upgrades"]
        },
        "Buyables": {
            content: ["main-display", "prestige-button", "blank", "buyables"]
        },
    },
    layerShown(){return true},
    upgrades: {11: {
        title: "初始的粒子",
        description: "粒子生成基数+1,Alpha粒子增幅粒子生成",
        cost: new Decimal(0),
        effect: function() {let exp=0.333
            let base = player.A.points.add(1).pow(exp);
            return base;
        },
        effectDisplay() { return '*'+format(upgradeEffect(this.layer, this.id),4,true) }, 
        unlocked: function() {
            return true;
        }
    },12: {
        title: "粒子生成器",
        description: "解锁粒子生成器,粒子生成基数+1",
        cost: new Decimal(1),
        effect: function() {
            return new Decimal(1);
        },
        unlocked: function() {
            return hasUpgrade('A', 11);
        }
    },13: {
        title: "粒子碰撞",
        description: "粒子极小幅度增加粒子生成基数",
        cost: new Decimal(3),
        effect: function() {let exp=1.5
            let base = player.points.add(10).log10().pow(exp);
            return base;
        },
        unlocked: function() {
            return hasUpgrade('A', 12);
        },effectDisplay() { return '+'+format(upgradeEffect(this.layer, this.id),4,true) }, 
    },14: {
        title: "粒子增幅器",
        description: "解锁粒子增幅器,粒子生成*2",
        cost: new Decimal(10),
        effect: function() {
            return new Decimal(2);
        },
        unlocked: function() {
            return hasUpgrade('A', 13);
        }, 
    },15: {
        title: "粒子激发",
        description: "粒子极小幅度增幅粒子生成",
        cost: new Decimal(50),
        effect: function() {let exp=1.25
            let base = player.points.add(10).log10().pow(exp);
            return base;
        },
        unlocked: function() {
            return hasUpgrade('A', 14);
        },effectDisplay() { return '*'+format(upgradeEffect(this.layer, this.id),4,true) }, 
    },21: {
        title: "粒子振荡器",
        description: "解锁粒子振荡器,粒子生成^1.1",
        cost: new Decimal(100),
        effect: function() {
            return new Decimal(1.1);
        },
        unlocked: function() {
            return hasUpgrade('A', 15);
        }, 
    },22: {
        title: "粒子振荡",
        description: "粒子极小幅度增幅粒子生成指数",
        cost: new Decimal(500),
        effect: function() {let exp=0.05
            let base = player.points.add(10).log10().pow(exp);
            return base;
        },
        unlocked: function() {
            return hasUpgrade('A', 21);
        },effectDisplay() { return '^'+format(upgradeEffect(this.layer, this.id),4,true) }, 
        },
        23: {
        title: "alpha粒子",
        description: "粒子小幅度增幅alpha粒子",
        cost: new Decimal(1000),
        effect: function() {let exp=0.125
            let base = player.points.add(1).pow(exp);
            return base;
        },
        unlocked: function() {
            return hasUpgrade('A', 22);
        },effectDisplay() { return '*'+format(upgradeEffect(this.layer, this.id),4,true) }, 
        },24: {
        title: "生成增幅",
        description: "Alpha粒子较小幅度增幅粒子生成器效果",
        cost: new Decimal(5000),
        effect: function() {let exp=0.25
            let base = player.A.points.add(1).pow(exp);
            return base;
        },
        unlocked: function() {
            return hasUpgrade('A', 23);
        },effectDisplay() { return '*'+format(upgradeEffect(this.layer, this.id),4,true) }, 
        },25: {
        title: "增幅增幅",
        description: "Alpha粒子小幅度增幅粒子增幅器效果",
        cost: new Decimal(1e4),
        effect: function() {let exp=0.125
            let base = player.A.points.add(1).pow(exp);
            return base;
        },
        unlocked: function() {
            return hasUpgrade('A', 24);
        },effectDisplay() { return '*'+format(upgradeEffect(this.layer, this.id),4,true) }, 
        },
    },
    buyables: {
        11: {
            title: "粒子生成器",
            unlocked() { return hasUpgrade('A', 12); },
            cost(x) {
                if (x.eq(0)) return new Decimal(10);
                let base = Decimal.pow(1.25, x).times(10).floor();
                let cost = base.times(1).max(10);
                return cost;
            },
            effect(x) {
                if (x.eq(0)) return new Decimal(1);
                let exp = 1;
                let mult = new Decimal(1);
                if (hasUpgrade('A', 24)) mult = mult.mul(upgradeEffect('A', 24))
                let raw = x.times(mult).pow(exp);
                if (raw.gt(1e88)) {
                    return raw.sqrt();
                }
                return raw;
            },
            display() {
                let x = player[this.layer].buyables[this.id] || new Decimal(0);
                let cost = tmp[this.layer].buyables[this.id]?.cost || new Decimal(0);
                let eff = tmp[this.layer].buyables[this.id]?.effect || new Decimal(1);
                let limit = getLimit();
                return `花费: ${format(cost)} α\n已购买: ${formatWhole(x)} / ${formatWhole(limit)}\n效果: particle+${format(eff,4,true)}/S`;
            },
            canAfford() {
                let cost = tmp[this.layer].buyables[this.id]?.cost;
                if (!cost) return false;
                return player[this.layer].points.gte(cost);
            },
            buy() {
                let x = player[this.layer].buyables[this.id] || new Decimal(0);
                let limit = getLimit().floor();
                if (x.gte(limit)) return;
                let cost = tmp[this.layer].buyables[this.id].cost;
                player[this.layer].points = player[this.layer].points.sub(cost);
                player[this.layer].buyables[this.id] = x.add(1);
                updateTemp();
            },
        },
        12: {
            title: "粒子增幅器",
            unlocked() { return hasUpgrade('A', 14); },
            cost(x) {
                if (x.eq(0)) return new Decimal(100);
               let base = Decimal.pow(2.5, x).times(100).floor();
                let cost = base.times(1).max(100);
                return cost;
            },
            effect(x) {
                if (x.eq(0)) return new Decimal(1);
                let exp = 1;
                let mult = new Decimal(1);
                if (hasUpgrade('A', 25)) mult = mult.mul(upgradeEffect('A', 25))
                let raw = x.div(10).add(1).times(mult).pow(exp);
                if (raw.gt(1e88)) {
                    return raw.sqrt();
                }
                return raw;
            },
            display() {
                let x = player[this.layer].buyables[this.id] || new Decimal(0);
                let cost = tmp[this.layer].buyables[this.id]?.cost || new Decimal(0);
                let eff = tmp[this.layer].buyables[this.id]?.effect || new Decimal(1);
                let limit = getLimit();
                return `花费: ${format(cost)} α\n已购买: ${formatWhole(x)} / ${formatWhole(limit)}\n效果: particle/s*${format(eff,4,true)}`;
            },
            canAfford() {
                let cost = tmp[this.layer].buyables[this.id]?.cost;
                if (!cost) return false;
                return player[this.layer].points.gte(cost);
            },
            buy() {
                let x = player[this.layer].buyables[this.id] || new Decimal(0);
                let limit = getLimit().floor();
                if (x.gte(limit)) return;
                let cost = tmp[this.layer].buyables[this.id].cost;
                player[this.layer].points = player[this.layer].points.sub(cost);
                player[this.layer].buyables[this.id] = x.add(1);
                updateTemp();
            },
        },
        13: {
            title: "粒子振荡器",
            unlocked() { return hasUpgrade('A', 21); },
            cost(x) {
                if (x.eq(0)) return new Decimal(1000);
                let base = Decimal.pow(5, x).times(1000).floor();
                let cost = base.times(1).max(1000);
                return cost;
            },
            effect(x) {
                if (x.eq(0)) return new Decimal(1);
                let exp = 1;
                let raw = x.div(100).add(1).pow(exp);
                if (raw.gt(2)) {
                    return raw.add(10).log10().sqrt().add(1);
                }
                return raw;
            },
            display() {
                let x = player[this.layer].buyables[this.id] || new Decimal(0);
                let cost = tmp[this.layer].buyables[this.id]?.cost || new Decimal(0);
                let eff = tmp[this.layer].buyables[this.id]?.effect || new Decimal(1);
                let limit = getLimit();
                return `花费: ${format(cost)} α\n已购买: ${formatWhole(x)} / ${formatWhole(limit)}\n效果: particle/s^${format(eff,4,true)}`;
            },
            canAfford() {
                let cost = tmp[this.layer].buyables[this.id]?.cost;
                if (!cost) return false;
                return player[this.layer].points.gte(cost);
            },
            buy() {
                let x = player[this.layer].buyables[this.id] || new Decimal(0);
                let limit = getLimit().floor();
                if (x.gte(limit)) return;
                let cost = tmp[this.layer].buyables[this.id].cost;
                player[this.layer].points = player[this.layer].points.sub(cost);
                player[this.layer].buyables[this.id] = x.add(1);
                updateTemp();
            },
        },
    },
});
