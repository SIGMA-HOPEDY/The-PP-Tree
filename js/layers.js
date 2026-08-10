addLayer("p", {
    name: "prestige",
    symbol: "P",
    position: 0,
    startData() { return { unlocked: true, points: new Decimal(0) } },
    color: "#4BDC13",
    requires: new Decimal(10),
    resource: "prestige points",
    baseResource: "points",
    baseAmount() { return player.points },
    type: "normal",
    
    exponent: function() {
        let exp = new Decimal(0.52);
        if (hasUpgrade('sp', 33)) exp = exp.add(upgradeEffect('sp', 33));
        if (hasUpgrade('sa', 21)) exp = exp.add(upgradeEffect('sa', 21));
        if (hasUpgrade('m', 62)) exp = exp.times(upgradeEffect('m', 62));
        if (hasUpgrade('a', 12)) exp = exp.times(1.01);
        if (hasUpgrade('pp', 13)) exp = exp.times(1.01);
        return exp;
    },
    passiveGeneration: function() {
        let p = 0;
        if (hasUpgrade('a', 14)) p += 0.01;
        if (hasUpgrade('a', 22)) p += 0.09;
        if (hasUpgrade('a', 23)) p += 0.9;
        if (hasUpgrade('sa', 11)) p += 9;
        if (hasMilestone('ach', 3)) p += 90;
        return p;
    },
    autoUpgrade: function() { return hasMilestone('ach', 0) && player.autoPUpgrade; },
    gainMult() {
        let m = new Decimal(1);
        if (hasUpgrade('p', 13)) m = m.times(upgradeEffect('p', 13));
        if (hasUpgrade('p', 14)) m = m.times(upgradeEffect('p', 14));
        if (hasUpgrade('sp', 11)) m = m.times(2);
        if (hasUpgrade('sp', 12)) m = m.times(upgradeEffect('sp', 12));
        if (hasUpgrade('a', 11)) m = m.times(upgradeEffect('a', 11).pow(0.66));
        if (hasMilestone('sp', 1)) m = m.times(1.2);
        if (hasMilestone('sp', 4)) m = m.times(1.5);
        if (hasMilestone('sp', 5)) m = m.times(10);
        if (hasUpgrade('p', 23)) m = m.times(upgradeEffect('p', 23));
        if (hasUpgrade('p', 24)) m = m.times(upgradeEffect('p', 24));
        if (hasUpgrade('sa', 12)) m = m.times(upgradeEffect('sa', 12));
        if (hasUpgrade('tp', 11)) m = m.times(upgradeEffect('tp', 11));
        if (hasUpgrade('p', 41)) m = m.times(upgradeEffect('p', 41));
        if (hasUpgrade('p', 42)) m = m.times(upgradeEffect('p', 42));
        if (hasUpgrade('p', 43)) m = m.times('1e1000');
        if (hasUpgrade('sp', 42)) m = m.times(upgradeEffect('sp', 42));
        if (hasMilestone('tp', 0)) m = m.times(1e20);
        if (hasChallenge('pp', 12)) m = m.times(1e100);
        if (hasUpgrade('lw', 21)) m = m.times(upgradeEffect('lw', 21));
        if (hasUpgrade('re', 21)) m = m.times(upgradeEffect('re', 21));
        if (hasUpgrade('sa', 42)) m = m.times(upgradeEffect('sa', 42));
        let buyEff = tmp.p?.buyables?.[11]?.effect;
        if (buyEff) m = m.times(buyEff);
        return m;
    },
    gainExp() { return new Decimal(1) },
    row: 0,
    hotkeys: [
        { key: "", description: "", onPress() { if (canReset(this.layer)) doReset(this.layer) } }
    ],
   tabFormat: {
    "Upgrades": {
        content: ["main-display", "prestige-button", "blank", "upgrades"]
    },
    "Buyables": {
        content: ["main-display", "prestige-button", "blank", "buyables"],
        unlocked() { return hasUpgrade('pp', 31); }
    }
},
    layerShown() { return true },
buyables: {
        11: {
            title: "自增器",
            cost(x) {
                if (x.eq(0)) return new Decimal(1);
                let base = x.add(3).times(10);
                let exp = x.times(x.add(1)).pow(x.add(10).log10().div(3).add(1));
                return Decimal.pow(base, exp).floor();
            },
           // 免费数量（预留扩展）
    freeAmount() {
        return new Decimal(0);
    },
    effect(x) {
        let total = x.add(this.freeAmount());
        if (total.eq(0)) return new Decimal(1);
        let base = total.add(10).times(10);
        if (hasUpgrade('sp', 43)) base = base.times(upgradeEffect('sp', 43));
        if (hasUpgrade('sp', 44)) base = base.times(upgradeEffect('sp', 44));
        let exp = total.pow(total.add(10).log10().div(2).add(1.01));
        return Decimal.pow(base, exp);
    },
    display() {
        let bought = getBuyableAmount(this.layer, this.id);
        let free = this.freeAmount();
        let cost = tmp[this.layer].buyables[this.id]?.cost || new Decimal(0);
        let eff = tmp[this.layer].buyables[this.id]?.effect || new Decimal(1);
        return `花费: ${format(cost)}P点\n已购买: ${formatWhole(bought)}+${formatWhole(free)}\n效果: P点获取*${format(eff)}`;
    },
            canAfford() {
                let cost = tmp[this.layer].buyables[this.id]?.cost;
                return cost !== undefined && player[this.layer].points.gte(cost);
            },
            buy() {
                let x = getBuyableAmount(this.layer, this.id);
                let cost = tmp[this.layer].buyables[this.id].cost;
                player[this.layer].points = player[this.layer].points.sub(cost);
                player[this.layer].buyables[this.id] = x.add(1);
                updateTemp();
            },
            buyMax() {
                let x = player.p.buyables[11] || new Decimal(0);
                let points = player.p.points;
                let count = 0;
                let totalCost = new Decimal(0);
                while (count < 50) {
                    let nextCost = this.cost(x.add(count));
                    let newTotal = totalCost.add(nextCost);
                    if (points.gte(newTotal)) {
                        totalCost = newTotal;
                        count++;
                    } else break;
                }
                if (count > 0) {
                    player.p.points = points.sub(totalCost);
                    player.p.buyables[11] = x.add(count);
                    updateTemp();
                }
            },
            unlocked() { return hasUpgrade('pp', 31) }
        }
    },

    upgrades: {
        rows: 5, cols: 5,
        11: { title: "01", description: "双倍点数获取", cost: new Decimal(1) },
        12: {
            title: "02", description: "基于你的p点提升点数获取", cost: new Decimal(5),
            unlocked() { return hasUpgrade('p', 11) },
            effect() {
                if (inChallenge('m', 13)) {
        return new Decimal(1);
    }
                let raw = player.p.points.add(1).pow(0.5);
                if (hasChallenge('m', 13)) raw=raw.pow(1.004)
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, new Decimal(0.91).div(player.p.points.add(1).log10().add(1).log10().add(1)));
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        13: {
            title: "03", description: "基于你的点数提升p点获取(到100p点解锁SP重置)", cost: new Decimal(10),
            unlocked() { return hasUpgrade('p', 12) },
            effect() {
                let raw = player.points.add(1).pow(0.175);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, 0.0875);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        14: {
            title: "04", description: "基于你的p点提升p点获取", cost: new Decimal(250),
            unlocked() { return hasUpgrade('p', 13) },
            effect() {
                let raw = player.p.points.add(1).pow(0.135);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, 0.0675);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        15: {
            title: "05", description: "基于你的p点提升sp点获取(到1e6p点解锁A重置)", cost: new Decimal(10000),
            unlocked() { return hasUpgrade('p', 14) },
            effect() {
                let raw = player.p.points.add(1).pow(0.0725);
                let cap = new Decimal("1e9");
                return effectWithSoftcap(raw, cap, 0.03625);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        21: {
            title: "06", description: "基于你的点数提升点数获取", cost: new Decimal(1000000),
            unlocked() { return hasUpgrade('p', 15) },
            effect() {
                let raw = player.points.add(1).pow(0.1);
                let cap = new Decimal("1e9");
                return effectWithSoftcap(raw, cap, 0.05);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        22: {
            title: "07", description: "amplifier获取公式指数+0.03", cost: new Decimal(1e9),
            unlocked() { return hasUpgrade('p', 21) }
        },
        23: {
            title: "08", description: "p点获取*p点^0.1", cost: new Decimal(1e12),
            unlocked() { return hasUpgrade('p', 22) },
            effect() {
                let raw = player.p.points.add(1).pow(0.1);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, 0.05);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        24: {
            title: "09", description: "p点获取*p点^0.05", cost: new Decimal(1e20),
            unlocked() { return hasUpgrade('p', 23) },
            effect() {
                let raw = player.p.points.add(1).pow(0.05);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, 0.025);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        25: {
            title: "10", description: "点数获取*p点^0.125", cost: new Decimal(1e25),
            unlocked() { return hasUpgrade('p', 24) },
            effect() {
                let raw = player.p.points.add(1).pow(0.125);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, 0.0625);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        31: {
            title: "多出来的升级?", description: "点数获取*点数^0.05", cost: new Decimal(1e38),
            unlocked() { return hasUpgrade('p', 25) },
            effect() {
                let raw = player.points.add(1).pow(0.05);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, 0.025);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        32: {
            title: "666又来? 不对!", description: "软上限后点数获取*(1+点数^0.114514/114514)^1.4", cost: new Decimal("1e365"),
            unlocked() { return hasUpgrade('p', 31) && hasUpgrade('sa', 15) },
            effect() {
                let base = player.points.add(1).pow(0.114514).div(114514).add(1);
                let raw = base.pow(1.4);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, 0.7);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        33: {
            title: "更进一歩!", description: "二重软上限后点数获取*(1+lg(点数+1))^ {1.919810+lg(lg(点数+1)+1)}", cost: new Decimal("1e455"),
            unlocked() { return hasUpgrade('p', 32) },
            effect() {
                let base = player.points.add(1).log10().add(1);
                let exponent = player.points.add(1).log10().add(1).log10().add(1.919810);
                let raw = base.pow(exponent);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, 0.91);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        34: {
            title: "升级18太弱了!", description: "升级18效果^2.88(有神秘小彩蛋哦)", cost: new Decimal("1e465"),
            unlocked() { return hasUpgrade('p', 33) }
        },
        35: {
            title: "可笑的软上限", description: "软上限延迟1e14,弱化软上限1.14514,解锁一个新的LW升级", cost: new Decimal("1e475"),
            unlocked() { return hasUpgrade('p', 34) }
        },
        41: {
            title: "超越界限", description: "基于点数提升P点获取", cost: new Decimal("1e81750"),
            unlocked() { return hasUpgrade('pp', 31) },
            effect() {
                let raw = player.points.add(1).pow(0.02);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, 0.01);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        42: {
            title: "功率转换", description: "P点获取*(P点+1)^0.01", cost: new Decimal("1e81800"),
            unlocked() { return hasUpgrade('p', 41) },
            effect() {
                let raw = player.p.points.add(1).pow(0.01);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, 0.005);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        43: {
            title: "软上限溶解", description: "第五重软上限弱化2.5,P点获取*1e1000", cost: new Decimal("1e81900"),
            unlocked() { return hasUpgrade('p', 42) }
        },
        44: {
            title: "指数共鸣", description: "前五重软上限弱化1.04", cost: new Decimal("1e83200"),
            unlocked() { return hasUpgrade('p', 43) }
        },
        45: {
            title: "终极增幅-P", description: "点数获取^lg(P 点 + 1)/1e5(不低于1,硬上限为2),解锁一个PP挑战", cost: new Decimal("1e83202"),
            unlocked() { return hasUpgrade('p', 44) },
            effect() {
                let exp = player.p.points.add(1).log10().div(1e5).add(1);
                let cap = new Decimal("2");
                if (exp.gt(cap)) exp = cap;
                return exp;
            },
            effectDisplay() { return "^" + format(upgradeEffect(this.layer, this.id), 4, true) }
        }
    }
})
addLayer("sp", {
    name: "second prestige",
    symbol: "SP",
    position: 0,
    startData() { return { unlocked: false, points: new Decimal(0)} },
    color: "#ffc400",
    requires: new Decimal(100),
    resource: "second prestige points",
    baseResource: "prestige points",
    baseAmount() { return player.p.points },
    type: "normal",
    branches: ["p"],
    exponent: function() {
        let exp = new Decimal(0.45);
        if (hasMilestone('sp', 2)) exp = exp.add(0.05);
        if (hasMilestone('sp', 4)) exp = exp.add(0.05);
        if (hasUpgrade('sp', 21)) exp = exp.add(upgradeEffect('sp', 21));
        if (hasUpgrade('sp', 32)) exp = exp.add(upgradeEffect('sp', 32));
         if (hasUpgrade('m', 63)) exp = exp.times(upgradeEffect('m', 63));
        return exp;
    },
    milestonePopups: false,
    milestones: {
        0: { requirementDescription: "1 SP点", effectDescription: "点数获取速度*2", done() { return player.sp.points.gte(1) } },
        1: { requirementDescription: "5 SP点", effectDescription: "P点获取速度*1.2", done() { return player.sp.points.gte(5) } },
        2: { requirementDescription: "25 SP点", effectDescription: "点数获取速度*5,SP点获取指数+0.05", done() { return player.sp.points.gte(25) } },
        3: { requirementDescription: "1000 SP点", effectDescription: "进行SP重置不重置P升级", done() { return player.sp.points.gte(1000) } },
        4: { requirementDescription: "10000 SP点", effectDescription: "P点获取速度*1.5,SP点获取指数+0.05", done() { return player.sp.points.gte(10000) } },
        5: { requirementDescription: "1e6 SP点", effectDescription: "点数和P点获取*10", done() { return player.sp.points.gte(1e6) }, style: { "color": "#ff9900", "border": "2px solid #ff9900" } }
    },
    gainMult() {
        let m = new Decimal(1);
        if (hasUpgrade('p', 15)) m = m.times(upgradeEffect('p', 15));
        if (hasUpgrade('a', 11)) m = m.times(upgradeEffect('a', 11).pow(0.33));
        if (hasUpgrade('sa', 42)) m = m.times(upgradeEffect('sa', 42));
        if (hasUpgrade('a', 13)) m = m.times(upgradeEffect('a', 13));
        if (hasUpgrade('sp', 22)) m = m.times(upgradeEffect('sp', 22));
        if (hasUpgrade('sp', 13)) m = m.times(upgradeEffect('sp', 13));
        if (hasUpgrade('lw', 12)) m = m.times(upgradeEffect('lw', 12));
        if (hasUpgrade('tp', 11)) m = m.times(upgradeEffect('tp', 11));
        if (hasUpgrade('sa', 22)) m = m.times(upgradeEffect('sa', 22));
        if (hasChallenge('pp', 12)) m = m.times(1e38);
        if (hasMilestone('tp', 1)) m = m.times(1e10);
        if (hasChallenge('pp', 13)) m = m.times(1e100);
        if (hasUpgrade('lw', 22)) m = m.times(upgradeEffect('lw', 22));
        if (hasUpgrade('re', 22)) m = m.times(upgradeEffect('re', 22));
        let buyEff = tmp.sp?.buyables?.[11]?.effect;
        if (buyEff) m = m.times(buyEff);
        return m;
    },
    gainExp() { return new Decimal(1) },
    passiveGeneration: function() {
        let p = 0;
        if (hasUpgrade('a', 24)) p += 0.01;
        if (hasUpgrade('a', 25)) p += 0.99;
        if (hasUpgrade('lw', 11)) p += 1.5;
        if (hasUpgrade('lw', 14)) p += 7.5;
        if (hasMilestone('ach', 3)) p += 90;
        return p;
    },
    row: 1,
    hotkeys: [{ key: "", description: "", onPress() { if (canReset(this.layer)) doReset(this.layer) } }],
    layerShown() { return player.p.points.gte(100) || player.sp.points.gte(1) || hasUpgrade('sp', 11) },
   autoUpgrade: function() { return hasMilestone('ach', 0) && player.autoSPUpgrade; },
    tabFormat: {
    "Upgrades": { content: ["main-display", "prestige-button", "blank", "upgrades"] },
    "Milestones": { content: ["main-display", "prestige-button", "blank", "milestones"] },
    "Buyables": {
        content: ["main-display", "prestige-button", "blank", "buyables"],
        unlocked() { return hasUpgrade('sp', 41) || player.pp.activeChallenge == 14 || hasChallenge('pp', 14); }
    }
},
    buyables: {
    11: {
    title: "凝聚器",
    cost(x) {
        if (x.eq(0)) return new Decimal(1);
        let base = x.times(x.add(1).log10().add(1).times(10));
        let exp = x.add(1).pow(x.div(10).add(1));
        return Decimal.pow(base, exp).floor();
    },
    // 免费数量（预留扩展）
    freeAmount() {
        return new Decimal(0);
    },
    effect(x) {
        let total = x.add(this.freeAmount());
        if (total.eq(0)) return new Decimal(1);
        let base = total.times(total.add(1).log10().times(100));
        if (hasUpgrade('sp', 45)) base = base.times(upgradeEffect('sp', 45));
        let exp = total.add(1).pow(total.div(20).add(1));
        return Decimal.pow(base, exp);
    },
    display() {
        let bought = getBuyableAmount(this.layer, this.id);
        let free = this.freeAmount();
        let cost = tmp[this.layer].buyables[this.id]?.cost || new Decimal(0);
        let eff = tmp[this.layer].buyables[this.id]?.effect || new Decimal(1);
        return `花费: ${format(cost)}SP点\n已购买: ${formatWhole(bought)}+${formatWhole(free)}\n效果:SP点获取 ×${format(eff)}`;
    },
    canAfford() {
        let cost = tmp[this.layer].buyables[this.id]?.cost;
        return cost !== undefined && player[this.layer].points.gte(cost);
    },
    buy() {
        let x = getBuyableAmount(this.layer, this.id);
        let cost = tmp[this.layer].buyables[this.id].cost;
        player[this.layer].points = player[this.layer].points.sub(cost);
        player[this.layer].buyables[this.id] = x.add(1);
        updateTemp();
    },
    buyMax() {
        let x = player.sp.buyables[11] || new Decimal(0);
        let points = player.sp.points;
        let count = 0;
        let totalCost = new Decimal(0);
        while (count < 50) {
            let nextCost = this.cost(x.add(count));
            let newTotal = totalCost.add(nextCost);
            if (points.gte(newTotal)) {
                totalCost = newTotal;
                count++;
            } else break;
        }
        if (count > 0) {
            player.sp.points = points.sub(totalCost);
            player.sp.buyables[11] = x.add(count);
            updateTemp();
        }
    },
    unlocked() { return hasUpgrade('sp', 41) || player.pp.activeChallenge == 14 || hasChallenge('pp', 14) }
}},
    upgrades: {
        rows: 5, cols: 5,
        11: {
            title: "11", description: "双倍p点获取,基于你的sp点小幅度提升点数获取", cost: new Decimal(1),
            effect() {
                 if (inChallenge('m', 12)||inChallenge('m', 13)) {
        return new Decimal(1);
    }
                let raw = player.sp.points.add(1).pow(0.1);
                 if (hasChallenge('m', 12)) raw=raw.pow(1.002)
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, new Decimal(0.5).div(player.sp.points.add(1).log10().add(1).log10().add(1)));
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        12: {
            title: "12", description: "基于你的sp点提升P点获取", cost: new Decimal(25), unlocked() { return hasUpgrade('sp', 11) },
            effect() {
                let raw = player.sp.points.add(1).pow(0.2);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, new Decimal(0.13).div(player.sp.points.add(1).log10().add(1).log10().add(1)));
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        13: {
            title: "13", description: "基于你的sp点提升sp点获取", cost: new Decimal(1e9), unlocked() { return hasUpgrade('sp', 12) },
            effect() {
                let raw = player.sp.points.add(1).pow(0.1);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, new Decimal(0.5).div(player.sp.points.add(1).log10().add(1).log10().add(1)));
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        14: {
            title: "14", description: "基于你的sp点提升点数获取", cost: new Decimal(1e15), unlocked() { return hasUpgrade('sp', 13) },
            effect() {
                let raw = player.sp.points.add(1).pow(0.3);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, new Decimal(0.6).div(player.sp.points.add(1).log10().add(1).log10().add(1)));
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        15: {
            title: "15", description: "基于你的sp点提升点数获取", cost: new Decimal(1e38), unlocked() { return hasUpgrade('sp', 14) },
            effect() {
                let raw = player.sp.points.add(1).pow(0.25);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, new Decimal(0.5).div(player.sp.points.add(1).log10().add(1).log10().add(1)));
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        21: {
            title: "16", description: "基于你的sp点提升sp点获取指数(硬上限为+0.75)", cost: new Decimal(1e100), unlocked() { return hasUpgrade('sp', 15) },
            effect() {
                let base = player.sp.points.add(1).pow(0.0001);
                let raw = base.sub(1);
                let cap = new Decimal("0.5");
                if (raw.lte(cap)) return raw;
                let power = new Decimal(0.0005).div(player.sp.points.add(1).log10().add(1).log10().add(1));
                return Decimal.min(cap.times(raw.div(cap).pow(power)), 0.75);
            },
            effectDisplay() { return "+" + format(upgradeEffect(this.layer, this.id),4,true) }
        },
        22: {
            title: "17", description: "基于你的点数提升sp点获取", cost: new Decimal(1e120), unlocked() { return hasUpgrade('sp', 21) },
            effect() {
                let raw = player.points.add(1).pow(0.044);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, 0.022);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        23: {
            title: "18", description: "基于你的sp点提升amplifier获取", cost: new Decimal(1e150), unlocked() { return hasUpgrade('sp', 22) },
            effect() {
                let raw = player.sp.points.add(1).pow(0.005);
                if (hasUpgrade('p', 34)) raw = raw.pow(2.88);
                if (hasChallenge('pp', 11)) raw = raw.pow(5);
                let cap = new Decimal("1e38");
                if (raw.lte(cap)) return raw;
                let capped = raw.div(cap).pow(0.0025);
                if (hasUpgrade('p', 34)) capped = capped.pow(1.44);
                if (hasChallenge('pp', 11)) capped = capped.pow(2.5);
                return cap.times(capped);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        24: {
            title: "19", description: "软上限再弱化1.05", cost: new Decimal(1e175), unlocked() { return hasUpgrade('sp', 23) }
        },
        25: {
            title: "20", description: "软上限再弱化1.05", cost: new Decimal(1e180), unlocked() { return hasUpgrade('sp', 24) }
        },
        31: {
            title: "666还有第二关", description: "软上限再弱化1.05", cost: new Decimal(1e200), unlocked() { return hasUpgrade('sp', 25) }
        },
        32: {
            title: "!?强?!", description: "基于你的SP点提升SP点获取指数(硬上限为+0.3)", cost: new Decimal("1e600"), unlocked() { return hasUpgrade('sp', 31) && hasUpgrade('lw', 15) },
            effect() {
                let safePoints = player.sp.points.max(1);
                let base = safePoints.add(1).log10().div(1000).add(1);
                let raw = base.pow(0.066).sub(1);
                let cap = new Decimal("0.15");
                if (raw.lte(cap)) return raw;
                let power = new Decimal(0.0005).div(player.sp.points.add(1).log10().add(1).log10().add(1));
                return Decimal.min(cap.times(raw.div(cap).pow(power)), 0.3);
            },
            effectDisplay() { return "+" + format(upgradeEffect(this.layer, this.id),4,true) }
        },
        33: {
            title: "666还有第三关", description: "基于你的SP点提升P点获取指数(硬上限为+0.88)", cost: new Decimal("6.66e650"), unlocked() { return hasUpgrade('sp', 32) },
            effect() {
                let safePoints = player.sp.points.max(1);
                let base = safePoints.add(1).log10().div(666).add(1);
                let raw = base.pow(0.15).sub(1);
                let cap = new Decimal("0.66");
                if (raw.lte(cap)) return raw;
                let power = new Decimal(0.0005).div(player.sp.points.add(1).log10().add(1).log10().add(1));
                return Decimal.min(cap.times(raw.div(cap).pow(power)), 0.88);
            },
            effectDisplay() { return "+" + format(upgradeEffect(this.layer, this.id),4,true) }
        },
        34: {
            title: "我勒个高考750分", description: "基于你的SP点提升Amplifier获取指数(硬上限为+0.33)", cost: new Decimal("7.5e735"), unlocked() { return hasUpgrade('sp', 33) },
            effect() {
                let safePoints = player.sp.points.max(1);
                let base = safePoints.add(1).log10().div(444).add(1);
                let raw = base.pow(0.066).sub(1);
                let cap = new Decimal("0.17");
                if (raw.lte(cap)) return raw;
                let power = new Decimal(0.00005).div(player.sp.points.add(1).log10().add(1).log10().add(1));
                return Decimal.min(cap.times(raw.div(cap).pow(power)), 0.33);
            },
            effectDisplay() { return "+" + format(upgradeEffect(this.layer, this.id),4,true) }
        },
        35: {
            title: "千禧将近", description: "二重软上限延迟lg(前两行点数+1)之积,二重软上限后点数获取*1e9,解锁一个新的RE升级", cost: new Decimal("1e900"), unlocked() { return hasUpgrade('sp', 34) },
            effect() {
                let pLog = player.p.points.max(1).add(1).log10();
                let spLog = player.sp.points.max(1).add(1).log10();
                let aLog = player.a.points.max(1).add(1).log10();
                let raw = pLog.times(spLog).times(aLog);
                if (hasChallenge('pp', 11)) raw = raw.pow(10);
                let cap = new Decimal("1e9");
                return effectWithSoftcap(raw, cap, 0.99);
            },
            effectDisplay() { return "*" + format(upgradeEffect(this.layer, this.id)) }
        },
        41: {
            title: "凝聚之力", description: "解锁一个购买项", cost: new Decimal("1e158000"),
            unlocked() { return hasChallenge('pp', 12)  }
        },
        42: {
            title: "经典常谈", description: "基于SP点提升P点产量。", cost: new Decimal("1e163088"), unlocked() { return hasUpgrade('sp', 41) },
            effect() {
                let raw = player.sp.points.add(1).pow(0.21);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, 0.105);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        43: {
            title: "自增^2", description: "基于自增器个数提升自增器效果底数。", cost: new Decimal("1e172000"), unlocked() { return hasUpgrade('sp', 42) },
            effect() {
                let buy11 = player.p.buyables[11] || new Decimal(0);
                let base = buy11.add(1).log2().add(1);
                let raw = base.pow(buy11.add(1).log10().add(2)).times(2);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, 0.9);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        44: {
            title: "自增凝聚", description: "基于凝聚器个数提升自增器效果底数。", cost: new Decimal("1e175000"), unlocked() { return hasUpgrade('sp', 43) },
            effect() {
                let buy11sp = player.sp.buyables[11] || new Decimal(0);
                let base = buy11sp.add(1).log(1.5).add(1);
                let raw = base.pow(buy11sp.add(1).log10().add(3)).times(3);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, 0.6);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        45: {
            title: "凝聚自增", description: "基于自增器个数提升凝聚器效果底数,解锁一个PP挑战", cost: new Decimal("1e182000"), unlocked() { return hasUpgrade('sp', 44) },
            effect() {
                let buy11 = player.p.buyables[11] || new Decimal(0);
                let base = buy11.add(1).log(3).add(1);
                let raw = base.pow(buy11.add(1).log10().add(1.5)).times(1.5);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, 0.75);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        }
    }
})
addLayer("a", {
    name: "amplifier",
    symbol: "A",
    position: 0,
    startData() { return { unlocked: false, points: new Decimal(0) } },
    color: "#1900ffff",
    requires: new Decimal(1e6),
    resource: "amplifier",
    baseResource: "prestige points",
    baseAmount() { return player.p.points },
    type: "normal",
    branches: ["p"],
    exponent: function() {
        let exp = new Decimal(0.025);
        if (hasUpgrade('p', 22)) exp = exp.add(0.03);
        if (hasUpgrade('sp', 34)) exp = exp.add(upgradeEffect('sp', 34));
        if (hasUpgrade('m', 64)) exp = exp.times(upgradeEffect('m', 64));
        return exp;
    },
    milestonePopups: false,
    milestones: {
        0: { requirementDescription: "1 amplifier", effectDescription: "点数获取速度*25", done() { return player.a.points.gte(1) } }
    },
   autoUpgrade: function() { return hasMilestone('ach', 0) && player.autoAUpgrade; },
    gainMult() {let m = new Decimal(1);
        if (hasUpgrade('sp', 23)) m = m.times(upgradeEffect('sp', 23));
        if (hasUpgrade('sa', 42)) m = m.times(upgradeEffect('sa', 42));
        if (hasUpgrade('re', 12)) m = m.times(upgradeEffect('re', 12));
        if (hasUpgrade('a', 34)) m = m.times((upgradeEffect('a', 34)).add(1).log10().add(1).pow(2.88));
        if (hasUpgrade('a', 34)) m = m.times(1e108);
        if (hasUpgrade('tp', 11)) m = m.times(upgradeEffect('tp', 11));
        if (hasUpgrade('a', 43)) m = m.times(upgradeEffect('a', 43));
        if (hasMilestone('tp', 2)) m = m.times(1e5);
        if (hasChallenge('pp', 12)) m = m.times(1e9);
        if (hasChallenge('pp', 13)) m = m.times(1e38);
        if (hasUpgrade('a', 45)) m = m.times(upgradeEffect('a', 45));
        if (hasUpgrade('lw', 24)) m = m.times(upgradeEffect('lw', 24));
        if (hasChallenge('pp', 14)) m = m.times(1e100);
        if (hasUpgrade('sa', 24)) m = m.times(upgradeEffect('sa', 24));
        if (hasUpgrade('re', 24)) m = m.times(upgradeEffect('re', 24));
        return m;
    },
    gainExp() { return new Decimal(1) },
    row: 1,
    hotkeys: [{ key: "", description: "", onPress() { if (canReset(this.layer)) doReset(this.layer) } }],
    layerShown() { return player.p.points.gte(1e6) || player.a.points.gte(1) || hasUpgrade('a', 11) },
    passiveGeneration: function() {
        let p = 0;
        if (hasUpgrade('re', 11)) p += 0.01;
        if (hasUpgrade('re', 14)) p += 9.99;
        if (hasMilestone('ach', 3)) p += 90;
        return p;
    },
    tabFormat: {
        "Upgrades": { content: ["main-display", "prestige-button", "blank", "upgrades"] },
        "Milestones": { content: ["main-display", "prestige-button", "blank", "milestones"] }
    },
    upgrades: {
        rows: 5, cols: 5,
        11: {
            title: "21", description: "基于你的amplifier提升点数,P点,sp点获取(加成不低于10)", cost: new Decimal(1),
            effect() {
    // 如果挑战正在活跃中，禁用效果
    if (inChallenge('m', 11)||inChallenge('m', 12)||inChallenge('m', 13)) {
        return new Decimal(1);
    }

    let base = player.a.points.add(10);
    let buyableEff = tmp.tp?.buyables?.[11]?.effect ?? new Decimal(1);

    // 挑战 11 完成后的永久奖励
    if (hasChallenge('m', 11)) {
        buyableEff = buyableEff.times(1.001);
    }

    let raw = base.pow(buyableEff);
    let cap = new Decimal("1e38");
    let cap2 = new Decimal("1e50000");

    if (raw.lte(cap)) return raw;

    let power = new Decimal(1.25).div((player.a.points.add(1).log10().add(1).log10().add(1)).pow(0.33));
    let raw2 = cap.times(raw.div(cap).pow(power));

    if (raw2.lte(cap2)) return raw2;

    let power2 = new Decimal(1).div((player.a.points.add(1).log10().add(1).log10().add(1)).pow(0.66));
    let raw3 = cap2.times(raw2.div(cap2).pow(power2));

    return raw3;
},
            effectDisplay() {
                let eff = tmp.tp?.buyables?.[11]?.effect ?? new Decimal(1);
                 if (hasChallenge('m', 11)) {
        eff = eff.times(1.001);
    }
                return `基础效果^${format(eff,4,true)} (当前: 点数获取*${format(upgradeEffect(this.layer, this.id),4,true)} P点获取*${format(upgradeEffect(this.layer, this.id).pow(0.66),4,true)} SP点获取*${format(upgradeEffect(this.layer, this.id).pow(0.33),4,true)})`;
            }
        },
        12: { title: "22", description: "P点获取^1.01", cost: new Decimal(5), unlocked() { return hasUpgrade('a', 11) } },
        13: {
            title: "23", description: "基于你的amplifier提升sp点获取(加成不低于10)", cost: new Decimal(10000000), unlocked() { return hasUpgrade('a', 12) },
            effect() {
                let raw = player.a.points.add(100).pow(0.5);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, 0.25);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        14: { title: "24", description: "每秒获得重置时P点的1%", cost: new Decimal(1e9), unlocked() { return hasUpgrade('a', 13) } },
        15: { title: "25", description: "进行A重置不重置P升级", cost: new Decimal(1e10), unlocked() { return hasUpgrade('a', 14) } },
        21: { title: "26", description: "软上限弱化1.05", cost: new Decimal(1e12), unlocked() { return hasUpgrade('a', 15) } },
        22: { title: "27", description: "每秒再获得重置时P点的9%", cost: new Decimal(1e13), unlocked() { return hasUpgrade('a', 21) } },
        23: { title: "28", description: "每秒再获得重置时P点的90%", cost: new Decimal(1e14), unlocked() { return hasUpgrade('a', 22) } },
        24: { title: "29", description: "每秒获得重置时SP点的1%", cost: new Decimal(1e15), unlocked() { return hasUpgrade('a', 23) } },
        25: { title: "30", description: "每秒获得重置时SP点的99%", cost: new Decimal(1e16), unlocked() { return hasUpgrade('a', 24) } },
        31: { title: "我感受到了...", description: "软上限再弱化1.05", cost: new Decimal(1e17), unlocked() { return hasUpgrade('a', 25) && hasUpgrade('sp', 31) } },
        32: { title: "这是...?", description: "点数获取*1e9", cost: new Decimal(1e18), unlocked() { return hasUpgrade('a', 31) } },
        33: { title: "三相之力?", description: "软上限再弱化1.05,点数获取*1e38", cost: new Decimal(2.5e18), unlocked() { return hasUpgrade('a', 32) } },
        34: {
            title: "288", description: "点数获取*lg(点数+1)^2.88,amplifier获取*lg(lg(点数+1)^2.88+1)^2.88,amplifier获取*1e108", cost: new Decimal(2.88e180), unlocked() { return hasUpgrade('a', 33) && hasUpgrade('re', 15) },
            effect() {
                let raw = player.points.add(1).log10().add(1).pow(2.88);
                if (hasUpgrade('tp', 15)) raw = raw.pow(2.026);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, 1.88);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        35: { title: "新的层级?", description: "解锁新的层级", cost: new Decimal(1.79e308), unlocked() { return hasUpgrade('a', 34) } },
        41: { title: "突破五重", description: "五重软上限弱化1.16", cost: new Decimal('1e25700'), unlocked() { return hasChallenge('pp', 13) } },
        42: { 
            title: "放大时间", description: "基于你的Amplifier提升TP点获取(加成不低于2)", cost: new Decimal('1e49700'), unlocked() { return hasUpgrade('a', 41) },
            effect() {
                let raw = player.a.points.add(1).log(2).add(1).times(2).pow(player.a.points.add(1).log10().div(10000).add(1));
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, 0.5);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        43: { 
            title: "时之三相", description: "基于你的SA,LW,RE提升TP点获取(加成不低于2)", cost: new Decimal('1e49900'), unlocked() { return hasUpgrade('a', 42) },
            effect() {
                let saLog = player.sa.points.add(1).log(2).add(1);
                let lwLog = player.lw.points.add(1).log(2).add(1);
                let reLog = player.re.points.add(1).log(2).add(1);
                let base = saLog.times(lwLog).times(reLog);
                let exp = player.sa.points.add(1).log10().div(10000)
                          .add(player.lw.points.add(1).log10().div(10000))
                          .add(player.re.points.add(1).log10().div(10000))
                          .add(1);
                let raw = base.pow(exp);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, 0.5);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x"; }
        },
        44: { 
            title: "自我放大", description: "基于你的Amplifier提升Amplifier获取(加成不低于5)", cost: new Decimal('1e49900'), unlocked() { return hasUpgrade('a', 43) },
            effect() {
                let raw = player.a.points.add(1).log(3).add(1).times(5).pow(player.a.points.add(1).log10().div(1000).add(1));
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, 0.5);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        45: { 
            title: "时间乱流", description: "基于你的TP和时间碎片提升SA,LW,RE,Amplifier和TP获取,解锁一个PP挑战", cost: new Decimal('1e50000'), unlocked() { return hasUpgrade('a', 44) },
            effect() {
                let raw = player.tp.points.add(1).pow(player.tp.buyables[11].add(1).log2().div(50).add(0.4));
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, 0.5);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        }
    }
})
addLayer("lw", {
    name: "Law Weaving",
    symbol: "LW",
    position: 0,
    startData() { return { unlocked: false, points: new Decimal(0) } },
    color: "#c2f310ff",
    requires: new Decimal(1e308),
    resource: "Law Weaving",
    baseResource: "points",
    baseAmount() { return player.points },
    type: "normal",
    branches: ["sp", "a"],
   
    exponent: function() { return new Decimal(0.01) },
    autoUpgrade: function() { return (hasMilestone('ach', 5) )&& player.autoLWUpgrade},
    milestonePopups: false,
    passiveGeneration: function() {
        let p = 0;
        if (hasMilestone('pp', 0)) p += 0.001;
        if (hasMilestone('pp', 1)) p += 0.009;
        if (hasMilestone('pp', 2)) p += 0.04;
        if (hasMilestone('ach', 3)) p += 0.05;
        return p;
    },
    milestones: {
        0: { requirementDescription: "1 Law Weaving", effectDescription: "点数获取速度*100", done() { return player.lw.points.gte(1) } },
        1: { requirementDescription: "3 law Weaving", effectDescription: "lw重置时不重置SP层升级", done() { return player.lw.points.gte(3) } }
    },
    gainMult() {
        let m = new Decimal(1);
        if (hasUpgrade('lw', 14)) m = m.times(upgradeEffect('lw', 14));
        if (hasUpgrade('tp', 11)) m = m.times(upgradeEffect('tp', 11));
        if (hasUpgrade('sa', 42)) m = m.times(upgradeEffect('sa', 42));
        if (hasChallenge('pp', 13)) m = m.times(1e9);
        if (hasUpgrade('a', 45)) m = m.times(upgradeEffect('a', 45));
        if (hasChallenge('pp', 14)) m = m.times(1e38);
        return m;
    },
    gainExp() { return new Decimal(1) },
    row: 2,
    hotkeys: [],
    layerShown() { return hasUpgrade('a', 33) || player.lw.points.gte(1) || hasUpgrade('lw', 11) },
    tabFormat: {
        "Upgrades": { content: ["main-display", "prestige-button", "blank", "upgrades"] },
        "Milestones": { content: ["main-display", "prestige-button", "blank", "milestones"] }
    },
    upgrades: {
        rows: 3, cols: 5,
        11: { title: "始", description: "每秒再获得重置时SP点的150%", cost: new Decimal(1) },
        12: {
            title: "破限", description: "基于lw提升SP点获取(不低于100),软上限弱化1.05,二重软上限弱化1.05.", cost: new Decimal(1), unlocked() { return hasUpgrade('lw', 11) },
            effect() {
                let raw = player.lw.points.add(10).pow(2);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, new Decimal(0.78).div(player.lw.points.add(1).log10().add(1).log10().add(1)));
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        13: { title: "软上限有什么用？", description: "软上限延迟1e9", cost: new Decimal(5), unlocked() { return hasUpgrade('lw', 12) }, effect() {} },
        14: {
            title: "开始膨胀", description: "自我增幅,每秒再获得重置时SP点的750%", cost: new Decimal(10), unlocked() { return hasUpgrade('lw', 13) },
            effect() {
                let raw = player.lw.points.add(1).pow(1);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, new Decimal(0.13).div(player.lw.points.add(1).log10().add(1).log10().add(1)));
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        15: { title: "更多...", description: "lw重置时不重置前两行,解锁更多sp层升级", cost: new Decimal(1e20), unlocked() { return hasUpgrade('lw', 14) && hasUpgrade('sa', 15) && hasUpgrade('p', 35) }, effect() {} },
        21: {
            title: "律令·P", description: "基于LW点提升P点获取(不低于5)", cost: new Decimal("1e5650"), unlocked() { return hasUpgrade('sa', 25) || hasUpgrade('lw', 21) },
            effect() {
                let raw = player.lw.points.add(1).pow(0.8).times(5);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, 0.4);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        22: {
            title: "律令·SP", description: "基于LW点提升SP点获取(不低于5)", cost: new Decimal("1e5700"), unlocked() { return hasUpgrade('lw', 21) },
            effect() {
                let raw = player.lw.points.add(1).pow(0.6).times(5);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, 0.3);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        23: {
            title: "律令弱化", description: "前五重软上限指数弱化1.01", cost: new Decimal("1e5720"), unlocked() { return hasUpgrade('lw', 22) }
        },
        24: {
            title: "律令·A", description: "基于LW点提升Amplifier获取(不低于10)", cost: new Decimal("1e6400"), unlocked() { return hasUpgrade('lw', 23) },
            effect() {
                let raw = player.lw.points.add(1).pow(0.4).times(10);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, 0.2);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        25: {
            title: "解锁·回声", description: "解锁新的RE升级", cost: new Decimal("1e6446"), unlocked() { return hasUpgrade('lw', 24) }
        }
    }
})
addLayer("sa", {
    name: "Source Amplification",
    symbol: "SA",
    position: 0,
    startData() { return { unlocked: false, points: new Decimal(0) } },
    color: "#00ffbfff",
    requires: new Decimal(1e308),
    resource: "Source Amplification",
    baseResource: "points",
    baseAmount() { return player.points },
    type: "normal",
    exponent: function() { return new Decimal(0.01) },
    autoUpgrade: function() { return (hasMilestone('ach', 5)) && player.autoSAUpgrade},
    milestonePopups: false,
    passiveGeneration: function() {
        let p = 0;
        if (hasMilestone('pp', 0)) p += 0.001;
        if (hasMilestone('pp', 1)) p += 0.009;
        if (hasMilestone('pp', 2)) p += 0.04;
        if (hasMilestone('ach', 3)) p += 0.05;
        return p;
    },branches: ["sp", "a"],
    milestones: {
        0: { requirementDescription: "1 Source Amplification", effectDescription: "点数获取速度*100", done() { return player.sa.points.gte(1) } },
        1: { requirementDescription: "3 Source Amplification", effectDescription: "sa重置时不重置P层升级", done() { return player.sa.points.gte(3) } }
    },
    gainMult() {
        let m = new Decimal(1);
        if (hasUpgrade('sa', 14)) m = m.times(upgradeEffect('sa', 14));
        if (hasUpgrade('sa', 34)) m = m.times(upgradeEffect('sa', 34));
        if (hasUpgrade('sa', 42)) m = m.times(upgradeEffect('sa', 42));
        if (hasUpgrade('tp', 11)) m = m.times(upgradeEffect('tp', 11));
        if (hasChallenge('pp', 13)) m = m.times(1e9);
        if (hasUpgrade('a', 45)) m = m.times(upgradeEffect('a', 45));
        if (hasChallenge('pp', 14)) m = m.times(1e38);
        return m;
    },
    gainExp() { return new Decimal(1) },
    row: 2,
    hotkeys: [],
    layerShown() { return hasUpgrade('a', 33) || player.sa.points.gte(1) || hasUpgrade('sa', 11) },
    tabFormat: {
        "Upgrades": { content: ["main-display", "prestige-button", "blank", "upgrades"] },
        "Milestones": { content: ["main-display", "prestige-button", "blank", "milestones"] }
    },
    upgrades: {
        rows: 4, cols: 5,
        11: { title: "始", description: "每秒再获得重置时P点的900%", cost: new Decimal(1) },
        12: {
            title: "破限", description: "基于sa提升P点获取(不低于1e4),软上限弱化1.05,二重软上限弱化1.05", cost: new Decimal(1), unlocked() { return hasUpgrade('sa', 11) },
            effect() {
                let raw = player.sa.points.add(100).pow(2);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, new Decimal(0.78).div(player.sa.points.add(1).log10().add(1).log10().add(1)));
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        13: { title: "软上限有什么用？", description: "软上限延迟1e9", cost: new Decimal(5), unlocked() { return hasUpgrade('sa', 12) }, effect() {} },
        14: {
            title: "开始膨胀", description: "自我增幅,弱化并延迟二重软上限(1.01,10)", cost: new Decimal(10), unlocked() { return hasUpgrade('sa', 13) },
            effect() {
                let raw = player.sa.points.add(1).pow(1);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, new Decimal(0.13).div(player.sa.points.add(1).log10().add(1).log10().add(1)));
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        15: { title: "更多...", description: "sa重置时不重置前两行,解锁更多p层升级", cost: new Decimal(1e9), unlocked() { return hasUpgrade('sa', 14) }, effect() {} },
        21: {
            title: "源质增幅·P", description: "基于SA点提升P点获取指数(硬上限+0.5)", cost: new Decimal("1e4500"), unlocked() { return hasChallenge('pp', 14) },
            effect() {
                let raw = player.sa.points.add(1).log10().div(50000);
                let cap = new Decimal("0.5");
                return Decimal.min(raw, cap);
            },
            effectDisplay() { return "+" + format(upgradeEffect(this.layer, this.id)) }
        },
        22: {
            title: "源质共鸣", description: "基于SA点提升SP点获取", cost: new Decimal("1e5000"), unlocked() { return hasUpgrade('sa', 21) },
            effect() {
                let raw = player.sa.points.add(1).pow(0.3);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, 0.15);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        23: {
            title: "弱化上限", description: "前五重软上限指数弱化1.01", cost: new Decimal("1e5020"), unlocked() { return hasUpgrade('sa', 22) }
        },
        24: {
            title: "源质·A", description: "基于SA点提升Amplifier获取(不低于10)", cost: new Decimal("1e5225"), unlocked() { return hasUpgrade('sa', 23) },
            effect() {
                let raw = player.sa.points.add(1).pow(0.3).times(10);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, 0.5);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        25: {
            title: "解锁·律令", description: "解锁新的LW升级", cost: new Decimal("1e5500"), unlocked() { return hasUpgrade('sa', 24) }
        },
        31: {
            title: "源·律·回", description: "基于SA、LW、RE提升点数获取", cost: new Decimal("1e7478"), unlocked() { return hasUpgrade('re', 25) },
            effect() {
                let sa = player.sa.points.add(1).pow(0.9);
                let lw = player.lw.points.add(1).pow(0.8);
                let re = player.re.points.add(1).pow(0.7);
                let raw = sa.times(lw).times(re);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, 0.4);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        32: {
            title: "针对弱化", description: "五重软上限弱化1.03", cost: new Decimal("1e8100"), unlocked() { return hasUpgrade('sa', 31) }
        },
        33: {
            title: "源质·时", description: "基于SA点提升TP点获取(加成不低于2)", cost: new Decimal("1e9000"), unlocked() { return hasUpgrade('sa', 32) },
            effect() {
                let raw = player.sa.points.add(1).pow(0.2);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, 0.5);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        34: {
            title: "自我共振", description: "SA点获取*(SA+1)^0.3", cost: new Decimal("1e10400"), unlocked() { return hasUpgrade('sa', 33) },
            effect() {
                let raw = player.sa.points.add(1).pow(0.3);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, 0.5);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        35: {
            title: "回声·源质", description: "基于RE点提升SA点获取(加成不低于2)", cost: new Decimal("1e11250"), unlocked() { return hasUpgrade('sa', 34) },
            effect() {
                let raw = player.re.points.add(1).pow(0.2);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, 0.5);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        41: {
            title: "源质·力", description: "基于SA点提升Points Power产量", cost: new Decimal("1e13000"), unlocked() { return hasUpgrade('sa', 35) },
            effect() {
                let raw = player.sa.points.add(1).log10().add(1).pow(0.25);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, 0.5);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        42: {
            title: "三气归来", description: "基于SA、LW、RE提升前四行所有资源获取(加成不低于100)", cost: new Decimal("1e13400"), unlocked() { return hasUpgrade('sa', 41) },
            effect() {
                let sa = player.sa.points.add(1).log2().add(1);
                let lw = player.lw.points.add(1).log2().add(1);
                let re = player.re.points.add(1).log2().add(1);
                let raw = sa.times(lw).times(re).times(100).pow(7);
                let cap = new Decimal("1e1000");
                return effectWithSoftcap(raw, cap, 0.6);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        43: {
            title: "针对弱化·Ⅱ", description: "五重软上限弱化1.05", cost: new Decimal("1e14000"), unlocked() { return hasUpgrade('sa', 42) }
        },
        44: {
            title: "源质延迟", description: "基于SA点延长前五重软上限(硬上限^5)", cost: new Decimal("1e20000"), unlocked() { return hasUpgrade('sa', 43) },
            effect() {
                let max=new Decimal(5)
                let raw = player.sa.points.add(1).log10().div(1e4).add(1);
                if(hasUpgrade('m',15))max=new Decimal(10)
                return Decimal.min(raw, max);
            },
            effectDisplay() { return "^" + format(upgradeEffect(this.layer, this.id),4,true) }
        },
        45: {
            title: "终极源质", description: "解锁一个新的PP挑战", cost: new Decimal("1e20500"), unlocked() { return hasUpgrade('sa', 44) }
        }
    }
})
addLayer("re", {
    name: "Recursive Echo",
    symbol: "RE",
    position: 0,
    startData() { return { unlocked: false, points: new Decimal(0),} },
    color: "rgba(0, 89, 255, 1)",
    requires: new Decimal(1e308),
    resource: "Recursive Echo",
    baseResource: "points",
    baseAmount() { return player.points },
    type: "normal",
    exponent: function() { return new Decimal(0.01) },
    milestonePopups: false,
    autoUpgrade: function() { 
    return (hasMilestone('ach', 5)) && player.autoREUpgrade;
},
    milestones: {
        0: { requirementDescription: "1 Recursive Echo", effectDescription: "点数获取速度*100", done() { return player.re.points.gte(1) } },
        1: { requirementDescription: "3 Recursive Echo", effectDescription: "re重置时不重置Amplifier层升级", done() { return player.re.points.gte(3) } }
    },branches: ["sp", "a"],
    passiveGeneration: function() {
        let p = 0;
        if (hasMilestone('pp', 0)) p += 0.001;
        if (hasMilestone('pp', 1)) p += 0.009;
        if (hasMilestone('pp', 2)) p += 0.04;
        if (hasMilestone('ach', 3)) p += 0.05;
        return p;
    },
    gainMult() {
        let m = new Decimal(1);
        if (hasUpgrade('re', 14)) m = m.times(upgradeEffect('re', 14));
        if (hasUpgrade('sa', 42)) m = m.times(upgradeEffect('sa', 42));
        if (hasUpgrade('tp', 11)) m = m.times(upgradeEffect('tp', 11));
        if (hasChallenge('pp', 13)) m = m.times(1e9);
        if (hasUpgrade('a', 45)) m = m.times(upgradeEffect('a', 45));
        if (hasChallenge('pp', 14)) m = m.times(1e38);
        return m;
    },
    gainExp() { return new Decimal(1) },
    row: 2,
    hotkeys: [],
    layerShown() { return hasUpgrade('a', 33) || player.re.points.gte(1) || hasUpgrade('re', 11) },
    tabFormat: {
        "Upgrades": { content: ["main-display", "prestige-button", "blank", "upgrades"] },
        "Milestones": { content: ["main-display", "prestige-button", "blank", "milestones"] }
    },
    upgrades: {
        rows: 3, cols: 5,
        11: { title: "始", description: "每秒获得重置时Amplifier的1%", cost: new Decimal(1) },
        12: {
            title: "破限", description: "基于re提升amplifier获取(不低于100),软上限弱化1.05,二重软上限弱化1.05", cost: new Decimal(1), unlocked() { return hasUpgrade('re', 11) },
            effect() {
                let raw = player.re.points.add(10).pow(2);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, new Decimal(0.78).div(player.re.points.add(1).log10().add(1).log10().add(1)));
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        13: { title: "软上限有什么用？", description: "软上限延迟1e9", cost: new Decimal(5), unlocked() { return hasUpgrade('re', 12) }, effect() {} },
        14: {
            title: "开始膨胀", description: "自我增幅,每秒再获得重置时Amplifier的999%", cost: new Decimal(10), unlocked() { return hasUpgrade('re', 13) },
            effect() {
                let raw = player.re.points.add(1).pow(1);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, new Decimal(0.13).div(player.re.points.add(1).log10().add(1).log10().add(1)));
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        15: { title: "更多...", description: "re重置时不重置前两行,解锁更多a层升级", cost: new Decimal(1e40), unlocked() { return hasUpgrade('re', 14) && hasUpgrade('sa', 15) && hasUpgrade('lw', 15) && hasUpgrade('sp', 35) }, effect() {} },
        21: {
            title: "回声·P", description: "基于RE点提升P点获取(不低于5)", cost: new Decimal("1e6400"), unlocked() { return hasUpgrade('lw', 25) || hasUpgrade('re', 21) },
            effect() {
                let raw = player.re.points.add(1).pow(0.7).times(5);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, 0.35);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        22: {
            title: "回声·SP", description: "基于RE点提升SP点获取(不低于5)", cost: new Decimal("1e6500"), unlocked() { return hasUpgrade('re', 21) },
            effect() {
                let raw = player.re.points.add(1).pow(0.5).times(5);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, 0.25);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        23: {
            title: "回声弱化", description: "前五重软上限指数弱化1.01", cost: new Decimal("1e6525"), unlocked() { return hasUpgrade('re', 22) }
        },
        24: {
            title: "回声·A", description: "基于RE点提升Amplifier获取(不低于10)", cost: new Decimal("1e7455"), unlocked() { return hasUpgrade('re', 23) },
            effect() {
                let raw = player.re.points.add(1).pow(0.3).times(10);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, 0.15);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        25: {
            title: "解锁·源质", description: "解锁新的SA升级", cost: new Decimal("1e7474"), unlocked() { return hasUpgrade('re', 24) }
        }
    }
})
addLayer("tp", {
    name: "Time Points",
    symbol: "TP",
    position: 0,
    startData() {
    return {
        unlocked: false,
        points: new Decimal(0),
        timesPower: new Decimal(0),
        autoCrystalTime: new Decimal(0)   // 必须添加这一行
    };
},
    color: "rgba(255, 0, 221, 1)",
    requires: new Decimal("1e1000"),
    resource: "Time points",
    baseResource: "points",
    baseAmount() { return player.points },
    type: "normal",
    passiveGeneration: function() {
        let p = 0;
        if (hasChallenge('pp', 15)) p += 0.01;
        if (hasMilestone('ach', 3)) p += 0.04;
        return p;
    },
    exponent: function() { return new Decimal(0.012345) },
    milestonePopups: false,
    milestones: {
        0: { requirementDescription: "1 tp", effectDescription: "P点获取*1e20", done() { return player.tp.points.gte(1) } },
        1: { requirementDescription: "3 tp", effectDescription: "SP点获取*1e10", done() { return player.tp.points.gte(3) } },
        2: { requirementDescription: "5 tp", effectDescription: "A获取*1e5", done() { return player.tp.points.gte(5) } }
    },branches: ["sa", "lw", "re"],
    gainMult() {
        let m = new Decimal(1);
        if (hasUpgrade('tp', 13)) m = m.times(upgradeEffect('tp', 13));
        if (hasUpgrade('a', 42)) m = m.times(upgradeEffect('a', 42));
        if (hasUpgrade('a', 43)) m = m.times(upgradeEffect('a', 43));
        if (hasUpgrade('a', 45)) m = m.times(upgradeEffect('a', 45));
        if (hasUpgrade('sa', 42)) m = m.times(upgradeEffect('sa', 42));
        if (hasChallenge('pp', 14)) m = m.times(1e9);
        if (hasUpgrade('sa', 33)) m = m.times(upgradeEffect('sa', 33));
        if (hasChallenge('pp', 15)) m = m.times('1.79e308');
        if (player.pp.activeChallenge == 14) m = m.times(4.44e44);
        if (player.timesPower && player.timesPower instanceof Decimal) {
            m = m.times(player.timesPower.add(1).pow(1.3));
        }
        return m;
    },
    gainExp() { return new Decimal(1) },
    row: 3,
    hotkeys: [{ key: "", description: "", onPress() { if (canReset(this.layer)) doReset(this.layer) } }],
    layerShown() { return hasUpgrade('a', 35) || player.tp.points.gte(1) || hasUpgrade('tp', 11) },
    update(diff) {
        if (!(player.timesPower instanceof Decimal)) player.timesPower = new Decimal(player.timesPower || 0);
    if (!hasUpgrade('tp', 21) || player.tp.points.lt(1)) {
        player.timesPower = new Decimal(0);
        return;
    }
        if (hasUpgrade('tp', 21)) {
            let tpPoints = player.tp.points;
            let gainpow = new Decimal(1.14514);
            if (hasUpgrade('tp', 22)) gainpow = new Decimal(1.919810);
            let gain = tpPoints.add(1).log10().pow(gainpow).times(diff);
            if (hasUpgrade('tp', 24)) gain = gain.times(upgradeEffect('tp', 24));
            if (hasUpgrade('m', 11)) {
    let eff = upgradeEffect('m', 11);
    if (eff.timePower) gain = gain.times(eff.timePower);
}
            player.timesPower = player.timesPower.add(gain);
        }
       if (hasMilestone('ach', 6) && player.autoTPCrystalEclipse) {
    if (!player.tp.autoCrystalTime) player.tp.autoCrystalTime = new Decimal(0);
    player.tp.autoCrystalTime = player.tp.autoCrystalTime.add(diff);
    if (player.tp.autoCrystalTime.gte(0.1)) {
        let times = Decimal.floor(player.tp.autoCrystalTime.div(0.1)).toNumber();
        player.tp.autoCrystalTime = player.tp.autoCrystalTime.sub(times * 0.1);
        for (let i = 0; i < times; i++) {
            if (layers.tp.buyables[12].unlocked() && layers.tp.buyables[12].canAfford())
                layers.tp.buyables[12].buyMax();
            if (layers.tp.buyables[13].unlocked() && layers.tp.buyables[13].canAfford())
                layers.tp.buyables[13].buyMax();
        }
    }
}
    },
   tabFormat: {
    "Upgrades": {
        content: [
            "main-display", "prestige-button", "blank",
            ["display-text", function() {
                let tp = player.timesPower || new Decimal(0);
                return `时间之力: <h2 style="color: rgba(255, 0, 221, 1); text-shadow: 0px 0px 10px rgba(255, 0, 221, 1);">${format(tp)}</h2>`;
            }],
            ["display-text", function() {
                let mult = getTimesPowerMultiplier();
                return `效果: TP获取* <h2 style="color: rgba(255, 0, 221, 1); text-shadow: 0px 0px 10px rgba(255, 0, 221, 1);">${format(mult)}</h2>`;
            }],
            "upgrades"
        ]
    },
    "Milestones": { content: ["main-display", "prestige-button", "blank", "milestones"] },
    "Buyables": {
        content: ["main-display", "prestige-button", "blank", "buyables"],
        unlocked() { return hasUpgrade('tp', 13); }
    }
},
    autoUpgrade: function() { return hasChallenge('pp', 14) && player.autoTPFragment; },
    upgrades: {
        rows: 3, cols: 5,
        11: {
            title: "时间的力量...", description: "软上限弱化1.25,二重软上限弱化1.25,之前所有资源获取*(TP+10)^2", cost: new Decimal(1),
            effect() {
                let raw = player.tp.points.add(10).pow(2);
                if (player.pp.activeChallenge == 14)raw = raw.pow(2.026);
                if (hasChallenge('pp', 14))raw = raw.pow(1.279);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, new Decimal(0.78).div(player.tp.points.add(1).log10().add(1).log10().add(1)));
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        12: { title: "改变...", description: "三重软上限延迟1e314", cost: new Decimal(1), unlocked() { return hasUpgrade('tp', 11) } },
        13: {
            title: "碎片化...", description: "解锁时间碎片,tp增加tp获取", cost: new Decimal(3), unlocked() { return hasUpgrade('tp', 12) },
            effect() {
                let raw = player.tp.points.add(1).pow(0.33);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, new Decimal(0.114514).div(player.tp.points.add(1).log10().add(1).log10().add(1)));
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        14: { title: "时间之晶？", description: "解锁时间之晶,时间碎片效果公式提升至0.52", cost: new Decimal(114514), unlocked() { return hasUpgrade('tp', 13) } },
        15: { title: "时蚀之刻", description: "解锁时蚀之刻,时间碎片效果公式提升至0.66,升级'1e288'效果再^2.026", cost: new Decimal(1919810), unlocked() { return hasUpgrade('tp', 14) } },
        21: {
            title: "时间之力", description: "解锁 Times power,自动获得 +[log10(TP+1)]^1.14514/秒,基于(tpr+1)^1.3给TP一个获取倍数", cost: new Decimal(1e9), unlocked() { return hasUpgrade('tp', 15) },
            effectDisplay() {
                let tpPoints = player.tp.points;
                let gainpow = new Decimal(1.14514);
                if (hasUpgrade('tp', 22)) gainpow = new Decimal(1.919810);
                let gain = tpPoints.add(1).log10().pow(gainpow);
                if (hasUpgrade('tp', 24)) gain = gain.times(upgradeEffect('tp', 24));
                return `+${format(gain)}/s`;
            }
        },
        22: { title: "优化时间", description: "优化Tpr自动获得指数为1.919810", cost: new Decimal(1e9), unlocked() { return hasUpgrade('tp', 21) } },
        23: { title: "时间浮动", description: "优化Tpr效果指数为2.026", cost: new Decimal(1e16), unlocked() { return hasUpgrade('tp', 22) } },
        24: {
            title: "时间扭曲", description: "Tpr自动获得*(tpr+1)^0.1919810", cost: new Decimal(1e25), unlocked() { return hasUpgrade('tp', 23) },
            effect() {
                let tp = new Decimal(player.timesPower) || new Decimal(0);
                let raw = tp.add(1).pow(0.1919810);
                let cap = new Decimal("1e38");
                return effectWithSoftcap(raw, cap, 0.114514);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        25: { title: "时间侵蚀", description: "软上限(一重、二重、三重、四重)指数分别乘以1.02,1.03,1.04,1.05,点数获取*1e1000,至1e7000points解锁新内容", cost: new Decimal(1e36), unlocked() { return hasUpgrade('tp', 24) } }
    },
    buyables: {
    11: {
        title: "时间碎片",
        unlocked() { return hasUpgrade('tp', 13) && player.pp.activeChallenge != 15 && player.pp.activeChallenge != 16 && player.m.activeChallenge != 16 },
        cost(x) {
            if (x.eq(0)) return new Decimal(1);
            let costbase=x.pow(Decimal.min(x.pow(-1).times(1024), 2))
            if (hasChallenge('m', 15)){
    costbase = costbase.pow(0.2).max(1);
 }
            let costexp=x.pow(Decimal.max(x.div(512), 1).pow(2))
            if (hasChallenge('pp', 16)){
    costexp = costexp.pow(0.5).max(1);
 }
            let cost=Decimal.pow(costbase, costexp)
                .times(getTimeCrystalDiscount()).max(1);
                if (hasUpgrade('m', 14)) {
    cost = cost.pow(upgradeEffect('m', 14)).max(1);
}
 if (hasChallenge('m', 11)){
    cost = cost.pow(0.5).max(1);
 }
 if (hasChallenge('m', 12)){
    cost = cost.pow(0.25).max(1);
 }
 if (hasChallenge('m', 13)){
    cost = cost.pow(0.125).max(1);
 }
 if (hasChallenge('m', 14)){
    cost = cost.pow(0.20200311).max(1);
 }
                    return cost

        },
        freeCrystals() {
            let free=new Decimal(0)
            return free;  
        },
        effect(x) {
            let total = x.add(this.freeCrystals());
            if (total.eq(0)) return new Decimal(1);
            let exp = hasUpgrade('tp', 15) ? 0.66 : (hasUpgrade('tp', 14) ? 0.52 : 0.5);
            let raw = total.pow(exp).div(10).add(1);
            let baseEff = raw.gt(1) ? raw.sqrt() : raw;
            if (total.gt(512)) {
                let extrabase = new Decimal(1.0001);
                if (hasChallenge('m', 15)){
    extrabase = extrabase.add(0.0004)
 }
 if (hasChallenge('pp', 16)){
    extrabase = extrabase.add(0.0005)
 }
                let extra = Decimal.pow(extrabase, total.div(512));
                return baseEff.times(extra);
            }
            return baseEff;
        },
        display() {
            let bought = getBuyableAmount(this.layer, this.id);
            let free = this.freeCrystals();
            let total = bought.add(free);
            let cost = tmp[this.layer].buyables[this.id]?.cost || new Decimal(0);
            let eff = tmp[this.layer].buyables[this.id]?.effect || new Decimal(1);
            let limit = getTimeFragmentBaseLimit();
            return `花费: ${format(cost)} TP\n已购买: ${formatWhole(bought)}+${formatWhole(free)} / ${formatWhole(limit)}\n效果: 升级21效果 ^${format(eff, 4, true)}`;
        },
        canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id]?.cost || Decimal.infinity) },
        buy() {
            let x = getBuyableAmount(this.layer, this.id);
            if (x.gte(getTimeFragmentBaseLimit().floor())) return;
            let cost = tmp[this.layer].buyables[this.id].cost;
            player[this.layer].points = player[this.layer].points.sub(cost);
            player[this.layer].buyables[this.id] = x.add(1);
            updateTemp();
        },
        buyMax() {
            let x = player.tp.buyables[11] || new Decimal(0);
            let points = player.tp.points;
            let limit = getTimeFragmentBaseLimit().floor();
            let count = 0;
            let totalCost = new Decimal(0);
            while (count < 50) {
                let nextX = x.add(count);
                if (nextX.gte(limit)) break;
                let nextCost = this.cost(nextX);
                let newTotal = totalCost.add(nextCost);
                if (points.gte(newTotal)) {
                    totalCost = newTotal;
                    count++;
                } else break;
            }
            if (count > 0) {
                player.tp.points = points.sub(totalCost);
                player.tp.buyables[11] = x.add(count);
                updateTemp();
            }
        }
    },
    12: {
    title: "时间之晶",
    unlocked() { return hasUpgrade('tp', 14) && player.pp.activeChallenge != 15 && player.pp.activeChallenge != 16 && player.m.activeChallenge != 16 },
    cost(x) { if (x.eq(0)) return new Decimal(4); return Decimal.pow(5, x).floor() },
     freeCrystals() {
            let f = new Decimal(0);
            if (hasChallenge('pp', 15)) f = f.add(1);  // 挑战15奖励：1个免费
            return f;
        },
       effect(x) {
    let total = x.add(this.freeCrystals());
    if (total.eq(0)) return { discount: new Decimal(1), limit: new Decimal(1) };
    // 基础折扣 = (total/114514)^total
    let baseDisc = Decimal.pow(total.div(114514), total);
    // 基础上限倍率 = 1.425^total + 1
    let baseLimit = new Decimal(1.425).pow(total).add(1);
    // 强化一：当 total > 3 时，折扣再取 (total-3) 次方
    let exp1 = Decimal.max(1, total.sub(3));
    let disc = baseDisc.pow(exp1);
    // 强化二：当 total > 4 时，上限倍率再乘以 (total/4)
    let exp2 = Decimal.max(1, total.div(4));
    let limit = baseLimit.times(exp2);
    return { discount: disc, limit: limit };
},
display() {
    let bought = getBuyableAmount(this.layer, this.id);
    let free = this.freeCrystals();
    let cost = tmp[this.layer].buyables[this.id]?.cost || new Decimal(0);
    let eff = tmp[this.layer].buyables[this.id]?.effect || { discount: new Decimal(1), limit: new Decimal(1) };
    return `花费: ${format(cost)} 时间碎片\n` +
           `已购买: ${formatWhole(bought)}+${formatWhole(free)} / 4\n` +
           `效果: 时间碎片成本 *${format(eff.discount, 4, true)}，上限 *${format(eff.limit, 4, true)}`;
},
   canAfford() { return getBuyableAmount('tp', 11).gte(tmp[this.layer].buyables[this.id]?.cost || Decimal.infinity) },
            buy() {
                let x = getBuyableAmount(this.layer, this.id);
                if (x.gte(4)) return;
                let cost = tmp[this.layer].buyables[this.id].cost;
                player.tp.buyables[11] = player.tp.buyables[11].sub(cost);
                player[this.layer].buyables[this.id] = x.add(1);
                updateTemp();
            },
            buyMax() {
                let x = player.tp.buyables[12] || new Decimal(0);
                let fragments = player.tp.buyables[11] || new Decimal(0);
                let count = 0;
                let totalCost = new Decimal(0);
                while (count < 50) {
                    let nextX = x.add(count);
                    if (nextX.gte(4)) break;
                    let nextCost = this.cost(nextX);
                    let newTotal = totalCost.add(nextCost);
                    if (fragments.gte(newTotal)) {
                        totalCost = newTotal;
                        count++;
                    } else break;
                }
                if (count > 0) {
                    player.tp.buyables[11] = fragments.sub(totalCost);
                    player.tp.buyables[12] = x.add(count);
                    updateTemp();
                }
            },
            purchaseLimit: 4
},
    13: {
        title: "时蚀之刻",
        unlocked() { return hasUpgrade('tp', 15) && player.pp.activeChallenge != 15 && player.pp.activeChallenge != 16 && player.m.activeChallenge != 16 },
        cost(x) { if (x.eq(0)) return new Decimal(1); return Decimal.pow(2, x).floor() },
        freeCrystals() {
            let free=new Decimal(0);
if (hasChallenge('pp', 16)) free = free.add(1);  // 挑战16奖励：1个免费
            return free;   
        },
        effect(x) {
            let total = x.add(this.freeCrystals());
            if (total.eq(0)) return new Decimal(1);
            return Decimal.pow(1.05, total);
        },
        display() {
            let bought = getBuyableAmount(this.layer, this.id);
            let free = this.freeCrystals();
            let cost = tmp[this.layer].buyables[this.id]?.cost || new Decimal(0);
            let f1 = getEclipseMultiplier(1), f2 = getEclipseMultiplier(2), f3 = getEclipseMultiplier(3);
            return `花费: ${format(cost)} 时间碎片\n已购买: ${formatWhole(bought)}+${formatWhole(free)} / 10\n效果: 一重*${format(f1, 4, true)} 二重*${format(f2, 4, true)} 三重*${format(f3, 4, true)}`;
        },
        canAfford() { return getBuyableAmount('tp', 11).gte(tmp[this.layer].buyables[this.id]?.cost || Decimal.infinity) },
        buy() {
            let x = getBuyableAmount(this.layer, this.id);
            if (x.gte(10)) return;
            let cost = tmp[this.layer].buyables[this.id].cost;
            player.tp.buyables[11] = player.tp.buyables[11].sub(cost);
            player[this.layer].buyables[this.id] = x.add(1);
            updateTemp();
        },
        buyMax() {
            let x = player.tp.buyables[13] || new Decimal(0);
            let fragments = player.tp.buyables[11] || new Decimal(0);
            let count = 0;
            let totalCost = new Decimal(0);
            while (count < 50) {
                let nextX = x.add(count);
                if (nextX.gte(10)) break;
                let nextCost = this.cost(nextX);
                let newTotal = totalCost.add(nextCost);
                if (fragments.gte(newTotal)) {
                    totalCost = newTotal;
                    count++;
                } else break;
            }
            if (count > 0) {
                player.tp.buyables[11] = fragments.sub(totalCost);
                player.tp.buyables[13] = x.add(count);
                updateTemp();
            }
        },
        purchaseLimit: 10,
    },
       21: {
    title: "<b style='color:rgba(255, 0, 221, 1); text-shadow: 0 0 2px #000, 0 0 2px #000, 0 0 2px #000, 0 0 2px #000;'>时间</b><b style='color:rgba(47, 0, 255, 1); text-shadow: 0 0 2px #000, 0 0 2px #000, 0 0 2px #000, 0 0 2px #000;'>密度</b>",
    unlocked() { return hasUpgrade('m', 12) && player.pp.activeChallenge != 15 && player.pp.activeChallenge != 16 && player.m.activeChallenge != 16 ; },

    cost(x) {
        if (x.eq(0)) return new Decimal(550);
        let baseCost = x.times(12.5).pow(1.25).add(550).floor();
        if (x.gte(10)) {
            baseCost = baseCost.pow(1.3).floor();
        }
        return baseCost;
    },

    // ── 核心效果：返回最终指数 ──
    effect(x) {
        let tier = x;  // 已购买数量
        let effbase = new Decimal(0.2);

        // 升级 M‑31 加成
        if (hasUpgrade('m', 31)) effbase = effbase.add(0.002);

        // 升级 M‑33 根据能量进一步加成
        if (hasUpgrade('m', 33)) {
            let e = player.m.energy || new Decimal(0);
            let raw = e.add(1).log10().div('520');
            effbase = effbase.add(raw);
        }

        let exp = effbase.times(tier).add(1);

        // 软上限：指数超过 10 后压缩
        if (exp.gt(10)) exp = exp.div(10).log10().add(1).times(10);

        return exp;
    },

    // ── 显示：调用 effect 并渲染 ──
    display() {
        let x = player[this.layer].buyables[this.id] || new Decimal(0);
        let cost = tmp[this.layer].buyables[this.id]?.cost || new Decimal(0);
        let eff = tmp[this.layer].buyables[this.id]?.effect || new Decimal(1);
        let limit = new Decimal(10);
        let limitText = x.gte(limit) ? "<br><b style='color: #ff4444; text-shadow: 0 0 2px #000, 0 0 2px #000;'>已达上限</b>" : "";

        return `<b style='color:rgba(255, 0, 221, 1); text-shadow: 0 0 2px #000, 0 0 2px #000, 0 0 2px #000;'>花费:${format(cost)}时间碎片</b><br>` +
               `<b style='color:rgba(47, 0, 255, 1); text-shadow: 0 0 2px #000, 0 0 2px #000, 0 0 2px #000;'>当前:${formatWhole(x)}/10${limitText}</b><br>` +
               `<b style='color: #ff0000ff; text-shadow: 0 0 2px #000, 0 0 2px #000, 0 0 2px #000;'>购买后重置第一行购买项</b><br>` +
               `<b style='color: #ff4444; text-shadow: 0 0 2px #000, 0 0 2px #000, 0 0 2px #000;'>点数获取^${format(eff, 4, true)}</b>`;
    },

    canAfford() {
        let x = player.tp.buyables[21] || new Decimal(0);
        let limit = new Decimal(10);
        if (x.gte(limit)) return false;
        let cost = tmp[this.layer].buyables[this.id]?.cost;
        return cost !== undefined && player.tp.buyables[11].gte(cost);
    },

    buy() {
        let x = player.tp.buyables[21] || new Decimal(0);
        let limit = new Decimal(10);
        if (x.gte(limit)) return;
        let cost = tmp.tp.buyables[21].cost;
        player.tp.buyables[11] = player.tp.buyables[11].sub(cost);
        player.tp.buyables[11] = new Decimal(0);   
        player.tp.buyables[12] = new Decimal(0);
        player.tp.buyables[13] = new Decimal(0);
        player.tp.buyables[21] = x.add(1);
        updateTemp();
    },
},
}
})
addLayer("pp", {
    name: "Points Power",
    symbol: "PP",
    position: 0,
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            bestPoints: new Decimal(0),
            pointsPower: new Decimal(0),
            time: new Decimal(0),    
            autoPointsPowerUpg: false           // 用于时间驱动的自动购买
        };
    },
    color: "#fd6868ff",
    requires: new Decimal("1e7000"),
    resource: "PP 点",
    baseResource: "points",
    baseAmount() { return player.points },
    type: "normal",

    // ────────── 重置获得量（受 M‑21 影响）──────────
    getResetGain() {
        if (hasUpgrade('m', 21)) return new Decimal(0);   // 禁用重置获得
        let currentPP = player.pp.points;
        let maxPoints = player.pp.bestPoints.max(player.points);
        let cap = maxPoints.add(1).log10();
        let rawGain = player.points.add(1).log10();
        let gain = rawGain.sub(currentPP).max(0);
        if (currentPP.add(gain).gt(cap)) gain = cap.sub(currentPP).max(0);
        return gain.floor().max(0);
    },

    canReset() {
        if (hasUpgrade('m', 21)) return false;             // 禁用重置按钮
        return this.getResetGain().gt(0);
    },

    exponent: function() { return new Decimal(1) },
    gainMult() { return new Decimal(1) },
    gainExp() { return new Decimal(1) },
    row: 4,
    branches: ["tp"],
    hotkeys: [{ key: '', description: "", onPress() { if (canReset(this.layer)) doReset(this.layer) } }],
    layerShown() { return player.points.gte("1e7000") || player.pp?.points?.gte(1) || hasUpgrade('pp', 11) },

    // ────────── 每帧更新 ──────────
    update(diff) {
        // 1. Points Power 子资源生成（原有）
        if (hasUpgrade('pp', 15)) {
            let ppPoints = player.pp.points;
            let base = Decimal.max(ppPoints.div(1e6), new Decimal(1).div(1e6));
            let mult = new Decimal(1);
            if (hasUpgrade('pp', 22)) mult = mult.times(4);
            if (hasUpgrade('pp', 23)) mult = mult.times(8);
            if (hasChallenge('pp', 11)) mult = mult.times(player.points.add(1).log10().pow(0.2).add(1));
            if (hasChallenge('pp', 12)) mult = mult.times(player.p.points.add(1).log10().pow(0.19).add(1).times(2));
            if (hasChallenge('pp', 13)) mult = mult.times(Decimal.max(player.sp.points.add(10).log10().pow(0.17).times(3), 3));
            if (hasChallenge('pp', 14)) mult = mult.times(Decimal.max(player.a.points.add(10).log10().pow(0.14).times(4), 4));
            if (hasUpgrade('sa', 41)) mult = mult.times(upgradeEffect('sa', 41));
            if (hasUpgrade('m', 11)) {
                let eff = upgradeEffect('m', 11);
                if (eff.ppPower) mult = mult.times(eff.ppPower);
            }
            let gain = base.times(mult).times(diff);
            player.pp.pointsPower = player.pp.pointsPower.add(gain);
            if (!tmp.pp) tmp.pp = {};
            tmp.pp.pointsPowerGain = base.times(mult);
        }

        // 2. M‑21 自动获取 PP
        if (hasUpgrade('m', 21)) {
            let points = player.points;
            let pp = player.pp.points.max(1);
            let gainPerSecond = points.add(1).log10().div(pp.add(1).log10().add(1).pow(0.5));
            if (hasUpgrade('m', 65)) {
                let e = player.m.energy || new Decimal(0);
                gainPerSecond = gainPerSecond.times(pp.add(1).log10().add(1).pow(0.5)).times(e.add(1).log10().add(1).pow(2));
            }
            let gain = gainPerSecond.times(diff);
            player.pp.points = player.pp.points.add(gain);
            player.pp.bestPoints = player.pp.bestPoints.max(player.pp.points);
            if (!tmp.pp) tmp.pp = {};
            tmp.pp.ppGain = gainPerSecond;
        }

       if (hasMilestone('ach', 2)) {
    if (!player.pp.time) player.pp.time = new Decimal(0);
    let speed = 1;
    if (hasMilestone('ach', 3)) speed *= 10;
    player.pp.time = player.pp.time.add(diff * speed);
    if (player.pp.time.gte(1)) {
        let times = Decimal.floor(player.pp.time).toNumber();
        player.pp.time = player.pp.time.sub(times);
        for (let i = 0; i < times; i++) {
            if (player.autoPBuyable && layers.p.buyables[11].unlocked() && layers.p.buyables[11].canAfford())
                layers.p.buyables[11].buyMax();
            if (player.autoSPBuyable && layers.sp.buyables[11].unlocked() && layers.sp.buyables[11].canAfford())
                layers.sp.buyables[11].buyMax();
            if (hasChallenge('pp', 14) && player.autoTPFragment && layers.tp.buyables[11].unlocked() && layers.tp.buyables[11].canAfford())
                layers.tp.buyables[11].buyMax();
        }
    }
}
    },

    onPrestige(gain) { player.pp.bestPoints = player.pp.bestPoints.max(player.points) },

    // ────────── 标签页 ──────────
tabFormat: {
    "Upgrades": {
        content: [
            "main-display",
            ["raw-html", function() {
                if (hasUpgrade('m', 21)) {
                    let gain = tmp.pp?.ppGain || new Decimal(0);
                    return `你每秒获得 <h2 style="color: #fd6868ff; text-shadow: 0px 0px 10px #fd6868ff;">${format(gain,4,true)}</h2> PP点`;
                }
                return "";
            }],
            function() { if (!hasUpgrade('m', 21)) return "prestige-button"; },
            "blank",
            ["display-text", function() {
                let amt = player.pp.pointsPower;
                let gain = tmp.pp?.pointsPowerGain || new Decimal(0);
                return `你有<h2 style="color: #fd6868ff; text-shadow: 0px 0px 10px #fd6868ff;">${format(amt)}</h2> Points Power (+<h2 style="color: #fd6868ff; text-shadow: 0px 0px 10px #fd6868ff;">${format(gain)}</h2>/s)`;
            }],
            "blank",
            "upgrades"
        ]
    },
    "Milestones": {
        content: [
            "main-display",
            function() { if (!hasUpgrade('m', 21)) return "prestige-button"; },
            "blank",
            "milestones"
        ]
    },
    "Challenges": {
        content: [
            "main-display",
            function() { if (!hasUpgrade('m', 21)) return "prestige-button"; },
            "blank",
            "challenges"
        ],
        unlocked() { return hasUpgrade('pp', 15) || hasUpgrade('m', 24); }
    }
},
    // ────────── 升级 ──────────
    upgrades: {
        rows: 4, cols: 5,
        11: {
            title: "点数指数",
            description: "每秒点数获取^(pp+1)^ {(1+lg(lg(pp+1)+1))/ (2(lg(pp+1)+10))},先于软上限生效",
            cost: new Decimal(7000),
            unlocked() { return true },
            effect() {
                let x = player.pp.points;
                if (x.eq(0)) return new Decimal(1);
                let logX = x.add(1).log10();
                let logLog = logX.add(1).log10();
                let exponent = new Decimal(1).add(logLog).div(new Decimal(4).times(logX.add(10)));
                let y = x.add(1).pow(exponent);
                return  y;
            },
            effectDisplay() { return "^" + format(upgradeEffect(this.layer, this.id), 4, true) }
        },
        12: { title: "指数软化", description: "软上限(三重、四重)指数再分别乘以1.3,1.4", cost: new Decimal(7000), unlocked() { return hasUpgrade('pp', 11) } },
        13: { title: "指数基础", description: "P点获取^1.003", cost: new Decimal(7000), unlocked() { return hasUpgrade('pp', 12) } },
        14: { title: "指数突破", description: "四重软上限延迟至 1e10000", cost: new Decimal(7000), unlocked() { return hasUpgrade('pp', 13) } },
        15: {
            title: "次级之力",
            description: "解锁一个挑战,解锁 Points Power 子资源",
            cost: new Decimal(10000),
            unlocked() { return hasUpgrade('pp', 14) }
        },
        21: {
            title: "突破！力量初绽",
            description: "解锁 Points Power效果I,点数获取^(lg(10+Points Power))^0.05",
            cost: new Decimal(1),
            currencyDisplayName: "Points Power", currencyInternalName: "pointsPower", currencyLayer: "pp",
            unlocked() { return hasUpgrade('pp', 15) },
            effect() {
                let pp = player.pp.pointsPower || new Decimal(0);
                let exp = new Decimal(0.05);
                if (hasUpgrade('pp', 24)) exp = exp.add(0.025);
                if (hasUpgrade('m', 15)) exp = exp.add(0.025);
                let y=Decimal.pow(Decimal.log10(pp.add(10)), exp);
                return  y;
            },
            effectDisplay() {
                let pp = player.pp.pointsPower || new Decimal(0);
                let exp = new Decimal(0.05);
                if (hasUpgrade('pp', 24)) exp = exp.add(0.025);
                if (hasUpgrade('m', 15)) exp = exp.add(0.025);
                let y=Decimal.pow(Decimal.log10(pp.add(10)), exp);
                return "^" + format(y, 4, true);
            }
        },
        22: { title: "力量涌动", description: "Points Power 产量 *4", cost: new Decimal(10), currencyDisplayName: "Points Power", currencyInternalName: "pointsPower", currencyLayer: "pp", unlocked() { return hasUpgrade('pp', 21) } },
        23: { title: "力量共鸣", description: "Points Power产量*8", cost: new Decimal(50), currencyDisplayName: "Points Power", currencyInternalName: "pointsPower", currencyLayer: "pp", unlocked() { return hasUpgrade('pp', 22) } },
        24: { title: "对数解放", description: "Points Power 效果Ⅰ的指数公式中^0.05+0.025", cost: new Decimal(250), currencyDisplayName: "Points Power", currencyInternalName: "pointsPower", currencyLayer: "pp", unlocked() { return hasUpgrade('pp', 23) } },
        25: { title: "软上限抵抗", description: "前四重软上限指数弱化1.04,1.03,1.02,1.01", cost: new Decimal(1250), currencyDisplayName: "Points Power", currencyInternalName: "pointsPower", currencyLayer: "pp", unlocked() { return hasUpgrade('pp', 24) } },
        31: { title: "次元解锁", description: "解锁P层的新东西", cost: new Decimal(10000), currencyDisplayName: "Points Power", currencyInternalName: "pointsPower", currencyLayer: "pp", unlocked() { return hasUpgrade('pp', 25) } },
    },

    // ────────── 里程碑 ──────────
    milestones: {
        0: { requirementDescription: "7000 PP 点", effectDescription: "每秒获得重置时sa,lw,re的0.1%.", done() { return player.pp.points.gte(7000) } },
        1: { requirementDescription: "10000 PP 点", effectDescription: "每秒再获得重置时sa,lw,re的0.9%.", done() { return player.pp.points.gte(10000) } },
        2: { requirementDescription: "50000 PP 点", effectDescription: "每秒再获得重置时sa,lw,re的4%.", done() { return player.pp.points.gte(50000) } }
    },

    // ────────── 挑战 ──────────
    challenges: {
        11: {
            name: "指数坍缩I", challengeDescription: "你的点数获取速度被压缩为^0.6", goal: new Decimal("1e10000"),
            rewardDescription: function() {
                return "SP-23效果^5,SP-35效果^10,且根据点数增幅Points Power获取,当前:*" + format(player.points.add(10).log10().pow(0.2));
            },
            onComplete() {},
            unlocked() { return hasUpgrade('pp', 15)|| player.pp.activeChallenge == 11 || hasChallenge('pp', 11) }
        },
        12: {
            name: "指数坍缩II", challengeDescription: "你的点数获取速度被压缩为^0.5", goal: new Decimal("1e10000"),
            rewardDescription: function() {
                let mult = player.p.points.add(10).log10().pow(0.19).times(2);
                return "解锁SP层新内容,P点获取*1e100,SP点获取*1e38,A点获取*1e9,根据P点增幅Points Power获取(不小于2),当前: *" + format(mult);
            },
            onComplete() {},
            unlocked() { return hasUpgrade('p', 45) || player.pp.activeChallenge == 12 || hasChallenge('pp', 12) }
        },
        13: {
            name: "指数坍缩III", challengeDescription: "你的点数获取速度被压缩为^0.4", goal: new Decimal("1e10000"),
            rewardDescription: function() {
                let mult = player.sp.points.add(10).log10().pow(0.17).times(3);
                return "解锁A层新内容,SP点获取*1e100,A点获取*1e38,SA,LW,RE点获取*1e9,根据SP点增幅Points Power获取(不小于3),当前: *" + format(mult);
            },
            onComplete() {},
            unlocked() { return hasUpgrade('sp', 45) || player.pp.activeChallenge == 13 || hasChallenge('pp', 13) }
        },
        14: {
            name: "指数坍缩IV", challengeDescription: "你的点数获取速度被压缩为^0.3,但提前解锁凝聚器,TP获取*4.44e44,TPU-11^2.026", goal: new Decimal("1e9000"),
            rewardDescription: function() {
                let mult = player.a.points.add(10).log10().pow(0.14).times(4);
                return "解锁SA层新内容,自动购买TP层升级和时间碎片,TPU-11^1.279,A点获取*1e100,SA,LW,RE点获取*1e38,TP点获取*1e9,提前解锁凝聚器,根据A点增幅Points Power获取(不小于4),当前: *" + format(mult);
            },
            onComplete() {},
            unlocked() { return hasUpgrade('a', 45) || player.pp.activeChallenge == 14 || hasChallenge('pp', 14) }
        },
        15: {
            name: "时间禁锢",
            challengeDescription: "你的点数获取速度被压缩为^0.25,且所有TP购买项被禁用。",
            goal: new Decimal("1e2446"),
            rewardDescription: function() {
                return "时间碎片上限*2,时蚀之刻效果基数*1.000787,每秒获取重置时TP的1%,TP获取*1.79e308,额外获得1个免费时间之晶,解锁新层";
            },
            onComplete() {},
            unlocked() {
                return hasUpgrade('sa', 45)
                    || player.pp.activeChallenge == 15
                    || hasChallenge('pp', 15);
            }
        },
        16: {
            name: "坍缩禁锢",
            challengeDescription: "你的点数获取速度被压缩为^0.009,且所有TP购买项被禁用。",
            goal: new Decimal("1e7500000"),
            rewardDescription: function() {
                return "额外获得1个免费时蚀之刻,时间碎片效果额外乘数因子基础+0.0005,时间碎片价格指数^0.5,解锁一个M挑战";
            },
            onComplete() {},
            unlocked() {
                return hasChallenge('m',15)
                    || player.pp.activeChallenge == 16
                    || hasChallenge('pp', 16);
            }
        },
    },
})
addLayer("m", {
    name: "Mass Power",
    symbol: "M",
    position: 0,
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            mass: new Decimal(0),
            energy: new Decimal(0),
            autoTime: new Decimal(0),       // 自动购买累积时间
        };
    },
    passiveGeneration: function() {
        let p = 0;
        if (hasMilestone('ach', 8)) p += 0.01;
        return p;
    },
    color: "#635c5cff",
    requires: new Decimal(1000000),
    resource: "Mass Power",
    baseResource: "PP 点",
    baseAmount() { return player.pp.points },
    type: "normal",
    branches: ['pp'],
    exponent: function() {
        return new Decimal(0.5);
    },
    gainMult() {
        let m = new Decimal(1);
        if (hasUpgrade('m', 23)) m = m.times(upgradeEffect('m', 23));
        if (hasUpgrade('m', 32)) {
        let eff = upgradeEffect('m', 32);
        if (eff.masspower) m = m.times(eff.masspower);
    }
        if (hasMilestone('ach', 7)) {
        let achFactor = tmp.ach.effect
        m = m.times(achFactor);
    }
        return m;
    },
    gainExp() { return new Decimal(1) },
    row: 5,
    hotkeys: [],
    tabFormat: {
        "Upgrades": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                ["display-text", function() {
                    let amt = player.m.mass || new Decimal(0);
                    let gain = tmp.m?.massGain || new Decimal(0);
                    return `你有 <h2 style="color: #635c5cff; text-shadow: 0px 0px 10px #635c5cff;">${format(amt)}</h2> Mass (+<h2 style="color: #635c5cff; text-shadow: 0px 0px 10px #635c5cff;">${format(gain)}</h2>/s)`;
                }],
                "blank",
                "upgrades"
            ]
        },
        "Milestones": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                ["display-text", function() {
                    let amt = player.m.mass || new Decimal(0);
                    let gain = tmp.m?.massGain || new Decimal(0);
                    return `你有 <h2 style="color: #635c5cff; text-shadow: 0px 0px 10px #635c5cff;">${format(amt)}</h2> Mass (+<h2 style="color: #635c5cff; text-shadow: 0px 0px 10px #635c5cff;">${format(gain)}</h2>/s)`;
                }],
                "blank",
                "milestones"
            ]
        },
        "Buyables": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                ["display-text", function() {
                    let amt = player.m.mass || new Decimal(0);
                    let gain = tmp.m?.massGain || new Decimal(0);
                    return `你有 <h2 style="color: #635c5cff; text-shadow: 0px 0px 10px #635c5cff;">${format(amt)}</h2> Mass (+<h2 style="color: #635c5cff; text-shadow: 0px 0px 10px #635c5cff;">${format(gain)}</h2>/s)`;
                }],
                "blank",
                "buyables"
            ]
        },
        "Challenges": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                ["display-text", function() {
                    let amt = player.m.mass || new Decimal(0);
                    let gain = tmp.m?.massGain || new Decimal(0);
                    return `你有 <h2 style="color: #635c5cff; text-shadow: 0px 0px 10px #635c5cff;">${format(amt)}</h2> Mass (+<h2 style="color: #635c5cff; text-shadow: 0px 0px 10px #635c5cff;">${format(gain)}</h2>/s)`;
                }],
                "blank",
                "challenges"
            ],
            unlocked() { return hasUpgrade('m', 25); }
        },"能量": {
    content: [
        "main-display",
        "prestige-button",
        "blank",
        ["display-text", function() {
    let amt = player.m.energy || new Decimal(0);
    let gain = tmp.m?.energyGain || new Decimal(0);
    let factor = tmp.m?.energyFactor || new Decimal(1);
    return `你有 <h2 style="color: #ffaa00; text-shadow: 0px 0px 10px #ffaa00;">${format(amt)}</h2> 能量 (+<h2 style="color: #ffaa00; text-shadow: 0px 0px 10px #ffaa00;">${format(gain)}</h2>/s)，使一~九重软上限延长 <h2 style="color: #ffaa00; text-shadow: 0px 0px 10px #ffaa00;">^${format(factor, 4, true)}</h2>`;
}],
        "blank",
        ["raw-html", function() {
            return "能量基于mass每秒产生,<b>1.79e308</b>后开始。";
        }],
        "blank",
        ["upgrades", [6]]   // 能量升级
    ],
    unlocked() { return player.m.mass.gte('1.79e308') || player.m.energy.gte(0.00308) || hasMilestone('m', 10); }
},
    },
    layerShown() { return hasChallenge('pp', 15) || player.m.points.gte(1) || player.m.mass.gte(1) || hasUpgrade('m', 11); },
    autoUpgrade: function() { },

    // 自动生成子资源
    update(diff) {
        // 1. 自动生成 mass
        if (hasMilestone('m', 0)) {
            let base = Decimal.max(player.m.points, 1);
            let mult = new Decimal(1);
            let buy11Eff = tmp.m?.buyables?.[11]?.effect;
            if (buy11Eff) base = base.add(buy11Eff);
            let buy12Eff = tmp.m?.buyables?.[12]?.effect;
            if (buy12Eff) mult = mult.times(buy12Eff);
            let buy13Eff = tmp.m?.buyables?.[13]?.effect;
            if (buy13Eff) mult = mult.pow(buy13Eff);
            let exp = new Decimal(1);
            let tier = player.m.buyables[21] || new Decimal(0);
            if (tier.gt(0)) exp = exp.add(tier.div(4));
            // Points Power 加成（里程碑 6）
            if (hasMilestone('m', 6)) {
                let ppBonus = player.pp.pointsPower.add(1).max(1).pow(0.05);
                mult = mult.times(ppBonus);
            }
             if (hasMilestone('m', 8)) {mult=mult.times(125)}
             if (hasUpgrade('m', 32)) {
        let eff = upgradeEffect('m', 32);
        if (eff.mass) mult = mult.times(eff.mass);
    }

            let gainPerSecond = base.times(mult).pow(exp);
            let cap1 =new Decimal('1.79e308')
            if(gainPerSecond.gt(cap1))gainPerSecond=gainPerSecond.div(cap1).pow(0.179).times(cap1)
            let gain = gainPerSecond.times(diff);
            player.m.mass = player.m.mass.add(gain);
            if (!tmp.m) tmp.m = {};
            tmp.m.massGain = gainPerSecond;
        }
// 能量生产 (mass > 1.79e308)
if (player.m.mass.gte('1.79e308')) {
    let energyMult = new Decimal(1);
    let buy31Eff = tmp.m?.buyables?.[31]?.effect || new Decimal(1);
    energyMult = energyMult.times(buy31Eff);
    if (hasUpgrade('m', 32)) {
        let eff = upgradeEffect('m', 32);
        if (eff.energy) energyMult = energyMult.times(eff.energy);
    }
    let energyPerSec = Decimal.log10(player.m.mass.div(1.79e308).add(1)).div(100).times(energyMult);
    if (hasMilestone('ach', 7)) {
        let achFactor = tmp.ach.effect
        energyPerSec = energyPerSec.times(achFactor);
    }
    let energyGain = energyPerSec.times(diff);
    player.m.energy = player.m.energy.add(energyGain);
    if (!tmp.m) tmp.m = {};
    tmp.m.energyGain = energyPerSec;
    tmp.m.energyFactor = getEnergySoftcapFactor();
} else {
    if (!tmp.m) tmp.m = {};
    tmp.m.energyGain = new Decimal(0);
}
        // 2. 软上限延迟（里程碑 7）
        if (hasMilestone('m', 7)) {
            if (!tmp.m) tmp.m = {};
            tmp.m.softcapDelay = player.m.mass.add(1).max(1).pow(0.01);
        }

       // 3.自动购买部分
if (hasMilestone('m', 4)) {
    let speed = 1;
    if (hasMilestone('ach', 3)) speed *= 10;
    player.m.autoTime = player.m.autoTime.add(diff * speed);
    if (player.m.autoTime.gte(1)) {
        let times = Decimal.floor(player.m.autoTime).toNumber();
        player.m.autoTime = player.m.autoTime.sub(times);
        for (let i = 0; i < times; i++) {
            if (player.autoMProd && layers.m.buyables[11].unlocked() && layers.m.buyables[11].canAfford())
                layers.m.buyables[11].buyMax();
            if (player.autoMProd && layers.m.buyables[12].unlocked() && layers.m.buyables[12].canAfford())
                layers.m.buyables[12].buyMax();
            if (player.autoMProd && layers.m.buyables[13].unlocked() && layers.m.buyables[13].canAfford())
                layers.m.buyables[13].buyMax();
            if (hasMilestone('m', 5) && i % 5 === 0 && player.autoMClass) {
                if (layers.m.buyables[21].unlocked() && layers.m.buyables[21].canAfford())
                    layers.m.buyables[21].buy();
            }
        }
    }
}

        // 4. 质量阶级重置后保留（里程碑 8）
        if (hasMilestone('m', 8) && !tmp.m) {
            tmp.m = {};
        }
    },

    milestones: {
        0: {
            requirementDescription: "1 Mass power",
            effectDescription: "每秒自动生成 mass",
            done() { return player.m.points.gte(1); },
        },
        1: {
            requirementDescription: "1e2 mass",
            effectDescription: "解锁质量生产器",
            done() { return player.m.mass.gte(1e2); },
        },
        2: {
            requirementDescription: "1e4 mass",
            effectDescription: "解锁质量倍增器",
            done() { return player.m.mass.gte(1e4); },
        },
        3: {
            requirementDescription: "1e6 mass",
            effectDescription: "解锁质量强化器",
            done() { return player.m.mass.gte(1e6); },
        },
        4: {
            requirementDescription: "1e38 mass",
            effectDescription: "自动购买质量生产器、倍增器、强化器(1/s)",
            done() { return player.m.mass.gte(1e38); },
        },
        5: {
            requirementDescription: "1e50 mass",
            effectDescription: "自动购买质量阶级且重置后保留1级生产器(1/5s)",
            done() { return player.m.mass.gte(1e50); },
        },
        6: {
            requirementDescription: "1e75 mass",
            effectDescription: "mass产量受Points Power加成",
            done() { return player.m.mass.gte(1e75); },
        },
        7: {
            requirementDescription: "1e100 mass",
            effectDescription: "前五重软上限延迟(mass+1)^0.01",
            done() { return player.m.mass.gte(1e100); },
        },
        8: {
            requirementDescription: "1e120 mass",
            effectDescription: "质量阶级不再重置,且效果增强50%",
            done() { return player.m.mass.gte(1e120); },
        },
        9: {
            requirementDescription: "1e280 mass",
            effectDescription: "mass获取*125",
            done() { return player.m.mass.gte(1e280); },
        },
         10: {
            requirementDescription: "1.79e308 mass",
            effectDescription: "解锁能量和能量倍增器",
            done() { return player.m.mass.gte(1.79e308); },
        },
    },

    upgrades: {
        rows: 5,
        cols: 5,
        11: {
            title: "质量转化",
            description: "基于Mass大幅提升点数,小幅提升时间之力,微小提升Points Power产量,解锁一个购买项",
            cost: new Decimal(1),
            effect() {
                let mass = player.m.mass || new Decimal(0);
                return {
                    points: (function() {
                        let raw = mass.add(1).pow(5);
                        if (hasUpgrade('m', 15)) raw = raw.pow(13);
                        let cap = new Decimal("1e100");
                        return raw.lte(cap) ? raw : cap.times(raw.div(cap).pow(0.5));
                    })(),
                    timePower: (function() {
                        let raw = mass.add(10).pow(0.5);
                        if (hasUpgrade('m', 15)) raw = raw.pow(7);
                        let cap = new Decimal("1e38");
                        return raw.lte(cap) ? raw : cap.times(raw.div(cap).pow(0.25));
                    })(),
                    ppPower: (function() {
                        if (mass.lte(0)) return new Decimal(1);
                        let log2e = new Decimal(Math.log2(Math.E));
                        let raw = mass.add(2).log10().div(log2e).max(1);
                        if (hasUpgrade('m', 15)) raw = raw.pow(5);
                        let cap = new Decimal("1e9");
                        return raw.lte(cap) ? raw : cap.times(raw.div(cap).pow(0.5));
                    })(),
                };
            },
            effectDisplay() {
                let eff = upgradeEffect(this.layer, this.id);
                return `点数*${format(eff.points, 4, true)},时间之力*${format(eff.timePower, 4, true)},Points Power*${format(eff.ppPower, 4, true)}`;
            },
        },
        12: {
            title: "时间质量",
            description: "解锁一个TP购买项",
            cost: new Decimal(2),
            unlocked() { return hasUpgrade('m', 11); },
        },
        13: {
            title: "回滞之律",
            description: "基于LW,RE点延长前五重软上限(硬上限^5)",
            cost: new Decimal(3),
            unlocked() { return hasUpgrade('m', 12); },
            effect() {
                let max = new Decimal(5);
                let raw1 = player.lw.points.add(1).log10().div(1e4).add(1);
                let raw2 = player.re.points.add(1).log10().div(1e4).add(1);
                let raw = raw1.add(raw2).div(2);
                if (hasUpgrade('m', 15)) max = new Decimal(10);
                return Decimal.min(raw, max);
            },
            effectDisplay() { return "^" + format(upgradeEffect(this.layer, this.id), 4, true); }
        },
        14: {
            title: "打破六重",
            description: "六重软上限延迟^10,解锁Points Power效果II,时间碎片价格^{0.5/(lg(10+Points Power)^{0.0521})}(硬上限为^0.05)",
            cost: new Decimal(4),
            unlocked() { return hasUpgrade('m', 13); },
            effect() {
                let pp = player.pp.pointsPower || new Decimal(0);
                let exp = new Decimal(0.0521);
                return Decimal.max(Decimal.pow(Decimal.log10(pp.add(10)), exp).pow(-1).times(0.5), 0.05);
            },
            effectDisplay() {
                let pp = player.pp.pointsPower || new Decimal(0);
                let exp = new Decimal(0.0521);
                return "^" + format(Decimal.max(Decimal.pow(Decimal.log10(pp.add(10)), exp).pow(-1).times(0.5), 0.05), 6, true);
            }
        },
        15: {
            title: "提高效率",
            description: "MU-1的效果分别^13,^7,^5,MU-2,SAU-19硬上限延迟至10,Points Power效果I的公式指数+0.025,弱化五重软上限1.055,质量阶级对质量倍增器生效,但是效果^0.5",
            cost: new Decimal(5),
            unlocked() { return hasUpgrade('m', 14); },
        },
        21: {
            title: "去掉限制I",
            description: "PP不再受限于最高points,禁用PP重置,每秒自动获取PP(+lg(points+1) / ((lg(PP+1)+1)^{0.5})/s)",
            cost: new Decimal(10),
            unlocked() { return hasUpgrade('m', 15); },
        },
        22: {
            title: "去掉限制II",
            description: "延长前六重软上限^10,并移除一重软上限,但是六~九重软上限惩罚*10,所有弱化一重软上限m改为对点数^m,但是效果^0.5,所有延迟一重软上限n改为对点数*n,延长一重软上限无效",
            cost: new Decimal(50),
            unlocked() { return hasUpgrade('m', 21); },
        },
        23: {
            title: "指数之质",
            description: "基于PP加成Mass Power获取",
            cost: new Decimal(300),
            unlocked() { return hasUpgrade('m', 22); },
            effect() {
                let pp = player.pp.points || new Decimal(0);
                let raw = pp.add(1).log10().add(1);
                if (hasChallenge('m', 11)) raw = raw.pow(2);
                if (hasChallenge('m', 12)) raw = raw.pow(3);
                if (hasChallenge('m', 13)) raw = raw.pow(3.5);
                return raw;
            },
            effectDisplay() {
                let pp = player.pp.points || new Decimal(0);
                let raw = pp.add(1).log10().add(1);
                if (hasChallenge('m', 11)) raw = raw.pow(2);
                if (hasChallenge('m', 12)) raw = raw.pow(3);
                if (hasChallenge('m', 13)) raw = raw.pow(3.5);
                return "*" + format(raw, 4, true);
            }
        },
        24: {
            title: "存于质量",
            description: "M重置保留PP挑战",
            cost: new Decimal(2100),
            unlocked() { return hasUpgrade('m', 23); },
        },
        25: {
            title: "于质之中",
            description: "解锁M挑战",
            cost: new Decimal(10000),
            unlocked() { return hasUpgrade('m', 24); },
        },
        31: {
            title: "紧密之时",
            description: "时间密度效果基础+0.002",
            cost: new Decimal(1e25),
            unlocked() { return hasUpgrade('m', 25); },
        },
        32: {
            title: "质能一体",
            description: "Masspower加成能量获取,能量加成mass获取,mass加成Masspower获取",
            cost: new Decimal(1e30),
            unlocked() { return hasUpgrade('m', 25)&& hasUpgrade('m', 65); },
           effect() {
                let m = player.m.points || new Decimal(0)
                let ms = player.m.mass || new Decimal(0);
                let e = player.m.energy || new Decimal(0)
                return {
                    mass: (function() {
                        let raw = e.add(1).pow(2);
                        let cap = new Decimal("1e100");
                        return raw.lte(cap) ? raw : cap.times(raw.div(cap).pow(0.5));
                    })(),
                    energy: (function() {
                        let raw = m.add(10).log10().pow(0.5);
                        let cap = new Decimal("1e38");
                        return raw.lte(cap) ? raw : cap.times(raw.div(cap).pow(0.25));
                    })(),
                    masspower: (function() {
                        let raw = ms.add(10).log10().pow(0.2);
                        let cap = new Decimal("1e38");
                        return raw.lte(cap) ? raw : cap.times(raw.div(cap).pow(0.1));
                    })(),
                };
            },
            effectDisplay() {
                let eff = upgradeEffect(this.layer, this.id);
                return `能量*${format(eff.energy, 4, true)}, mass*${format(eff.mass, 4, true)}, Masspower*${format(eff.masspower, 4, true)}`;
            },
        },
        33: {
            title: "能之时",
            description: "时间密度效果基础基于能量增加",
            cost: new Decimal(1e32),
            unlocked() { return hasUpgrade('m', 32); },
            effect() {
                let e = player.m.energy || new Decimal(0);
                let raw = e.add(1).log10().div(520);
                return raw;
            },
            effectDisplay() {
                let e = player.m.energy || new Decimal(0);
                let raw = e.add(1).log10().div(520);
                return "+" + format(raw, 6, true);
            }
        },
        34: {
            title: "砥砺前行",
            description: "第六重软上限弱化25",
            cost: new Decimal(5e32),
            unlocked() { return hasUpgrade('m', 33); },
        },
        35: {
            title: "效率提升",
            description: "能量效果基础从2提升至3,解锁一个M挑战",
            cost: new Decimal(1e33),
            unlocked() { return hasUpgrade('m', 34); },
        },
        61: {
        title: "E1-点数",
        description: "能量强化点数获取",
        cost: new Decimal(10),
        currencyDisplayName: "能量",
        currencyInternalName: "energy",
        currencyLayer: "m",
        unlocked() { return player.m.mass.gte('1.79e308')|| player.m.energy.gte(0.00308) || hasMilestone('m', 10); },
        effect() {
            let e = player.m.energy || new Decimal(0);
            let raw=e.add(1).log10().pow(1).div(10).add(2)
            return raw;
        },
        effectDisplay() { return '^'+format(upgradeEffect(this.layer, this.id),4,true) ; }
    },
    62: {
        title: "E2-P",
        description: "能量强化P点获取",
        cost: new Decimal(100),
        currencyDisplayName: "能量",
        currencyInternalName: "energy",
        currencyLayer: "m",
        unlocked() { return hasUpgrade('m',61); },
        effect() {
            let e = player.m.energy || new Decimal(0);
            let raw=e.add(1).log10().pow(1.2).div(100).add(1.8)
            return raw;
        },
        effectDisplay() { return '^'+format(upgradeEffect(this.layer, this.id),4,true) ; }
    },
    63: {
        title: "E3-SP",
        description: "能量强化SP点获取",
        cost: new Decimal(1000),
        currencyDisplayName: "能量",
        currencyInternalName: "energy",
        currencyLayer: "m",
        unlocked() { return hasUpgrade('m',62); },
        effect() {
            let e = player.m.energy || new Decimal(0);
            let raw=e.add(1).log10().pow(1.4).div(1000).add(1.6)
            return raw;
        },
        effectDisplay() { return '^'+format(upgradeEffect(this.layer, this.id),4,true) ; }
    },
    64: {
        title: "E4-A",
        description: "能量强化A获取",
        cost: new Decimal(10000),
        currencyDisplayName: "能量",
        currencyInternalName: "energy",
        currencyLayer: "m",
        unlocked() { return hasUpgrade('m',63); },
        effect() {
            let e = player.m.energy || new Decimal(0);
            let raw=e.add(1).log10().pow(1.6).div(10000).add(1.4)
            return raw;
        },
        effectDisplay() { return '^'+format(upgradeEffect(this.layer, this.id),4,true) ; }
    },
    65: {
        title: "E5-正常PP",
        description: "PP自动获取不再削减,并且能量强化PP获取,解锁更多质量升级",
        cost: new Decimal(25000),
        currencyDisplayName: "能量",
        currencyInternalName: "energy",
        currencyLayer: "m",
        unlocked() { return hasUpgrade('m',64); },
    effect() {
            let e = player.m.energy || new Decimal(0);
            let raw=e.add(1).log10().add(1).pow(2)
            return raw;
        },
        effectDisplay() { return '*'+format(upgradeEffect(this.layer, this.id),4,true) ; }
    },
        },

    buyables: {
        11: {
            title: "质量生产器",
            unlocked() { return hasMilestone('m', 1); },
            cost(x) {
                if (x.eq(0)) return new Decimal(1);
                let base = Decimal.pow(x.add(1).log10().add(1.01), x.times(1.01))
                    .floor()
                    .times(Decimal.pow(10, x.div(20).floor().sub(1).max(0)));
                if (x.gte(100)) base = base.pow(x.div(100));
                return base.max(1);
            },
            freeAmount() { return new Decimal(0); },
            effect(x) {
                let total = x.add(this.freeAmount());
                if (total.eq(0)) return new Decimal(1);
                let raw = total.times(total.add(1).log10().max(1));
                if (raw.gt(1e308)) {
                    return raw.pow(raw.log10().pow(-1).times(154));
                }
                return raw;
            },
            display() {
                let bought = getBuyableAmount(this.layer, this.id);
                let free = this.freeAmount();
                let cost = tmp[this.layer].buyables[this.id]?.cost || new Decimal(0);
                let eff11_raw = tmp.m?.buyables?.[11]?.effect || new Decimal(1);
                let eff12_raw = tmp.m?.buyables?.[12]?.effect || new Decimal(1);
                let eff13_raw = tmp.m?.buyables?.[13]?.effect || new Decimal(1);
                let currentMult = eff12_raw.pow(eff13_raw);
                let realBaseAdd = eff11_raw.times(currentMult);
                return `花费: ${format(cost)} Mass\n已购买: ${formatWhole(bought)}+${formatWhole(free)}\n` +
                    `mass获取基数+<b>${format(realBaseAdd, 4, true)}</b>`;
            },
            canAfford() {
                let cost = tmp[this.layer].buyables[this.id]?.cost;
                return cost !== undefined && player.m.mass.gte(cost);
            },
            buy() {
                let x = getBuyableAmount(this.layer, this.id);
                let cost = tmp[this.layer].buyables[this.id].cost;
                player.m.mass = player.m.mass.sub(cost);
                player[this.layer].buyables[this.id] = x.add(1);
                updateTemp();
            },
            buyMax() {
                let x = player.m.buyables[11] || new Decimal(0);
                let mass = player.m.mass;
                let count = 0;
                let totalCost = new Decimal(0);
                while (count < 50) {
                    let nextCost = this.cost(x.add(count));
                    let newTotal = totalCost.add(nextCost);
                    if (mass.gte(newTotal)) {
                        totalCost = newTotal;
                        count++;
                    } else break;
                }
                if (count > 0) {
                    player.m.mass = mass.sub(totalCost);
                    player.m.buyables[11] = x.add(count);
                    updateTemp();
                }
            },
        },
        12: {
            title: "质量倍增器",
            unlocked() { return hasMilestone('m', 2); },
            cost(x) {
                if (x.eq(0)) return new Decimal(10);
                let base = Decimal.pow(x.add(1).log10().add(2.2), x.times(1.2))
                    .times(10).floor()
                    .times(Decimal.pow(100, x.div(10).floor().sub(1).max(0)));
                if (x.gte(50)) base = base.pow(x.div(50));
                return base.max(10);
            },
            freeAmount() { return new Decimal(0); },
            effect(x) {
                let total = x.add(this.freeAmount());
                if (total.eq(0)) return new Decimal(1);
                let exp = new Decimal(2);
                let raw = total.add(1).pow(exp);
                let tier = player.m.buyables[21] || new Decimal(0);
                let exptier = tier.div(4).add(1).pow(0.5);
                if (hasUpgrade('m', 15)) raw = raw.pow(exptier);
                if (raw.gt(1e38)) {
                    return raw.sqrt();
                }
                return raw;
            },
            display() {
                let bought = getBuyableAmount(this.layer, this.id);
                let free = this.freeAmount();
                let cost = tmp[this.layer].buyables[this.id]?.cost || new Decimal(0);
                let eff12_real = tmp.m?.buyables?.[12]?.effect || new Decimal(1);
                let eff13_raw = tmp.m?.buyables?.[13]?.effect || new Decimal(1);
                let currentMult = eff12_real.pow(eff13_raw);
                return `花费: ${format(cost)} Mass\n已购买: ${formatWhole(bought)}+${formatWhole(free)}\n` +
                    `质量生产器效果*<b>${format(currentMult, 4, true)}</b>`;
            },
            canAfford() {
                let cost = tmp[this.layer].buyables[this.id]?.cost;
                return cost !== undefined && player.m.mass.gte(cost);
            },
            buy() {
                let x = getBuyableAmount(this.layer, this.id);
                let cost = tmp[this.layer].buyables[this.id].cost;
                player.m.mass = player.m.mass.sub(cost);
                player[this.layer].buyables[this.id] = x.add(1);
                updateTemp();
            },
            buyMax() {
                let x = player.m.buyables[12] || new Decimal(0);
                let mass = player.m.mass;
                let count = 0;
                let totalCost = new Decimal(0);
                while (count < 50) {
                    let nextCost = this.cost(x.add(count));
                    let newTotal = totalCost.add(nextCost);
                    if (mass.gte(newTotal)) {
                        totalCost = newTotal;
                        count++;
                    } else break;
                }
                if (count > 0) {
                    player.m.mass = mass.sub(totalCost);
                    player.m.buyables[12] = x.add(count);
                    updateTemp();
                }
            },
        },
        13: {
            title: "质量强化器",
            unlocked() { return hasMilestone('m', 3); },
            cost(x) {
                if (x.eq(0)) return new Decimal(100);
                let base = Decimal.pow(x.times(0.05).add(4.4), x.times(1.3))
                    .times(100).floor()
                    .times(Decimal.pow(1000, x.div(5).floor().sub(1).max(0)));
                if (x.gte(25)) base = base.pow(x.div(25));
                return base.max(100);
            },
            freeAmount() { return new Decimal(0); },
            effect(x) {
                let total = x.add(this.freeAmount());
                if (total.eq(0)) return new Decimal(1);
                let raw = total.div(13).add(1).pow(0.78);
                if (raw.gt(5)) {
                    raw = raw.div(5).add(10).log10().sqrt().times(5);
                }
                // 挑战 12 限制：效果开方
                if (player.m.activeChallenge == 12) raw = raw.sqrt();
                return raw;
            },
            display() {
                let bought = getBuyableAmount(this.layer, this.id);
                let free = this.freeAmount();
                let cost = tmp[this.layer].buyables[this.id]?.cost || new Decimal(0);
                let eff13_raw = tmp.m?.buyables?.[13]?.effect || new Decimal(1);
                return `花费: ${format(cost)} Mass\n已购买: ${formatWhole(bought)}+${formatWhole(free)}\n` +
                    `质量倍增器效果^<b>${format(eff13_raw, 4, true)}</b>`;
            },
            canAfford() {
                let cost = tmp[this.layer].buyables[this.id]?.cost;
                return cost !== undefined && player.m.mass.gte(cost);
            },
            buy() {
                let x = getBuyableAmount(this.layer, this.id);
                let cost = tmp[this.layer].buyables[this.id].cost;
                player.m.mass = player.m.mass.sub(cost);
                player[this.layer].buyables[this.id] = x.add(1);
                updateTemp();
            },
            buyMax() {
                let x = player.m.buyables[13] || new Decimal(0);
                let mass = player.m.mass;
                let count = 0;
                let totalCost = new Decimal(0);
                while (count < 50) {
                    let nextCost = this.cost(x.add(count));
                    let newTotal = totalCost.add(nextCost);
                    if (mass.gte(newTotal)) {
                        totalCost = newTotal;
                        count++;
                    } else break;
                }
                if (count > 0) {
                    player.m.mass = mass.sub(totalCost);
                    player.m.buyables[13] = x.add(count);
                    updateTemp();
                }
            },
        },
        21: {
            title: "质量阶级",
            unlocked() { return hasUpgrade('m', 11); },
            cost(x) {
                if (x.eq(0)) return new Decimal(100);
                let base = Decimal.pow(x.div(10).add(10), x.pow(2).add(2)).floor();
                if (x.gte(10)) base = base.pow(x.div(10));
                return base;
            },
            effect(x) { return new Decimal(1); },
            display() {
                let x = player[this.layer].buyables[this.id] || new Decimal(0);
                let cost = tmp[this.layer].buyables[this.id]?.cost || new Decimal(0);
                let tier = player.m.buyables[21] || new Decimal(0);
                let classExp = Decimal.add(1, tier.div(4));
                if (hasMilestone('m', 8)) classExp = classExp.times(1.5);  // 效果增强 50%
                if (classExp.gt(5)) classExp = classExp.div(5).log10().add(1).times(5);
                return `花费: ${format(cost)} Mass\n当前阶级: ${formatWhole(x)}\n` +
                    `购买后重置第一行购买项和Mass\n` +
                    `mass获取^<b>${format(classExp, 4, true)}</b>`;
            },
            canAfford() {
                let cost = tmp[this.layer].buyables[this.id]?.cost;
                return cost !== undefined && player.m.mass.gte(cost);
            },
            buy() {
                let x = player[this.layer].buyables[this.id] || new Decimal(0);
                let cost = tmp[this.layer].buyables[this.id].cost;
                player.m.mass = player.m.mass.sub(cost);
                if (!hasMilestone('m', 8)) {
    player.m.mass = new Decimal(0);
                    player[this.layer].buyables[11] = new Decimal(0);
                    player[this.layer].buyables[12] = new Decimal(0);
                    player[this.layer].buyables[13] = new Decimal(0);
                } 
                player[this.layer].buyables[this.id] = x.add(1);
                updateTemp();
            },
        },
        31: {
    title: "能量倍增器",
    unlocked() { return player.m.mass.gte('1.79e308') || player.m.energy.gte(0.00308) || hasMilestone('m', 10); },
    cost(x) { return Decimal.pow(10, x).floor(); },
    currencyDisplayName: "能量",
    currencyInternalName: "energy",
    currencyLayer: "m",
    effect(x) { let base =new Decimal(5);
        let raw=base.pow(x)
        return raw;
    },
    display() {
        let bought = getBuyableAmount(this.layer, this.id);
        let cost = tmp[this.layer].buyables[this.id]?.cost || new Decimal(0);
        let eff = tmp[this.layer].buyables[this.id]?.effect || new Decimal(1);
        return `花费: ${format(cost)} 能量\n已购买: ${formatWhole(bought)}\n效果: 能量获取*${format(eff)}`;
    },
    canAfford() {
        let cost = tmp[this.layer].buyables[this.id]?.cost;
        return cost !== undefined && player.m.energy.gte(cost);
    },
    buy() {
        let x = getBuyableAmount(this.layer, this.id);
        let cost = tmp[this.layer].buyables[this.id].cost;
        player.m.energy = player.m.energy.sub(cost);
        player[this.layer].buyables[this.id] = x.add(1);
        updateTemp();
    },
    buyMax() {
        let x = player.m.buyables[31] || new Decimal(0);
        let energy = player.m.energy;
        let count = 0;
        let totalCost = new Decimal(0);
        while (count < 50) {
            let nextCost = this.cost(x.add(count));
            let newTotal = totalCost.add(nextCost);
            if (energy.gte(newTotal)) {
                totalCost = newTotal;
                count++;
            } else break;
        }
        if (count > 0) {
            player.m.energy = energy.sub(totalCost);
            player.m.buyables[31] = x.add(count);
            updateTemp();
        }
    },
},
    },

    challenges: {
        11: {
            name: "往日不再", challengeDescription: "你的点数获取速度被压缩为^0.01,AU-1效果强制为1", goal: new Decimal("1e75"),
            rewardDescription: function() {
                return "时间碎片价格^0.5,AU-1效果^1.001,MU-8效果^2,且根据点数延长前五重软上限,当前:^" + format(player.points.add(10).log10().pow(0.025),4,true);
            },
            onComplete() {},
            unlocked() { return hasUpgrade('m', 25)|| player.m.activeChallenge == 11 || hasChallenge('m', 11) }
        },
        12: {
            name: "美好回忆", challengeDescription: "你的点数获取速度被压缩为^0.005,AU-1,SPU-1效果强制为1", goal: new Decimal("1e50"),
            rewardDescription: function() {
                return "时间碎片价格^0.25,SPU-1效果^1.002,MU-8效果^3,且根据点数延长第六重软上限,当前:^" + format(player.points.add(10).log10().pow(0.0125),4,true);
            },
            onComplete() {},
            unlocked() { return hasChallenge('m',11)|| player.m.activeChallenge == 12 || hasChallenge('m', 12) }
        },
         13: {
            name: "只余幻影", challengeDescription: "你的点数获取速度被压缩为^0.0025,AU-1,SPU-1,UP-2效果强制为1", goal: new Decimal("1e25"),
            rewardDescription: function() {
                return "时间碎片价格^0.125,PU-1效果^1.004,MU-8效果^3.5,且根据PP延长前六重软上限,当前:^" + format(player.pp.points.add(10).log10().pow(0.05),4,true);
            },
            onComplete() {},
            unlocked() { return hasChallenge('m',12)|| player.m.activeChallenge == 13 || hasChallenge('m', 13) }
        },
        14: {
            name: "痛苦回想", challengeDescription: "你的点数获取速度被压缩为lg(点数获取+1)", goal: new Decimal("20200311"),
            rewardDescription: function() {
                return "时间碎片价格^0.20200311,且根据点数增加成就效果基础,当前:+" + format(player.points.add(10).log10().log10().pow(0.22).div(100),6,true);
            },
            onComplete() {},
            unlocked() { return hasUpgrade('m',35)|| player.m.activeChallenge == 14 || hasChallenge('m', 14) }
        },
        15: {
            name: "辗转反侧", challengeDescription: "你的点数获取速度被压缩为lg(点数获取+1)^5,软上限阀值提前至lg(软上限阀值)", goal: new Decimal("1e16"),
            rewardDescription: function() {
                return "时间碎片价格基础^0.2,时间碎片效果额外乘数因子基础+0.0004,解锁一个PP挑战,且根据点数增加能量效果基础,当前:+" + format(player.points.add(10).log10().log10().pow(0.2).div(10),6,true);
            },
            onComplete() {},
            unlocked() { return hasChallenge('m',14)|| player.m.activeChallenge == 15 || hasChallenge('m', 15) }
        },
        16: {
            name: "不复当年", challengeDescription: "你的点数获取速度被压缩为lg(点数获取^{1.25e-7}+10),软上限阀值提前至lg(软上限阀值)^0.2,软上限惩罚加强,且所有TP购买项被禁用", goal: new Decimal("1e1.79e308"),
            rewardDescription: function() {
                return " ? ? ? "
            },
            onComplete() {},
            unlocked() { return hasChallenge('pp',16)|| player.m.activeChallenge == 16 || hasChallenge('m', 16) }
        },
    },
});
addLayer("PI", {
    name: "往昔幻象",
    symbol: "PI",
    position: 0,
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            autoTime: new Decimal(0),       // 自动购买累积时间
        };
    },
    color: "#ffffffff",
    requires: new Decimal(100),
    resource: "往昔幻象",
    baseResource: "points",
    baseAmount() { return player.points },
    type: "normal",
    branches: ['p','a','sp'],
    exponent: function() {
        return new Decimal(0.5);
    },
    gainMult() {
        let m = new Decimal(1);
         if (hasUpgrade('PI', 13)) m = m.times(upgradeEffect('PI', 13));
          if (hasUpgrade('PI', 14)) m = m.times(upgradeEffect('PI', 14));
        return m;
    },
    gainExp() { return new Decimal(1) },
    row: 0,
    hotkeys: [],
    tabFormat: {
    "往日的回忆": {
        content: [
             ["display-text", function() {
                let eff = player.PI.points.add(1);
                let pi = player.PI.points;
    return `你有 <h2 style="color: #ffffffff; text-shadow: 0px 0px 10px #ffffffff;">${formatWhole(pi)}</h2> 往昔幻象`;
            }], "blank",
            "prestige-button",
            "blank",
            ["display-text", function() {
                return `<h2 style="color: #ffffffff; text-shadow: 0px 0px 10px #ffffffff;">往昔幻象,不复当年</h2>`;
            }],
            "blank",
            "upgrades"
        ]
    },
},
    layerShown() { return player.m.activeChallenge == 16 },
    autoUpgrade: function() { },
    // 自动生成子资源
    update(diff) {
    },

    milestones: {
    },

    upgrades: {
        rows: 5,
        cols: 5,
        11: {
        title: "微弱记忆",
        description: "最终点数获取*2  微弱的记忆,让你回想起往昔的初始",
        cost: new Decimal(1),
        effect() { return new Decimal(2); },
        effectDisplay() { return "*2"; }
    },
    12: {
        title: "往昔余温",
        description: "基于往昔幻象提升最终点数获取",
        cost: new Decimal(3),
        unlocked() { return hasUpgrade('PI', 11); },
        effect() {
            let pi = player.PI.points.add(1);
            return pi.pow(0.5);
        },
        effectDisplay() { return "*" + format(upgradeEffect(this.layer, this.id),4,true); },
    },
    13: {
        title: "仍存于心",
        description: "基于点数提升往昔幻象获取",
        cost: new Decimal(10),
        unlocked() { return hasUpgrade('PI', 12); },
        effect() {
            return player.points.add(1).log10().add(1).pow(0.5);
        },
        effectDisplay() { return "*" + format(upgradeEffect(this.layer, this.id),4,true); },
    },
    14: {
        title: "虽逝不忘",
        description: "基于往昔幻象提升往昔幻象获取",
        cost: new Decimal(50),
        unlocked() { return hasUpgrade('PI', 13); },
        effect() {
            return player.PI.points.add(1).pow(0.25);
        },
        effectDisplay() { return "*" + format(upgradeEffect(this.layer, this.id),4,true); },
    },
    15: {
        title: "永记于心",
        description: "基于点数提升最终点数获取",
        cost: new Decimal(100),
        unlocked() { return hasUpgrade('PI', 14); },
        effect() {
            return player.points.add(1).pow(0.25);
        },
        effectDisplay() { return "*" + format(upgradeEffect(this.layer, this.id),4,true); },
    },
        },

    buyables: {
    },
});
addLayer("pr", {
    name: "Past Reminiscence",
    symbol: "PR",        
    startData() { return { unlocked: true, points: new Decimal(0) } },
    color: "#8f8f8fff",
    resource: "昔日追忆",
    baseResource: "points",
    baseAmount() { return player.points },
    type: "normal",                // 无重置按钮，仅通过里程碑获取
    row: 5,   
    branches: ['pp','m'],                 
    layerShown() { return player.m.activeChallenge == 16 || player.pr.points.gt(0); },
    milestones: {
        0: {
            requirementDescription: "在CM16中达到1e4点数",
            effectDescription: "昔日追忆增加成就基础",
            done() { return player.points.gte(1e4) && player.m.activeChallenge == 16; },
            onComplete() {
                player.pr.points = player.pr.points.add(1);
                updateTemp();
            }
        },
        
        // 可继续按需添加
    },
    tabFormat: {
        "昔日追忆": {
            content: [
                ["display-text", function() {
                    let pts = player.pr.points;
                    return `你拥有 <h2 style="color: #8f8f8fff; text-shadow: 0px 0px 10px #8f8f8fff;">${formatWhole(pts)}</h2> 昔日追忆,使点数获取 <h2 style="color: #8f8f8fff; text-shadow: 0px 0px 10px #8f8f8fff;">^${format(player.pr.points.add(1).pow(2), 4, true)}</h2> `;
                }],
                "blank",
                ["display-text", function() {              
                        let bestPts = player.cm16BestPoints || new Decimal(0);
                        let Ptseff = bestPts.add(1).log10().add(1) || new Decimal(1);
                        return `<h2 style="color: #ffffffff; text-shadow: 0px 0px 5px #ffffffff;">CM16中最高点数为${format(bestPts, 4, true)},使点数获取^${format(Ptseff, 4, true)}`;                  
                }],
                ["display-text", function() {              
                        let bestPps = player.cm16BestPointsPerSec || new Decimal(0);
                        let Ppseff = bestPps.add(1).log10().add(1).pow(2) || new Decimal(1);
                        return `</h2><br><h2 style="color: #ffffffff; text-shadow: 0px 0px 5px #ffffffff;">CM16中最高点数获取为${format(bestPps, 4, true)}/s,使点数获取^${format(Ppseff, 4, true)}</h2>`;                  
                }],
                "blank",
                "milestones"
            ]
        }
    },
});
addLayer("ach", {
    name: "Achievements",
    symbol: "A",
    position: 0,
    row: "side",
    color: "#fbff00ff",
    resource: "成就点数",
    type: "none",
    startData() { return { unlocked: true, points: new Decimal(0) } },
    layerShown() { return true },

    tabFormat: {
        "成就": { content: ["main-display", "blank", "achievements"] },
        "里程碑": { content: ["main-display", "blank", "milestones"] }
    },
    milestones: {
        0: { requirementDescription: "解放双手I (18成就点)", effectDescription: "自动购买P,SP,A层升级", done() { return player.ach.points.gte(18) } },
        1: { requirementDescription: "成就优化I (36成就点)", effectDescription: "优化成就点效果公式", done() { return player.ach.points.gte(36) } },
        2: { requirementDescription: "成就优化II (60成就点)", effectDescription: "优化成就点效果公式", done() { return player.ach.points.gte(60) } },
        3: { requirementDescription: "解放双手II (90成就点)", effectDescription: "自动购买P,SP层购买项(100/100ms)", done() { return player.ach.points.gte(90) } },
        4: { requirementDescription: "自动获取I (168成就点)", effectDescription: "每秒获取重置时TP的4%,重置时SA,LW,RE的5%,重置时A,SP,P的9000%", done() { return player.ach.points.gte(168) } },
     5: { requirementDescription: "解放双手III (200成就点)", effectDescription: "自动购买SA,LW,RE层升级", done() { return player.ach.points.gte(200) } },
6: { requirementDescription: "解放双手IV (216成就点)", effectDescription: "自动购买TPA-2,3购买项(100/100ms)", done() { return player.ach.points.gte(216) } },
7: {
    requirementDescription: "不限于此 (270成就点)",
    effectDescription: "成就优化I,II效果无效,但成就点效果对Masspower与能量获取生效",
    done() { return player.ach.points.gte(270) }
},
8: { requirementDescription: "自动获取II (320成就点)", effectDescription: "每秒获取重置时Mass Power的1%", done() { return player.ach.points.gte(320) } },},
    achievements: {
        rows: 100, cols: 6,
        11: { name: "起点", tooltip: "获得10点数 奖励:1成就点。", done() { return player.points.gte(10) }, onComplete() { addPoints("ach", 1) } },
        12: { name: "P?", tooltip: "获得1P点 奖励:1成就点。", done() { return player.p.points.gte(1) }, onComplete() { addPoints("ach", 1) } },
        13: { name: "一群P", tooltip: "获得100P点 奖励:1成就点。", done() { return player.p.points.gte(100) }, onComplete() { addPoints("ach", 1) } },
        14: { name: "第二声望", tooltip: "解锁SP层 奖励:1成就点。", done() { return player.sp.unlocked }, onComplete() { addPoints("ach", 1) } },
        15: { name: "百倍SP", tooltip: "获得100SP点 奖励:1成就点。", done() { return player.sp.points.gte(100) }, onComplete() { addPoints("ach", 1) } },
        16: { name: "放大!", tooltip: "解锁A层 奖励:1成就点。", done() { return player.a.unlocked }, onComplete() { addPoints("ach", 1) } },
        21: { name: "百万P点", tooltip: "获得1,000,000P点 奖励:2成就点。", done() { return player.p.points.gte(1e6) }, onComplete() { addPoints("ach", 2) } },
        22: { name: "天文数字", tooltip: "获得1e308点数 奖励:2成就点。", done() { return player.points.gte("1e308") }, onComplete() { addPoints("ach", 2) } },
        23: { name: "律令编织", tooltip: "解锁LW层 奖励:2成就点。", done() { return player.lw.unlocked }, onComplete() { addPoints("ach", 2) } },
        24: { name: "源质增幅", tooltip: "解锁SA层 奖励:2成就点。", done() { return player.sa.unlocked }, onComplete() { addPoints("ach", 2) } },
        25: { name: "递归回声", tooltip: "解锁RE层 奖励:2成就点。", done() { return player.re.unlocked }, onComplete() { addPoints("ach", 2) } },
        26: { name: "千指点数", tooltip: "获得1e1000点数 奖励:2成就点。", done() { return player.points.gte("1e1000") }, onComplete() { addPoints("ach", 2) } },
        31: { name: "时间之始", tooltip: "解锁TP层 奖励:3成就点。", done() { return player.tp.unlocked }, onComplete() { addPoints("ach", 3) } },
        32: { name: "时间之力", tooltip: "购买TP升级「时间之力」(TP-21) 奖励:3成就点。", done() { return hasUpgrade('tp', 21) }, onComplete() { addPoints("ach", 3) } },
        33: { name: "碎片收集者", tooltip: "购买10个时间碎片 奖励:3成就点。", done() { return (player.tp.buyables[11] || new Decimal(0)).gte(10) }, onComplete() { addPoints("ach", 3) } },
        34: { name: "力量初现", tooltip: "解锁PP层 奖励:3成就点。", done() { return player.pp.unlocked }, onComplete() { addPoints("ach", 3) } },
        35: { name: "万指点数", tooltip: "获得1e10000点数 奖励:3成就点。", done() { return player.points.gte("1e10000") }, onComplete() { addPoints("ach", 3) } },
        36: { name: "指数坍缩 I", tooltip: "完成挑战「指数坍缩I」 奖励:3成就点。", done() { return hasChallenge('pp', 11) }, onComplete() { addPoints("ach", 3) } },
        41: { name: "五重起点", tooltip: "获得1e50000点数 奖励:4成就点。", done() { return player.points.gte("1e50000") }, onComplete() { addPoints("ach", 4) } },
        42: { name: "力量涌动", tooltip: "拥有1e4 Points Power 奖励:4成就点。", done() { return player.pp.pointsPower.gte(1e4) }, onComplete() { addPoints("ach", 4) } },
        43: { name: "次元破壁", tooltip: "购买升级「次元解锁」 奖励:4成就点。", done() { return hasUpgrade('pp', 31) }, onComplete() { addPoints("ach", 4) } },
        44: { name: "自增之力I", tooltip: "购买30个「自增器」 奖励:4成就点。", done() { return (player.p.buyables[11] || new Decimal(0)).gte(30) }, onComplete() { addPoints("ach", 4) } },
        45: { name: "五重溶解", tooltip: "购买升级「软上限溶解」 奖励:4成就点。", done() { return hasUpgrade('p', 43) }, onComplete() { addPoints("ach", 4) } },
        46: { name: "终极のP", tooltip: "购买升级「终极增幅-P」 奖励:4成就点。", done() { return hasUpgrade('p', 45) }, onComplete() { addPoints("ach", 4) } },
        51: { name: "指数坍缩II", tooltip: "完成挑战「指数坍缩II」 奖励:5成就点。", done() { return hasChallenge('pp', 12) }, onComplete() { addPoints("ach", 5) } },
        52: { name: "自增之力II", tooltip: "购买升级「自增^2」 奖励:5成就点。", done() { return hasUpgrade('sp', 43) }, onComplete() { addPoints("ach", 5) } },
        53: { name: "凝聚之力", tooltip: "购买25个「凝聚器」 奖励:5成就点。", done() { return (player.sp.buyables[11] || new Decimal(0)).gte(25) }, onComplete() { addPoints("ach", 5) } },
        54: { name: "指数坍缩III", tooltip: "完成挑战「指数坍缩III」 奖励:5成就点。", done() { return hasChallenge('pp', 13) }, onComplete() { addPoints("ach", 5) } },
        55: { name: "打破五重!", tooltip: "购买升级「突破五重」 奖励:5成就点。", done() { return hasUpgrade('a', 41) }, onComplete() { addPoints("ach", 5) } },
        56: { name: "时间侵蚀", tooltip: "购买10个「时蚀之刻」 奖励:5成就点。", done() { return (player.tp.buyables[13] || new Decimal(0)).gte(10) }, onComplete() { addPoints("ach", 5) } },
        61: { name: "指数坍缩IV", tooltip: "完成挑战「指数坍缩IV」 奖励:6成就点。", done() { return hasChallenge('pp', 14) }, onComplete() { addPoints("ach", 6) } },
        62: { name: "五重弱化I", tooltip: "购买升级「弱化上限」 奖励:6成就点。", done() { return hasUpgrade('sa', 23) }, onComplete() { addPoints("ach", 6) } },
        63: { name: "五重弱化II", tooltip: "购买升级「律令弱化」 奖励:6成就点。", done() { return hasUpgrade('lw', 23) }, onComplete() { addPoints("ach", 6) } },
        64: { name: "五重弱化III", tooltip: "购买升级「回声弱化」 奖励:6成就点。", done() { return hasUpgrade('re', 23) }, onComplete() { addPoints("ach", 6) } },
        65: { name: "什么叫作软上限", tooltip: "购买升级「源质延迟」 奖励:6成就点。", done() { return hasUpgrade('sa', 44) }, onComplete() { addPoints("ach", 6) } },
        66: { name: "还来?", tooltip: "购买升级「终极源质」 奖励:6成就点。", done() { return hasUpgrade('sa', 45) }, onComplete() { addPoints("ach", 6) } },
    71: { name: "时间禁锢", tooltip: "完成挑战「时间禁锢」 奖励:7成就点。", done() { return hasChallenge('pp', 15) }, onComplete() { addPoints("ach", 7) } },
    72: { name: "588?!", tooltip: "购买588个时间碎片 奖励:7成就点。", done() { return (player.tp.buyables[11] || new Decimal(0)).gte(588) }, onComplete() { addPoints("ach", 7) } },
    73: { name: "900000指数!", tooltip: "PP达到900000 奖励:7成就点。", done() { return player.pp.points.gte(900000) }, onComplete() { addPoints("ach", 7) } },
    74: { name: "百万点数？", tooltip: "点数达到1e950000 奖励:7成就点。", done() { return player.points.gte('1e950000') }, onComplete() { addPoints("ach", 7) } },
    75: { name: "百万指数!", tooltip: "PP达到1000000 奖励:7成就点。", done() { return player.pp.points.gte(1000000) }, onComplete() { addPoints("ach", 7) } },
    76: { name: "质量涌现", tooltip: "进行质量重置 奖励:7成就点。", done() { return player.m.points.gte(1) }, onComplete() { addPoints("ach", 7) } },
    81: { name: "质量增量?", tooltip: "购买1个质量阶级 奖励:8成就点。", done() { return player.m.buyables[21].gte(1) }, onComplete() { addPoints("ach", 8) } },
    82: { name: "!?锻体器?!", tooltip: "购买5个质量生成器 奖励:8成就点。", done() { return player.m.buyables[11].gte(5) }, onComplete() { addPoints("ach", 8) } },
    83: { name: "!?助推器?!", tooltip: "购买5个质量倍增器 奖励:8成就点。", done() { return player.m.buyables[12].gte(5) }, onComplete() { addPoints("ach", 8) } },
    84: { name: "!?强化器?!", tooltip: "购买5个质量强化器 奖励:8成就点。", done() { return player.m.buyables[13].gte(5) }, onComplete() { addPoints("ach", 8) } },
    85: { name:  "<b style='color:rgba(255, 0, 221, 1); text-shadow: 0 0 2px #000, 0 0 2px #000, 0 0 2px #000, 0 0 2px #000;'>时间</b><b style='color:rgba(47, 0, 255, 1); text-shadow: 0 0 2px #000, 0 0 2px #000, 0 0 2px #000, 0 0 2px #000;'>密度</b>", tooltip: "购买1个 <b style='color:rgba(255, 0, 221, 1); text-shadow: 0 0 2px #000, 0 0 2px #000, 0 0 2px #000, 0 0 2px #000;'>时间</b><b style='color:rgba(47, 0, 255, 1); text-shadow: 0 0 2px #000, 0 0 2px #000, 0 0 2px #000, 0 0 2px #000;'>密度</b>, 奖励:8成就点。", done() { return player.tp.buyables[21].gte(1) }, onComplete() { addPoints("ach", 8) } },
    86: { name: "打破六重", tooltip: "购买升级「打破六重」 奖励:8成就点。", done() { return hasUpgrade('m',14) }, onComplete() { addPoints("ach", 8) } },
    91: { name: "能量初现", tooltip: "拥有10点能量 奖励:9成就点。", done() { return player.m.energy.gte(10) }, onComplete() { addPoints("ach", 9) } },
92: { name: "能量倍增", tooltip: "购买5个能量倍增器 奖励:9成就点。", done() { return (player.m.buyables[31] || new Decimal(0)).gte(5) }, onComplete() { addPoints("ach", 9) } },
93: { name: "能量强化", tooltip: "购买升级「E5-正常PP」 奖励:9成就点。", done() { return hasUpgrade('m', 65) }, onComplete() { addPoints("ach", 9) } },
94: { name: "质能转换", tooltip: "购买升级「质能一体」 奖励:9成就点。", done() { return hasUpgrade('m', 32) }, onComplete() { addPoints("ach", 9) } },
95: { name: "砥砺前行", tooltip: "购买升级「砥砺前行」 奖励:9成就点。", done() { return hasUpgrade('m', 34) } , onComplete() { addPoints("ach", 9) } },
96: { name: "超越极限", tooltip: "点数达到 1e1e14 奖励:9成就点。", done() { return player.points.gte('1e1e14') }, onComplete() { addPoints("ach", 9) } },
101: { name: "黑暗岁月", tooltip: "完成挑战「痛苦回想」 奖励:10成就点。", done() { return hasChallenge('m', 14) }, onComplete() { addPoints("ach", 10) } },
102: { name: "难以入睡", tooltip: "完成挑战「辗转反侧」 奖励:10成就点。", done() { return hasChallenge('m', 15) }, onComplete() { addPoints("ach", 10) } },
103: { name: "指数已尽", tooltip: "完成挑战「坍缩禁锢」 奖励:10成就点。", done() { return hasChallenge('pp', 16) }, onComplete() { addPoints("ach", 10) } },
104: { name: "往日种种", tooltip: "达到1往昔幻象 奖励:10成就点。", done() { return player.PI.points.gte(1) }, onComplete() { addPoints("ach", 10) } },
105: { name: "往日...", tooltip: "达到1昔日追忆 奖励:10成就点。", done() { return player.pr.points.gte(1) }, onComplete() { addPoints("ach", 10) } },
106: { name: "记忆模糊", tooltip: "在CM16中最高点数获取达600/s 奖励:10成就点。", done() { return player.cm16BestPointsPerSec.gte(600) }, onComplete() { addPoints("ach", 10) } },
},
    effect() {
    let base = new Decimal(1.01);
    if(hasChallenge('m',14)) base = base.add(player.points.add(10).log10().log10().pow(0.22).div(100));
    base=base.add(Decimal.pow(player.pr.points,2).div(100));
    // 如果里程碑7未达成，则应用优化I和II
    if (!hasMilestone('ach', 7)) {
        if (hasMilestone('ach', 1)) base = base.add(player.ach.points);
        if (hasMilestone('ach', 2)) base = base.pow(player.ach.points.div(37.5).add(1));
    }
    let raw = base.pow(player.ach.points.add(1));
    let cap = new Decimal('1e2000');
    return raw.lte(cap) ? raw : cap.times(raw.div(cap).pow(0.5));
},
effectDescription() {
        return "成就点数使点数获取*" + format(tmp.ach.effect,4,true);
    }
})
addLayer("ab", {
    name: "AutoBuy",
    symbol: "AB",
    position: 2,
    row: "side",
    color: "#ae00ffff",
    resource: "",
    type: "none",
    startData() { return { unlocked: true } },
    layerShown() { return player.p.unlocked || player.pp.unlocked || player.m.unlocked },
    tooltip: "自动购买开关",
    clickables: {
        rows: 6,
        cols: 5,
        // ── P 层 ──
        11: {
            title: "UP",
            display() {
                if (hasMilestone('ach', 0)) player.permUP = true; // 解锁后永久
                return player.permUP ? (player.autoPUpgrade ? "开" : "关") : "禁用";
            },
            unlocked() { return true },
            canClick() { return player.permUP },
            onClick() { player.autoPUpgrade = !player.autoPUpgrade },
            style: { "background-color"() { return player.autoPUpgrade ? "#4BDC13" : "#666666" } },
        },
        12: {
            title: "BP1",
            display() {
                if (hasMilestone('ach', 2)) player.permBP1 = true;
                return player.permBP1 ? (player.autoPBuyable ? "开" : "关") : "禁用";
            },
            unlocked() { return true },
            canClick() { return player.permBP1 },
            onClick() { player.autoPBuyable = !player.autoPBuyable },
            style: { "background-color"() { return player.autoPBuyable ? "#4BDC13" : "#666666" } },
        },
        // ── SP 层 ──
        13: {
            title: "USP",
            display() {
                if (hasMilestone('ach', 0)) player.permUSP = true;
                return player.permUSP ? (player.autoSPUpgrade ? "开" : "关") : "禁用";
            },
            unlocked() { return true },
            canClick() { return player.permUSP },
            onClick() { player.autoSPUpgrade = !player.autoSPUpgrade },
            style: { "background-color"() { return player.autoSPUpgrade ? "#ffc400" : "#666666" } },
        },
        14: {
            title: "BSP1",
            display() {
                if (hasMilestone('ach', 2)) player.permBSP1 = true;
                return player.permBSP1 ? (player.autoSPBuyable ? "开" : "关") : "禁用";
            },
            unlocked() { return true },
            canClick() { return player.permBSP1 },
            onClick() { player.autoSPBuyable = !player.autoSPBuyable },
            style: { "background-color"() { return player.autoSPBuyable ? "#ffc400" : "#666666" } },
        },
        // ── A 层 ──
        15: {
            title: "UA",
            display() {
                if (hasMilestone('ach', 0)) player.permUA = true;
                return player.permUA ? (player.autoAUpgrade ? "开" : "关") : "禁用";
            },
            unlocked() { return true },
            canClick() { return player.permUA },
            onClick() { player.autoAUpgrade = !player.autoAUpgrade },
            style: { "background-color"() { return player.autoAUpgrade ? "#1900ffff" : "#666666" } },
        },
        // ── SA / LW / RE ──
        21: {
            title: "USA",
            display() {
                if (hasMilestone('ach', 5) ) player.permUSA = true;
                return player.permUSA ? (player.autoSAUpgrade ? "开" : "关") : "禁用";
            },
            unlocked() { return true },
            canClick() { return player.permUSA },
            onClick() { player.autoSAUpgrade = !player.autoSAUpgrade },
            style: { "background-color"() { return player.autoSAUpgrade ? "#00ffbfff" : "#666666" } },
        },
        22: {
            title: "ULW",
            display() {
                if (hasMilestone('ach', 5)) player.permULW = true;
                return player.permULW ? (player.autoLWUpgrade ? "开" : "关") : "禁用";
            },
            unlocked() { return true },
            canClick() { return player.permULW },
            onClick() { player.autoLWUpgrade = !player.autoLWUpgrade },
            style: { "background-color"() { return player.autoLWUpgrade ? "#c2f310ff" : "#666666" } },
        },
        23: {
            title: "URE",
            display() {
                if (hasMilestone('ach', 5)) player.permURE = true;
                return player.permURE ? (player.autoREUpgrade ? "开" : "关") : "禁用";
            },
            unlocked() { return true },
            canClick() { return player.permURE },
            onClick() { player.autoREUpgrade = !player.autoREUpgrade },
            style: { "background-color"() { return player.autoREUpgrade ? "rgba(0,89,255,1)" : "#666666" } },
        },
        // ── TP 层 ──
        24: {
            title: "UTP&BTP1",
            display() {
                if (hasChallenge('pp', 14)) player.permUTP = true;
                return player.permUTP ? (player.autoTPFragment ? "开" : "关") : "禁用";
            },
            unlocked() { return true },
            canClick() { return player.permUTP },
            onClick() { player.autoTPFragment = !player.autoTPFragment },
            style: { "background-color"() { return player.autoTPFragment ? "rgba(255,0,221,1)" : "#666666" } },
        },
        25: {
            title: "BTP2&BTP3",
            display() {
                if (hasMilestone('ach', 6)) player.permBTP23 = true;
                return player.permBTP23 ? (player.autoTPCrystalEclipse ? "开" : "关") : "禁用";
            },
            unlocked() { return true },
            canClick() { return player.permBTP23 },
            onClick() { player.autoTPCrystalEclipse = !player.autoTPCrystalEclipse },
            style: { "background-color"() { return player.autoTPCrystalEclipse ? "rgba(255,0,221,1)" : "#666666" } },
        },
        // ── M 层 ──
        31: {
            title: "BM1&BM2&BM3",
            display() {
                if (hasMilestone('m', 4)) player.permBM = true;
                return player.permBM ? (player.autoMProd ? "开" : "关") : "禁用";
            },
            unlocked() { return true },
            canClick() { return player.permBM },
            onClick() { player.autoMProd = !player.autoMProd },
            style: { "background-color"() { return player.autoMProd ? "#635c5cff" : "#666666" } },
        },
        32: {
            title: "BM4",
            display() {
                if (hasMilestone('m', 5)) player.permBM4 = true;
                return player.permBM4 ? (player.autoMClass ? "开" : "关") : "禁用";
            },
            unlocked() { return true },
            canClick() { return player.permBM4 },
            onClick() { player.autoMClass = !player.autoMClass },
            style: { "background-color"() { return player.autoMClass ? "#635c5cff" : "#666666" } },
        },
    },
});