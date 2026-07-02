addLayer("p", {
    name: "prestige",
    symbol: "P",
    position: 0,
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
    }},
    color: "#4BDC13",
    requires: new Decimal(10),
    resource: "prestige points",
    baseResource: "points",
    baseAmount() {return player.points},
    type: "normal",
    exponent: function() {
        let exp = new Decimal(0.52);
        if (hasUpgrade('a', 12)) exp = exp.times(1.01);
        if (hasUpgrade('sp', 33)) exp = exp.add(upgradeEffect('sp', 33));
        return exp;
    },
    passiveGeneration: function() {
        let passiveGeneration = 0;
        if (hasUpgrade('a', 14)) passiveGeneration = passiveGeneration+0.01;
        if (hasUpgrade('a', 22)) passiveGeneration = passiveGeneration+0.09;
        if (hasUpgrade('a', 23)) passiveGeneration = passiveGeneration+0.9;
        if (hasUpgrade('sa', 11)) passiveGeneration = passiveGeneration+9;
        return passiveGeneration;
    },
    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade('p', 13)) mult = mult.times(upgradeEffect('p', 13))
        if (hasUpgrade('p', 14)) mult = mult.times(upgradeEffect('p', 14))
        if (hasUpgrade('sp', 11)) mult = mult.times(2)
        if (hasUpgrade('sp', 12)) mult = mult.times(upgradeEffect('sp', 12))
        if (hasUpgrade('a', 11)) mult = mult.times(upgradeEffect('a', 11))
        if (hasMilestone('sp', 1)) mult = mult.times(1.2);
        if (hasMilestone('sp', 4)) mult = mult.times(1.5);
        if (hasMilestone('sp', 5)) mult = mult.times(10);
        if (hasUpgrade('p', 23)) mult = mult.times(upgradeEffect('p', 23))
        if (hasUpgrade('p', 24)) mult = mult.times(upgradeEffect('p', 24))
        if (hasUpgrade('sa', 12)) mult = mult.times(upgradeEffect('sa', 12))
        if (hasUpgrade('tp', 11)) mult = mult.times(upgradeEffect('tp', 11)); 
        if (hasUpgrade('p', 41)) mult = mult.times(upgradeEffect('p', 41));
        if (hasUpgrade('p', 42)) mult = mult.times(upgradeEffect('p', 42));
        if (hasUpgrade('p', 43)) mult = mult.times(1e81);
        if (hasMilestone('tp', 0)) mult = mult.times(1e20);
        if (hasChallenge('pp', 12)) mult = mult.times(1e100);
        if (player.p.buyables && player.p.buyables[11] && player.p.buyables[11].gt(0)) {
            let buyableEff = tmp.p.buyables[11]?.effect || new Decimal(1);
            mult = mult.times(buyableEff);
        }
        return mult
    },
    gainExp() { return new Decimal(1) },
    row: 0,
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
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
    autoUpgrade: function() { return hasMilestone('ach', 0); }, 
    buyables: {
        11: {
            title: "自增器",
            cost(x) { return Decimal.pow(x.add(3).times(10), x.times(x.add(1)).pow(x.add(10).log10().div(3).add(1))).floor(); },
            effect(x) {
                if (x.eq(0)) return new Decimal(1);
                return Decimal.pow(x.add(10).times(10), x.pow(x.add(10).log10().div(2).add(1.01)));
            },
            display() {
                let x = player[this.layer].buyables[this.id] || new Decimal(0);
                let cost = tmp[this.layer].buyables[this.id]?.cost || new Decimal(0);
                let eff = tmp[this.layer].buyables[this.id]?.effect || new Decimal(1);
                return `花费: ${format(cost)}P点\n已购买: ${formatWhole(x)}\n效果: P点获取*${format(eff)}`;
            },
            canAfford() {
                let cost = tmp[this.layer].buyables[this.id]?.cost;
                return cost !== undefined && player[this.layer].points.gte(cost);
            },
            buy() {
                let x = player[this.layer].buyables[this.id] || new Decimal(0);
                let cost = tmp[this.layer].buyables[this.id].cost;
                player[this.layer].points = player[this.layer].points.sub(cost);
                player[this.layer].buyables[this.id] = x.add(1);
                updateTemp();
            },
            unlocked() { return hasUpgrade('pp', 31); },
        },
    },
    upgrades: {
        11: { title: "01", description: "双倍点数获取", cost: new Decimal(1) },       
        12: {
            title: "02", description: "基于你的p点提升点数获取", cost: new Decimal(5),
            unlocked() { return hasUpgrade('p', 11) },
            effect() {
                let base = player.p.points.add(1);
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
            title: "03", description: "基于你的点数提升p点获取(到100p点解锁SP重置)", cost: new Decimal(10),
            unlocked() { return hasUpgrade('p', 12) },
            effect() {
                let base = player.points.add(1);
                let raw = base.pow(0.175);
                let cap = new Decimal("1e38");
                if (raw.lte(cap)) return raw;
                let ratio = raw.div(cap);
                let capped = ratio.pow(0.0875);
                return cap.times(capped);
            }, effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        14: {
            title: "04", description: "基于你的p点提升p点获取", cost: new Decimal(250),
            unlocked() { return hasUpgrade('p', 13) },
            effect() {
                let base = player.p.points.add(1);
                let raw = base.pow(0.135);
                let cap = new Decimal("1e38");
                if (raw.lte(cap)) return raw;
                let ratio = raw.div(cap);
                let capped = ratio.pow(0.0675);
                return cap.times(capped);
            }, effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        15: {
            title: "05", description: "基于你的p点提升sp点获取(到1e6p点解锁A重置)", cost: new Decimal(10000),
            unlocked() { return hasUpgrade('p', 14) },
            effect() {
                let base = player.p.points.add(1);
                let raw = base.pow(0.0725);
                let cap = new Decimal("1e38");
                if (raw.lte(cap)) return raw;
                let ratio = raw.div(cap);
                let capped = ratio.pow(0.03625);
                return cap.times(capped);
            }, effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        21: {
            title: "06", description: "基于你的点数提升点数获取", cost: new Decimal(1000000),
            unlocked() { return hasUpgrade('p', 15) },
            effect() {
                let base = player.points.add(1);
                let raw = base.pow(0.135);
                let cap = new Decimal("1e38");
                if (raw.lte(cap)) return raw;
                let ratio = raw.div(cap);
                let capped = ratio.pow(0.0675);
                return cap.times(capped);
            }, effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        22: {
            title: "07", description: "amplifier获取公式指数+0.03", cost: new Decimal(1e9),
            unlocked() { return hasUpgrade('p', 21) },
        },
        23: {
            title: "08", description: "p点获取*p点^0.1", cost: new Decimal(1e12),
            unlocked() { return hasUpgrade('p', 22) },
            effect() {
                let base = player.p.points.add(1);
                let raw = base.pow(0.1);
                let cap = new Decimal("1e38");
                if (raw.lte(cap)) return raw;
                let ratio = raw.div(cap);
                let capped = ratio.pow(0.05);
                return cap.times(capped);
            }, effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        24: {
            title: "09", description: "p点获取*p点^0.05", cost: new Decimal(1e20),
            unlocked() { return hasUpgrade('p', 23) },
            effect() {
                let base = player.p.points.add(1);
                let raw = base.pow(0.05);
                let cap = new Decimal("1e38");
                if (raw.lte(cap)) return raw;
                let ratio = raw.div(cap);
                let capped = ratio.pow(0.025);
                return cap.times(capped);
            }, effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        25: {
            title: "10", description: "点数获取*p点^0.125", cost: new Decimal(1e25),
            unlocked() { return hasUpgrade('p', 24) },
            effect() {
                let base = player.p.points.add(1);
                let raw = base.pow(0.125);
                let cap = new Decimal("1e38");
                if (raw.lte(cap)) return raw;
                let ratio = raw.div(cap);
                let capped = ratio.pow(0.0625);
                return cap.times(capped);
            }, effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        31: {
            title: "多出来的升级?", description: "点数获取*点数^0.05", cost: new Decimal(1e38),
            unlocked() { return hasUpgrade('p', 25) },
            effect() {
                let base = player.points.add(1);
                let raw = base.pow(0.05);
                let cap = new Decimal("1e38");
                if (raw.lte(cap)) return raw;
                let ratio = raw.div(cap);
                let capped = ratio.pow(0.025);
                return cap.times(capped);
            }, effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        32: {
            title: "666又来? 不对!", description: "软上限后点数获取*(1+点数^0.114514/114514)^1.4", cost: new Decimal("1e365"),
            unlocked() { return hasUpgrade('p', 31) && hasUpgrade('sa', 15) },
            effect() {
                let base = player.points.add(1).pow(0.114514).div(114514).add(1)
                let raw = base.pow(1.4);
                let cap = new Decimal("1e38");
                if (raw.lte(cap)) return raw;
                let ratio = raw.div(cap);
                let capped = ratio.pow(0.7);
                return cap.times(capped);
            }, effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        33: {
            title: "更进一歩!", description: "二重软上限后点数获取*(1+lg(点数+1))^ {1.919810+lg(lg(点数+1)+1)}", cost: new Decimal("1e455"),
            unlocked() { return hasUpgrade('p', 32) },
            effect() {
                let base = player.points.add(1).log10().add(1);
                let raw = base.pow(player.points.add(1).log10().add(1).log10().add(1.919810))
                let cap = new Decimal("1e38");
                if (raw.lte(cap)) return raw;
                let ratio = raw.div(cap);
                let capped = ratio.pow(0.91);
                return cap.times(capped);
            }, effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        34: {
            title: "升级18太弱了!", description: "升级18效果^2.88(有神秘小彩蛋哦)", cost: new Decimal("1e465"),
            unlocked() { return hasUpgrade('p', 33) },
        },
        35: {
            title: "可笑的软上限", description: "软上限延迟1e14,弱化软上限1.14514,解锁一个新的LW升级", cost: new Decimal("1e475"),
            unlocked() { return hasUpgrade('p', 34) },
        },
        41: {
            title: "超越界限", description: "基于点数提升P点获取", cost: new Decimal("1e99770"),
            unlocked() { return hasUpgrade('pp', 31); },
            effect() {
                let base = player.points.add(1);
                let raw = base.pow(0.02);
                let cap = new Decimal("1e38");
                if (raw.lte(cap)) return raw;
                let ratio = raw.div(cap);
                let capped = ratio.pow(0.01);
                return cap.times(capped);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x"; },
        },
        42: {
            title: "功率转换", description: "P点获取*(P点+1)^0.01", cost: new Decimal("1e99845"),
            unlocked() { return hasUpgrade('p', 41); },
            effect() {
                let base = player.p.points.add(1);
                let raw = base.pow(0.01);
                let cap = new Decimal("1e38");
                if (raw.lte(cap)) return raw;
                let ratio = raw.div(cap);
                let capped = ratio.pow(0.005);
                return cap.times(capped);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x"; },
        },
        43: {
            title: "软上限溶解", description: "五重软上限弱化2,P点获取*1e81", cost: new Decimal("1e99911"),
            unlocked() { return hasUpgrade('p', 42); },
        },
        44: {
            title: "指数共鸣", description: "前五重软上限弱化1.04", cost: new Decimal("1e100040"),
            unlocked() { return hasUpgrade('p', 43); },
        },
        45: {
            title: "终极增幅-P", description: "点数获取^lg(P 点 + 1)/1e5(不低于1,硬上限为1.5),解锁一个PP挑战", cost: new Decimal("1e100120"),
            unlocked() { return hasUpgrade('p', 44); },
            effect() {
                let exp = Decimal.max(player.p.points.add(1).log10().div(1e5), 1);
                let cap = new Decimal("1.5");
                if (exp.gt(cap)) exp = cap;
                return exp;
            },
            effectDisplay() { return "^" + format(upgradeEffect(this.layer, this.id),4,true); },
        },
    }
})

addLayer("sp", {
    name: "second prestige",
    symbol: "SP",
    position: 0,
    startData() { return { unlocked: false, points: new Decimal(0) } },
    color: "#ffc400",
    requires: new Decimal(100),
    resource: "second prestige points",
    baseResource: "prestige points",
    baseAmount() { return player.p.points },
    type: "normal",
    exponent: function() {
        let exp = new Decimal(0.45);
        if (hasMilestone('sp', 2)) exp = exp.add(0.05);
        if (hasMilestone('sp', 4)) exp = exp.add(0.05);
        if (hasUpgrade('sp', 21)) exp = exp.add(upgradeEffect('sp', 21));
        if (hasUpgrade('sp', 32)) exp = exp.add(upgradeEffect('sp', 32));
        return exp;
    },
    milestonePopups: false,
    milestones: {
        0: { requirementDescription: "1 SP点", effectDescription: "点数获取速度*2", done() { return player.sp.points.gte(1) } },
        1: { requirementDescription: "5 SP点", effectDescription: "P点获取速度*1.2", done() { return player.sp.points.gte(5) } },
        2: { requirementDescription: "25 SP点", effectDescription: "点数获取速度*5,SP点获取指数+0.05", done() { return player.sp.points.gte(25) } },
        3: { requirementDescription: "1000 SP点", effectDescription: "进行SP重置不重置P升级", done() { return player.sp.points.gte(1000) } },
        4: { requirementDescription: "10000 SP点", effectDescription: "P点获取速度*1.5,SP点获取指数+0.05", done() { return player.sp.points.gte(10000) } },
        5: { requirementDescription: "1e6 SP点", effectDescription: "点数和P点获取*10", done() { return player.sp.points.gte(1e6) }, style: {"color": "#ff9900", "border": "2px solid #ff9900"} },
    },
    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade('p', 15)) mult = mult.times(upgradeEffect('p', 15))
        if (hasUpgrade('a', 11)) mult = mult.times(upgradeEffect('a', 11))
        if (hasUpgrade('a', 13)) mult = mult.times(upgradeEffect('a', 13))
        if (hasUpgrade('sp', 22)) mult = mult.times(upgradeEffect('sp', 22))
        if (hasUpgrade('sp', 13)) mult = mult.times(upgradeEffect('sp', 13))
        if (hasUpgrade('lw', 12)) mult = mult.times(upgradeEffect('lw', 12))
        if (hasUpgrade('tp', 11)) mult = mult.times(upgradeEffect('tp', 11));
        if (hasChallenge('pp', 12)) mult = mult.times(1e38);
        if (hasMilestone('tp', 1)) mult = mult.times(1e10);
        return mult
    },
    gainExp() { return new Decimal(1) },
    passiveGeneration: function() {
        let passiveGeneration = 0;
        if (hasUpgrade('a', 24)) passiveGeneration = passiveGeneration+0.01;
        if (hasUpgrade('a', 25)) passiveGeneration = passiveGeneration+0.99;
        if (hasUpgrade('lw', 11)) passiveGeneration = passiveGeneration+1.5;
        if (hasUpgrade('lw', 14)) passiveGeneration = passiveGeneration+7.5;
        return passiveGeneration;
    },
    row: 1,
    hotkeys: [{key: "s", description: "S: Reset for second prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}}],
    layerShown() { return player.p.points.gte(100) || player.sp.points.gte(1) || hasUpgrade('sp', 11) },
    autoUpgrade: function() { return hasMilestone('ach', 0); },
    tabFormat: {
    "Upgrades": { content: ["main-display", "prestige-button", "blank", "upgrades"] },
    "Milestones": { content: ["main-display", "prestige-button", "blank", "milestones"] },
    "Buyables": { content: ["main-display", "prestige-button", "blank", "buyables"] },
},
buyables: {
    11: {
        title: "SP 凝聚器",
        cost(x) {
            if (x.eq(0)) return new Decimal(1);
            return Decimal.pow(1.5, x.pow(1.1)).floor();
        },
        effect(x) {
            if (x.eq(0)) return new Decimal(1);
            return Decimal.pow(x.add(1), 2);
        },
        display() {
            let x = player[this.layer].buyables[this.id] || new Decimal(0);
            let cost = tmp[this.layer].buyables[this.id]?.cost || new Decimal(0);
            let eff = tmp[this.layer].buyables[this.id]?.effect || new Decimal(1);
            return `花费: ${format(cost)} SP 点\n已购买: ${formatWhole(x)}\n效果: SP 点获取 ×${format(eff)}`;
        },
        canAfford() {
            let cost = tmp[this.layer].buyables[this.id]?.cost;
            return cost !== undefined && player[this.layer].points.gte(cost);
        },
        buy() {
            let x = player[this.layer].buyables[this.id] || new Decimal(0);
            let cost = tmp[this.layer].buyables[this.id].cost;
            player[this.layer].points = player[this.layer].points.sub(cost);
            player[this.layer].buyables[this.id] = x.add(1);
            updateTemp();
        },
        unlocked() { return hasUpgrade('sp', 55); },
    },
},
    upgrades: {
        11: {
            title: "11", description: "双倍p点获取,基于你的sp点小幅度提升点数获取", cost: new Decimal(1),
            effect() {
                let base = player.sp.points.add(1);
                let raw = base.pow(0.3);
                let cap = new Decimal("1e38");
                if (raw.lte(cap)) return raw;
                let ratio = raw.div(cap);
                let capped = ratio.pow(new Decimal(0.5).div((player.sp.points.add(1).log10().add(1).log10().add(1))));
                return cap.times(capped);
            }, effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        12: {
            title: "12", description: "基于你的sp点提升P点获取", cost: new Decimal(25), unlocked() { return hasUpgrade('sp', 11) },
            effect() {
                let base = player.sp.points.add(1);
                let raw = base.pow(0.35);
                let cap = new Decimal("1e38");
                if (raw.lte(cap)) return raw;
                let ratio = base.div(cap);
                let capped = ratio.pow(new Decimal(0.13).div((player.sp.points.add(1).log10().add(1).log10().add(1))));
                return cap.times(capped);
            }, effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        13: {
            title: "13", description: "基于你的sp点提升sp点获取", cost: new Decimal(1e9), unlocked() { return hasUpgrade('sp', 12) },
            effect() {
                let base = player.sp.points.add(1);
                let raw = base.pow(0.25);
                let cap = new Decimal("1e38");
                if (raw.lte(cap)) return raw;
                let ratio = raw.div(cap);
                let capped = ratio.pow(new Decimal(0.5).div((player.sp.points.add(1).log10().add(1).log10().add(1))));
                return cap.times(capped);
            }, effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        14: {
            title: "14", description: "基于你的sp点提升点数获取", cost: new Decimal(1e15), unlocked() { return hasUpgrade('sp', 13) },
            effect() {
                let base = player.sp.points.add(1);
                let raw = base.pow(0.33);
                let cap = new Decimal("1e38");
                if (raw.lte(cap)) return raw;
                let ratio = raw.div(cap);
                let capped = ratio.pow(new Decimal(0.66).div((player.sp.points.add(1).log10().add(1).log10().add(1))));
                return cap.times(capped);
            }, effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        15: {
            title: "15", description: "基于你的sp点提升点数获取", cost: new Decimal(1e38), unlocked() { return hasUpgrade('sp', 14) },
            effect() {
                let base = player.sp.points.add(1);
                let raw = base.pow(0.25);
                let cap = new Decimal("1e38");
                if (raw.lte(cap)) return raw;
                let ratio = raw.div(cap);
                let capped = ratio.pow(new Decimal(0.5).div((player.sp.points.add(1).log10().add(1).log10().add(1))));
                return cap.times(capped);
            }, effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        21: {
            title: "16", description: "基于你的sp点提升sp点获取指数(硬上限为+0.75)", cost: new Decimal(1e100), unlocked() { return hasUpgrade('sp', 15); },
            effect() {
                let base = player.sp.points.add(1);
                let powResult = base.pow(0.0001);
                let raw = powResult.sub(1);
                let cap = new Decimal("0.5");
                if (raw.lte(cap)) return raw;
                let power = new Decimal(0.0005).div((player.sp.points.add(1).log10().add(1).log10().add(1)));
                let capped = Decimal.min(cap.times(raw.div(cap).pow(power)), 0.75);
                return capped;
            },
            effectDisplay() { return "+" + format(upgradeEffect(this.layer, this.id)); },
        },
        22: {
            title: "17", description: "基于你的点数提升sp点获取", cost: new Decimal(1e120), unlocked() { return hasUpgrade('sp', 21) },
            effect() {
                let base = player.points.add(1);
                let raw = base.pow(0.044);
                let cap = new Decimal("1e38");
                if (raw.lte(cap)) return raw;
                let ratio = raw.div(cap);
                let capped = ratio.pow(0.022);
                return cap.times(capped);
            }, effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        23: {
            title: "18", description: "基于你的sp点提升amplifier获取", cost: new Decimal(1e150), unlocked() { return hasUpgrade('sp', 22) },
            effect() {
                let base = player.sp.points.add(1);
                let raw = base.pow(0.0066);
                if (hasUpgrade('p', 34)) raw = raw.pow(2.88);
                if (hasChallenge('pp', 11)) raw = raw.pow(5);
                let cap = new Decimal("1e38");
                if (raw.lte(cap)) return raw;
                let ratio = raw.div(cap);
                let capped = ratio.pow(0.0033);
                if (hasUpgrade('p', 34)) capped = capped.pow(1.44);
                if (hasChallenge('pp', 11)) capped = capped.pow(2.5);
                return cap.times(capped);
            }, effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        24: {
            title: "19", description: "软上限再弱化1.05", cost: new Decimal(1e175), unlocked() { return hasUpgrade('sp', 23) },
        },
        25: {
            title: "20", description: "软上限再弱化1.05", cost: new Decimal(1e180), unlocked() { return hasUpgrade('sp', 24) },
        },
        31: {
            title: "666还有第二关", description: "软上限再弱化1.05", cost: new Decimal(1e200), unlocked() { return hasUpgrade('sp', 25) },
        },
        32: {
            title: "!?强?!", description: "基于你的SP点提升SP点获取指数(硬上限为+0.3)", cost: new Decimal("1e600"), unlocked() { return hasUpgrade('sp', 31) && hasUpgrade('lw', 15) },
            effect() {
                let safePoints = player.sp.points.max(1);
                let base = safePoints.add(1).log10().div(1000).add(1);
                let powResult = base.pow(0.066);
                let raw = powResult.add(-1);
                let cap = new Decimal("0.15");
                if (raw.lte(cap)) return raw;
                let power = new Decimal(0.0005).div((player.sp.points.add(1).log10().add(1).log10().add(1)));
                let capped = Decimal.min(cap.times(raw.div(cap).pow(power)), 0.3);
                return capped;
            }, effectDisplay() { return "+" + format(upgradeEffect(this.layer, this.id)) },
        },
        33: {
            title: "666还有第三关", description: "基于你的SP点提升P点获取指数(硬上限为+0.88)", cost: new Decimal("6.66e666"), unlocked() { return hasUpgrade('sp', 32) },
            effect() {
                let safePoints = player.sp.points.max(1);
                let base = safePoints.add(1).log10().div(666).add(1);
                let powResult = base.pow(0.15);
                let raw = powResult.add(-1);
                let cap = new Decimal("0.66");
                if (raw.lte(cap)) return raw;
                let power = new Decimal(0.0005).div((player.sp.points.add(1).log10().add(1).log10().add(1)));
                let capped = Decimal.min(cap.times(raw.div(cap).pow(power)), 0.88);
                return capped;
            }, effectDisplay() { return "+" + format(upgradeEffect(this.layer, this.id)) },
        },
        34: {
            title: "我勒个高考750分", description: "基于你的SP点提升Amplifier获取指数(硬上限为+0.33)", cost: new Decimal("1e750"), unlocked() { return hasUpgrade('sp', 33) },
            effect() {
                let safePoints = player.sp.points.max(1);
                let base = safePoints.add(1).log10().div(444).add(1);
                let powResult = base.pow(0.066);
                let raw = powResult.add(-1);
                let cap = new Decimal("0.17");
                if (raw.lte(cap)) return raw;
                let power = new Decimal(0.00005).div((player.sp.points.add(1).log10().add(1).log10().add(1)));
                let capped = Decimal.min(cap.times(raw.div(cap).pow(power)), 0.33);
                return capped;
            }, effectDisplay() { return "+" + format(upgradeEffect(this.layer, this.id)) },
        },
        35: {
            title: "千禧之刻", description: "二重软上限延迟lg(前两行点数+1)之积,二重软上限后点数获取*1000,解锁一个新的RE升级", cost: new Decimal("1e1000"), unlocked() { return hasUpgrade('sp', 34) },
            effect() {
                let safePointsp = player.p.points.max(1);
                let safePointssp = player.sp.points.max(1);
                let safePointsa = player.a.points.max(1);
                let basep = safePointsp.add(1).log10();
                let basesp = safePointssp.add(1).log10();
                let basea = safePointsa.add(1).log10();
                let raw = basep.times(basesp).times(basea);
                if (hasChallenge('pp', 11)) raw = raw.pow(10);
                let cap = new Decimal("1e9");
                if (raw.lte(cap)) return raw;
                let ratio = raw.sub(cap);
                let capped = ratio.pow(0.99);
                return cap.add(capped);
            }, effectDisplay() { return "*" + format(upgradeEffect(this.layer, this.id)) },
        },
    },
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
    exponent: function() {
        let exp = new Decimal(0.025);
        if (hasUpgrade('p', 22)) exp = exp.add(0.03);
        if (hasUpgrade('sp', 34)) exp = exp.add(upgradeEffect('sp', 34));
        return exp;
    },
    milestonePopups: false,
    milestones: {
        0: { requirementDescription: "1 amplifier", effectDescription: "点数获取速度×25", done() { return player.a.points.gte(1) } },
    },
    autoUpgrade: function() { return hasMilestone('ach', 0); },
    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade('sp', 23)) mult = mult.times(upgradeEffect('sp', 23))
        if (hasUpgrade('re', 12)) mult = mult.times(upgradeEffect('re', 12))
        if (hasUpgrade('a', 34)) mult = mult.times((upgradeEffect('a', 34)).add(1).log10().add(1).pow(1.44))
        if (hasUpgrade('tp', 11)) mult = mult.times(upgradeEffect('tp', 11));
        if (hasMilestone('tp', 2)) mult = mult.times(1e5);
        if (hasChallenge('pp', 12)) mult = mult.times(1e9);
        return mult
    },
    gainExp() { return new Decimal(1) },
    row: 1,
    hotkeys: [{key: "a", description: "A: Reset for amplifier", onPress(){if (canReset(this.layer)) doReset(this.layer)}}],
    layerShown() { return player.p.points.gte(1e6) || player.a.points.gte(1) || hasUpgrade('a', 11) },
    passiveGeneration: function() {
        let passiveGeneration = 0;
        if (hasUpgrade('re', 11)) passiveGeneration = passiveGeneration+0.01;
        if (hasUpgrade('re', 14)) passiveGeneration = passiveGeneration+9.99;
        return passiveGeneration;
    },
    tabFormat: {
        "Upgrades": { content: ["main-display", "prestige-button", "blank", "upgrades"] },
        "Milestones": { content: ["main-display", "prestige-button", "blank", "milestones"] },
    },
    upgrades: {
        11: {
            title: "21", description: "基于你的amplifier提升点数,P点,sp点获取(加成不低于10)", cost: new Decimal(1),
            effect() {
                let base = player.a.points.add(1).times(10);
                let buyableEff = tmp.tp.buyables?.[11]?.effect ?? new Decimal(1);
                let raw = base.pow(buyableEff);
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
        12: {
            title: "22", description: "P点获取公式指数x1.01", cost: new Decimal(5), unlocked() { return hasUpgrade('a', 11) },
        },
        13: {
            title: "23", description: "基于你的amplifier提升sp点获取(加成不低于10)", cost: new Decimal(10000000), unlocked() { return hasUpgrade('a', 12) },
            effect() {
                let base = player.a.points.add(100);
                let raw = base.pow(0.66);
                let cap = new Decimal("1e38");
                if (raw.lte(cap)) return raw;
                let ratio = raw.div(cap);
                let capped = ratio.pow(0.33);
                return cap.times(capped);
            }, effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        14: {
            title: "24", description: "每秒获得重置时P点的1%", cost: new Decimal(1e9), unlocked() { return hasUpgrade('a', 13) },
        },
        15: {
            title: "25", description: "进行A重置不重置P升级", cost: new Decimal(1e10), unlocked() { return hasUpgrade('a', 14) },
        },
        21: {
            title: "26", description: "软上限弱化1.05", cost: new Decimal(1e12), unlocked() { return hasUpgrade('a', 15) },
        },
        22: {
            title: "27", description: "每秒再获得重置时P点的9%", cost: new Decimal(1e13), unlocked() { return hasUpgrade('a', 21) },
        },
        23: {
            title: "28", description: "每秒再获得重置时P点的90%", cost: new Decimal(1e14), unlocked() { return hasUpgrade('a', 22) },
        },
        24: {
            title: "29", description: "每秒获得重置时SP点的1%", cost: new Decimal(1e15), unlocked() { return hasUpgrade('a', 23) },
        },
        25: {
            title: "30", description: "每秒获得重置时SP点的99%", cost: new Decimal(1e16), unlocked() { return hasUpgrade('a', 24) },
        },
        31: {
            title: "我感受到了...", description: "软上限再弱化1.05", cost: new Decimal(1e17), unlocked() { return hasUpgrade('a', 25) && hasUpgrade('sp', 31) },
        },
        32: {
            title: "这是...?", description: "点数获取*1e9", cost: new Decimal(1e18), unlocked() { return hasUpgrade('a', 31) },
        },
        33: {
            title: "三相之力?", description: "软上限再弱化1.05,点数获取*1e9", cost: new Decimal(2.5e18), unlocked() { return hasUpgrade('a', 32) },
        },
        34: {
            title: "1e288", description: "点数获取*lg(点数+1)^2.88,amplifier获取*lg(lg(点数+1)^2.88+1)^1.44", cost: new Decimal(1e288), unlocked() { return hasUpgrade('a', 33) && hasUpgrade('re', 15) },
            effect() {
                let base = player.points.add(1).log10().add(1);
                let raw = base.pow(2.88)
                let cap = new Decimal("1e38");
                if (hasUpgrade('tp', 15)) raw = raw.pow(2.026);
                if (raw.lte(cap)) return raw;
                let ratio = raw.div(cap);
                let capped = ratio.pow(1.88);
                return cap.times(capped);
            }, effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x"+","+((upgradeEffect(this.layer, this.id).add(1).log10().add(1).pow(1.44))+"x" )},
        },
        35: {
            title: "新的层级?", description: "解锁新的层级", cost: new Decimal(1.79e308), unlocked() { return hasUpgrade('a', 34) },
        },
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
    exponent: function() { return new Decimal(0.01); },
    autoUpgrade: function() { return hasUpgrade('pp', 13); },
    milestonePopups: false,
    passiveGeneration: function() {
        let passiveGeneration = 0;
        if (hasMilestone('pp', 0)) passiveGeneration = passiveGeneration+0.001;
        if (hasMilestone('pp', 1)) passiveGeneration = passiveGeneration+0.009;
        return passiveGeneration;
    },
    milestones: {
        0: { requirementDescription: "1 Law Weaving", effectDescription: "点数获取速度*100", done() { return player.lw.points.gte(1) } },
        1: { requirementDescription: "3 law Weaving", effectDescription: "lw重置时不重置SP层升级", done() { return player.lw.points.gte(3) } },
    },
    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade('lw', 14)) mult = mult.times(upgradeEffect('lw', 14));
        if (hasUpgrade('tp', 11)) mult = mult.times(upgradeEffect('tp', 11));
        return mult
    },
    gainExp() { return new Decimal(1) },
    row: 2,
    hotkeys: [],
    layerShown() { return hasUpgrade('a', 33) || player.lw.points.gte(1) || hasUpgrade('lw', 11) },
    tabFormat: {
        "Upgrades": { content: ["main-display", "prestige-button", "blank", "upgrades"] },
        "Milestones": { content: ["main-display", "prestige-button", "blank", "milestones"] },
    },
    upgrades: {
        11: { title: "始", description: "每秒再获得重置时SP点的150%", cost: new Decimal(1) },
        12: {
            title: "破限", description: "基于lw提升SP点获取(不低于100),软上限弱化1.05,二重软上限弱化1.05.", cost: new Decimal(1), unlocked() { return hasUpgrade('lw', 11) },
            effect() {
                let base = player.lw.points.add(10);
                let raw = base.pow(2);
                let cap = new Decimal("1e38");
                if (raw.lte(cap)) return raw;
                let ratio = raw.div(cap);
                let capped = ratio.pow(new Decimal(0.78).div((player.lw.points.add(1).log10().add(1).log10().add(1))));
                return cap.times(capped);
            }, effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        13: { title: "软上限有什么用？", description: "软上限延迟1e9", cost: new Decimal(5), unlocked() { return hasUpgrade('lw', 12) }, effect() {} },
        14: {
            title: "开始膨胀", description: "自我增幅,每秒再获得重置时SP点的750%", cost: new Decimal(10), unlocked() { return hasUpgrade('lw', 13) },
            effect() {
                let base = player.lw.points.add(1);
                let raw = base.pow(1);
                let cap = new Decimal("1e38");
                if (raw.lte(cap)) return raw;
                let ratio = raw.div(cap);
                let capped = ratio.pow(new Decimal(0.13).div((player.lw.points.add(1).log10().add(1).log10().add(1))));
                return cap.times(capped);
            }, effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        15: { title: "更多...", description: "lw重置时不重置前两行,解锁更多sp层升级", cost: new Decimal(1e20), unlocked() { return hasUpgrade('lw', 14) && hasUpgrade('sa', 15) && hasUpgrade('p', 35) }, effect() {} },
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
    exponent: function() { return new Decimal(0.01); },
    autoUpgrade: function() { return hasUpgrade('pp', 13); },
    milestonePopups: false,
    passiveGeneration: function() {
        let passiveGeneration = 0;
        if (hasMilestone('pp', 0)) passiveGeneration = passiveGeneration+0.001;
        if (hasMilestone('pp', 1)) passiveGeneration = passiveGeneration+0.009;
        return passiveGeneration;
    },
    milestones: {
        0: { requirementDescription: "1 Source Amplification", effectDescription: "点数获取速度*100", done() { return player.sa.points.gte(1) } },
        1: { requirementDescription: "3 Source Amplification", effectDescription: "sa重置时不重置P层升级", done() { return player.sa.points.gte(3) } },
    },
    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade('sa', 14)) mult = mult.times(upgradeEffect('sa', 14));
        if (hasUpgrade('tp', 11)) mult = mult.times(upgradeEffect('tp', 11));
        return mult
    },
    gainExp() { return new Decimal(1) },
    row: 2,
    hotkeys: [],
    layerShown() { return hasUpgrade('a', 73) || player.sa.points.gte(1) || hasUpgrade('sa', 11) },
    tabFormat: {
        "Upgrades": { content: ["main-display", "prestige-button", "blank", "upgrades"] },
        "Milestones": { content: ["main-display", "prestige-button", "blank", "milestones"] },
    },
    upgrades: {
        11: { title: "始", description: "每秒再获得重置时P点的900%", cost: new Decimal(1) },
        12: {
            title: "破限", description: "基于sa提升P点获取(不低于1e4),软上限弱化1.05,二重软上限弱化1.05", cost: new Decimal(1), unlocked() { return hasUpgrade('sa', 11) },
            effect() {
                let base = player.sa.points.add(100);
                let raw = base.pow(2);
                let cap = new Decimal("1e38");
                if (raw.lte(cap)) return raw;
                let ratio = raw.div(cap);
                let capped = ratio.pow(new Decimal(0.78).div((player.sa.points.add(1).log10().add(1).log10().add(1))));
                return cap.times(capped);
            }, effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        13: { title: "软上限有什么用？", description: "软上限延迟1e9", cost: new Decimal(5), unlocked() { return hasUpgrade('sa', 12) }, effect() {} },
        14: {
            title: "开始膨胀", description: "自我增幅,弱化并延迟二重软上限(1.01,10)", cost: new Decimal(10), unlocked() { return hasUpgrade('sa', 13) },
            effect() {
                let base = player.sa.points.add(1);
                let raw = base.pow(1);
                let cap = new Decimal("1e38");
                if (raw.lte(cap)) return raw;
                let ratio = raw.div(cap);
                let capped = ratio.pow(new Decimal(0.13).div((player.sa.points.add(1).log10().add(1).log10().add(1))));
                return cap.times(capped);
            }, effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        15: { title: "更多...", description: "sa重置时不重置前两行,解锁更多p层升级", cost: new Decimal(1e9), unlocked() { return hasUpgrade('sa', 14) }, effect() {} },
    }
})

addLayer("re", {
    name: "Recursive Echo",
    symbol: "RE",
    position: 0,
    startData() { return { unlocked: false, points: new Decimal(0) } },
    color: "rgba(0, 89, 255, 1)",
    requires: new Decimal(1e308),
    resource: "Recursive Echo",
    baseResource: "points",
    baseAmount() { return player.points },
    type: "normal",
    exponent: function() { return new Decimal(0.01); },
    milestonePopups: false,
    autoUpgrade: function() { return hasUpgrade('pp', 13); },
    milestones: {
        0: { requirementDescription: "1 Recursive Echo", effectDescription: "点数获取速度*100", done() { return player.re.points.gte(1) } },
        1: { requirementDescription: "3 Recursive Echo", effectDescription: "re重置时不重置Amplifier层升级", done() { return player.re.points.gte(3) } },
    },
    passiveGeneration: function() {
        let passiveGeneration = 0;
        if (hasMilestone('pp', 0)) passiveGeneration = passiveGeneration+0.001;
        if (hasMilestone('pp', 1)) passiveGeneration = passiveGeneration+0.009;
        return passiveGeneration;
    },
    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade('re', 14)) mult = mult.times(upgradeEffect('re', 14));
        if (hasUpgrade('tp', 11)) mult = mult.times(upgradeEffect('tp', 11));
        return mult
    },
    gainExp() { return new Decimal(1) },
    row: 2,
    hotkeys: [],
    layerShown() { return hasUpgrade('a', 33) || player.re.points.gte(1) || hasUpgrade('re', 11) },
    tabFormat: {
        "Upgrades": { content: ["main-display", "prestige-button", "blank", "upgrades"] },
        "Milestones": { content: ["main-display", "prestige-button", "blank", "milestones"] },
    },
    upgrades: {
        11: { title: "始", description: "每秒获得重置时Amplifier的1%", cost: new Decimal(1) },
        12: {
            title: "破限", description: "基于re提升amplifier获取(不低于100),软上限弱化1.05,二重软上限弱化1.05", cost: new Decimal(1), unlocked() { return hasUpgrade('re', 11) },
            effect() {
                let base = player.re.points.add(10);
                let raw = base.pow(2);
                let cap = new Decimal("1e38");
                if (raw.lte(cap)) return raw;
                let ratio = raw.div(cap);
                let capped = ratio.pow(new Decimal(0.78).div((player.re.points.add(1).log10().add(1).log10().add(1))));
                return cap.times(capped);
            }, effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        13: { title: "软上限有什么用？", description: "软上限延迟1e9", cost: new Decimal(5), unlocked() { return hasUpgrade('re', 12) }, effect() {} },
        14: {
            title: "开始膨胀", description: "自我增幅,每秒再获得重置时Amplifier的999%", cost: new Decimal(10), unlocked() { return hasUpgrade('re', 13) },
            effect() {
                let base = player.re.points.add(1);
                let raw = base.pow(1);
                let cap = new Decimal("1e38");
                if (raw.lte(cap)) return raw;
                let ratio = raw.div(cap);
                let capped = ratio.pow(new Decimal(0.13).div((player.re.points.add(1).log10().add(1).log10().add(1))));
                return cap.times(capped);
            }, effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        15: { title: "更多...", description: "re重置时不重置前两行,解锁更多a层升级", cost: new Decimal(1e40), unlocked() { return hasUpgrade('re', 14) && hasUpgrade('sa', 15) && hasUpgrade('lw', 15) && hasUpgrade('sp', 35) }, effect() {} },
    }
})

addLayer("tp", {
    name: "Time Points",
    symbol: "TP",
    position: 0,
    startData() { return { unlocked: false, points: new Decimal(0), timesPower: new Decimal(0) }; },
    color: "rgba(255, 0, 221, 1)",
    requires: new Decimal("1e1000"),
    resource: "Time points",
    baseResource: "points",
    baseAmount() { return player.points },
    type: "normal",
    exponent: function() { return new Decimal(0.012345); },
    milestonePopups: false,
    milestones: {
        0: { requirementDescription: "1 tp", effectDescription: "P点获取*1e20", done() { return player.tp.points.gte(1) } },
        1: { requirementDescription: "3 tp", effectDescription: "SP点获取*1e10", done() { return player.tp.points.gte(3) } },
        2: { requirementDescription: "5 tp", effectDescription: "A获取*1e5", done() { return player.tp.points.gte(5) } },
    },
    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade('tp', 13)) mult = mult.times(upgradeEffect('tp', 13));
        if (player.timesPower && player.timesPower instanceof Decimal) {
            let timesPowerBonus = player.timesPower.add(1).pow(1.3);
            mult = mult.times(timesPowerBonus);
        }
        return mult
    },
    gainExp() { return new Decimal(1) },
    row: 3,
    hotkeys: [{ key: "T", description: "T: Reset for Time Points", onPress(){ if (canReset(this.layer)) doReset(this.layer) } }],
    layerShown() { return hasUpgrade('a', 35) || player.tp.points.gte(1) || hasUpgrade('tp', 11) },
    update(diff) {
        if (!(player.timesPower instanceof Decimal)) player.timesPower = new Decimal(player.timesPower || 0);
        if (hasUpgrade('tp', 21)) {
            let tpPoints = player.tp.points;
            let gainpow = new Decimal(1.14514);
            if (hasUpgrade('tp', 22)) gainpow = new Decimal(1.919810);
            let gainPerSecond = tpPoints.add(1).log10().pow(gainpow);
            let gain = gainPerSecond.times(diff);
            if (hasUpgrade('tp', 24)) gain = gain.times(upgradeEffect('tp', 24));
            player.timesPower = player.timesPower.add(gain);
        }
    },
    tabFormat: {
    "Upgrades": {
        content: [
            "main-display",
            "prestige-button",
            "blank",
            ["display-text", function() {
                let tp = player.timesPower || new Decimal(0);
                return `时间之力: ${format(tp)}`;
            }],
            ["display-text", function() {
                return `TP获取倍数: ${format(getTimesPowerMultiplier())}x`;
            }],
            "upgrades"
        ]
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
            title: "时间的力量...", description: "软上限弱化1.25,二重软上限弱化1.25,之前所有资源获取*(TP+10)^2", cost: new Decimal(1),
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
        12: { title: "改变...", description: "三重软上限延迟1e314", cost: new Decimal(1), unlocked() { return hasUpgrade('tp', 11) } },
        13: {
            title: "碎片化...", description: "解锁时间碎片,tp增加tp获取", cost: new Decimal(3), unlocked() { return hasUpgrade('tp', 12) },
            effect() {
                let base = player.tp.points.add(1);
                let raw = base.pow(0.33);
                let cap = new Decimal("1e38");
                if (raw.lte(cap)) return raw;
                let ratio = raw.div(cap);
                let capped = ratio.pow(new Decimal(0.114514).div((player.tp.points.add(1).log10().add(1).log10().add(1))));
                return cap.times(capped);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        14: { title: "时间之晶？", description: "解锁时间之晶,时间碎片效果公式提升至0.52", cost: new Decimal(65536), unlocked() { return hasUpgrade('tp', 13) } },
        15: { title: "时蚀之刻", description: "解锁时蚀之刻,时间碎片效果公式提升至0.66,升级'1e288'效果再^2.026", cost: new Decimal(114514), unlocked() { return hasUpgrade('tp', 14) } },
        21: {
            title: "时间之力", description: "解锁 Times power,自动获得 +[log10(TP+1)]^1.14514/秒,基于(tpr+1)^1.3给TP一个获取倍数", cost: new Decimal(1919810), unlocked() { return hasUpgrade('tp', 15); },
            effectDisplay() {
                let tpPoints = player.tp.points;
                let gainpow = new Decimal(1.14514);
                if (hasUpgrade('tp', 22)) gainpow = new Decimal(1.919810);
                let gainPerSec = tpPoints.add(1).log10().pow(gainpow);
                if (hasUpgrade('tp', 24)) gainPerSec = gainPerSec.times(upgradeEffect('tp', 24));
                return `+${format(gainPerSec)}/s`;
            }
        },
        22: { title: "优化时间", description: "优化Tpr自动获得指数为1.919810", cost: new Decimal(1e9), unlocked() { return hasUpgrade('tp', 21); } },
        23: { title: "时间浮动", description: "优化Tpr效果指数为2.026", cost: new Decimal(1e16), unlocked() { return hasUpgrade('tp', 22); } },
        24: {
            title: "时间扭曲", description: "Tpr自动获得*(tpr+1)^0.1919810", cost: new Decimal(1e25), unlocked() { return hasUpgrade('tp', 23); },
            effect() {
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
            title: "时间侵蚀", description: "软上限(一重、二重、三重、四重)指数分别乘以1.02,1.03,1.04,1.05,至1e7000points解锁新内容", cost: new Decimal(1e36), unlocked() { return hasUpgrade('tp', 24); },
        },
    },
    buyables: {
        11: {
            title: "时间碎片", unlocked() { return hasUpgrade('tp', 13); },
            cost(x) { if (x.eq(0)) return new Decimal(1); let base = Decimal.pow(x.pow(2), x).floor(); let discount = getTimeCrystalDiscount(); return base.times(discount).max(1); },
            effect(x) {
                if (x.eq(0)) return new Decimal(1);
                let exp;
                if (hasUpgrade('tp', 15)) exp = 0.66;
                else if (hasUpgrade('tp', 14)) exp = 0.52;
                else exp = 0.5;
                let raw = x.pow(exp).div(10).add(1);
                if (raw.gt(1)) return raw.sqrt();
                return raw;
            },
            display() {
                let x = player[this.layer].buyables[this.id] || new Decimal(0);
                let cost = tmp[this.layer].buyables[this.id]?.cost || new Decimal(0);
                let eff = tmp[this.layer].buyables[this.id]?.effect || new Decimal(1);
                let limit = getTimeFragmentBaseLimit();
                return `花费: ${format(cost)} TP\n已购买: ${formatWhole(x)} / ${formatWhole(limit)}\n效果: 升级21效果 ^${format(eff,4,true)}`;
            },
            canAfford() { let cost = tmp[this.layer].buyables[this.id]?.cost; if (!cost) return false; return player[this.layer].points.gte(cost); },
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
            title: "时间之晶", unlocked() { return hasUpgrade('tp', 14); },
            cost(x) { if (x.eq(0)) return new Decimal(4); return Decimal.pow(5, x).floor(); },
            effect(x) { if (x.eq(0)) return new Decimal(1); return Decimal.pow(x.div(114514), x); },
            display() {
                let x = player[this.layer].buyables[this.id] || new Decimal(0);
                let cost = tmp[this.layer].buyables[this.id]?.cost || new Decimal(0);
                let discount = getTimeCrystalDiscount();
                let limitBonus = new Decimal(1.425).pow(getTimeCrystalLimitBonus()).add(1);
                return `花费: ${format(cost)} 时间碎片\n已购买: ${formatWhole(x)} / 4\n效果: 时间碎片成本 x${format(discount, 4, true)}，上限 *${format(limitBonus, 4, true)}`;
            },
            canAfford() { let need = tmp[this.layer].buyables[this.id]?.cost; if (!need) return false; let have = player[this.layer].buyables[11] || new Decimal(0); return have.gte(need); },
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
            title: "时蚀之刻", unlocked() { return hasUpgrade('tp', 15); },
            cost(x) { if (x.eq(0)) return new Decimal(1); return Decimal.pow(2, x).floor(); },
            effect(x) { if (x.eq(0)) return new Decimal(1); return Decimal.pow(1.05, x); },
            display() {
                let x = player[this.layer].buyables[this.id] || new Decimal(0);
                let cost = tmp[this.layer].buyables[this.id]?.cost || new Decimal(0);
                let factor1 = getEclipseMultiplier(1);
                let factor2 = getEclipseMultiplier(2);
                let factor3 = getEclipseMultiplier(3);
                return `花费: ${format(cost)} 时间碎片\n已购买: ${formatWhole(x)} / 10\n效果: 一重软上限指数 *${format(factor1, 4, true)}\n      二重软上限指数 *${format(factor2, 4, true)}\n      三重软上限指数 *${format(factor3, 4, true)}`;
            },
            canAfford() { let need = tmp[this.layer].buyables[this.id]?.cost; if (!need) return false; let have = player[this.layer].buyables[11] || new Decimal(0); return have.gte(need); },
            buy() {
                let x = player[this.layer].buyables[this.id] || new Decimal(0);
                if (x.gte(10)) return;
                let cost = tmp[this.layer].buyables[this.id].cost;
                player[this.layer].buyables[11] = player[this.layer].buyables[11].sub(cost);
                player[this.layer].buyables[this.id] = x.add(1);
                updateTemp();
            },
            purchaseLimit: 10,
        }
    },
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
        };
    },
    color: "#fd6868ff",
    requires: new Decimal("1e7000"),
    resource: "PP 点",
    baseResource: "points",
    baseAmount() { return player.points; },
    type: "normal",
    getResetGain() {
        let currentPP = player.pp.points;
        let maxPoints = player.pp.bestPoints.max(player.points);
        let cap = maxPoints.add(1).log10();
        let rawGain = player.points.add(1).log10();
        let gain = rawGain.sub(currentPP).max(0);
        if (currentPP.add(gain).gt(cap)) gain = cap.sub(currentPP).max(0);
        return gain.floor().max(0);
    },
    exponent: function() { return new Decimal(1); },
    gainMult() { return new Decimal(1); },
    gainExp() { return new Decimal(1); },
    row: 4,
    hotkeys: [{ key: "P", description: "P: Reset for PP points", onPress(){ if(canReset(this.layer)) doReset(this.layer); } }],
    layerShown() { return player.points.gte("1e7000") || player.pp?.points?.gte(1); },
    update(diff) {
        if (hasUpgrade('pp', 15)) {
            let ppPoints = player.pp.points;
            let base = Decimal.max(ppPoints.div(1e6), new Decimal(1).div(1e6));
            let mult = new Decimal(1);
            if (hasUpgrade('pp', 22)) mult = mult.times(4);
            if (hasUpgrade('pp', 23)) mult = mult.times(8);
            if (hasChallenge('pp', 11)) mult = mult.times(player.points.add(10).log10().pow(0.2));
            if (hasChallenge('pp', 12)) mult = mult.times(player.pp.pointsPower.add(10).log10().pow(0.19).times(2));
            let exp = new Decimal(1);
            let gainPerSecond = base.times(mult).pow(exp);
            let gain = gainPerSecond.times(diff);
            player.pp.pointsPower = player.pp.pointsPower.add(gain);
            if (!tmp.pp) tmp.pp = {};
            tmp.pp.pointsPowerGain = gainPerSecond;
        }
    },
    onPrestige(gain) { player.pp.bestPoints = player.pp.bestPoints.max(player.points); },
    tabFormat: {
        "Upgrades": {
            content: [
                "main-display", "prestige-button", "blank",
                ["display-text", function() {
                    let amt = player.pp.pointsPower;
                    let gain = tmp.pp?.pointsPowerGain || new Decimal(0);
                    return `Points Power: ${format(amt)} (+${format(gain)}/s)`;
                }],
                "blank", "upgrades"
            ]
        },
        "Milestones": { content: ["main-display", "prestige-button", "blank", "milestones"] },
        "Challenges": { content: ["main-display", "prestige-button", "blank", "challenges"] }
    },
    upgrades: {
        11: {
            title: "点数指数", description: "每秒点数获取^(pp+1)^ {(1+lg(lg(pp+1)+1))/ (2(lg(pp+1)+10))},先于软上限生效", cost: new Decimal(7000),
            unlocked() { return true; },
            effect() {
                let x = player.pp.points;
                if (x.eq(0)) return new Decimal(1);
                let logX = x.add(1).log10();
                let logLog = logX.add(1).log10();
                let numerator = new Decimal(1).add(logLog);
                let denominator = new Decimal(4).times(logX.add(10));
                let exponent = numerator.div(denominator);
                let y = x.add(1).pow(exponent);
                let cap = new Decimal("9");
                if (y.gt(cap)) y = cap;
                return y;
            },
            effectDisplay() { return "^" + format(upgradeEffect(this.layer, this.id),4,true); }
        },
        12: { title: "指数软化", description: "软上限(三重、四重)指数再分别乘以1.3,1.4", cost: new Decimal(7000), unlocked() { return hasUpgrade('pp', 11); } },
        13: { title: "指数自动", description: "自动购买sa,lw,re层升级", cost: new Decimal(7000), unlocked() { return hasUpgrade('pp', 12); } },
        14: { title: "指数突破", description: "四重软上限延迟至 1e10000", cost: new Decimal(7000), unlocked() { return hasUpgrade('pp', 13); } },
        15: { title: "次级之力", description: "解锁一个挑战,解锁 Points Power 子资源，基于 PP 点自动生成 Points Power。", cost: new Decimal(10000), unlocked() { return hasUpgrade('pp', 14); } },
        21: {
            title: "突破！力量初绽", description: "解锁 Points Power效果I,点数获取^(lg(10+Points Power))^0.05(硬上限为^2)", cost: new Decimal(1),
            currencyDisplayName: "Points Power", currencyInternalName: "pointsPower", currencyLayer: "pp",
            unlocked() { return hasUpgrade('pp', 15); },
            effect() {
                let ppPower = player.pp.pointsPower || new Decimal(0);
                let exp = new Decimal(0.05);
                if (hasUpgrade('pp', 24)) exp = exp.add(0.025);
                let exponent = Decimal.min(Decimal.pow(Decimal.log10(ppPower.add(10)), exp), 2);
                return exponent;
            },
            effectDisplay() {
                let pp = player.pp.pointsPower || new Decimal(0);
                let exp = new Decimal(0.05);
                if (hasUpgrade('pp', 24)) exp = exp.add(0.025);
                let exponent = Decimal.min(Decimal.pow(Decimal.log10(pp.add(10)), exp), 2);
                return `^${format(exponent,4,true)}`;
            },
        },
        22: { title: "力量涌动", description: "Points Power 产量 *4", cost: new Decimal(10), currencyDisplayName: "Points Power", currencyInternalName: "pointsPower", currencyLayer: "pp", unlocked() { return hasUpgrade('pp', 21); } },
        23: { title: "力量共鸣", description: "Points Power产量*8", cost: new Decimal(50), currencyDisplayName: "Points Power", currencyInternalName: "pointsPower", currencyLayer: "pp", unlocked() { return hasUpgrade('pp', 22); } },
        24: { title: "对数解放", description: "Points Power 效果Ⅰ的指数公式中^0.05+0.025", cost: new Decimal(250), currencyDisplayName: "Points Power", currencyInternalName: "pointsPower", currencyLayer: "pp", unlocked() { return hasUpgrade('pp', 23); } },
        25: { title: "软上限抵抗", description: "前四重软上限指数弱化1.04,1.03,1.02,1.01", cost: new Decimal(1250), currencyDisplayName: "Points Power", currencyInternalName: "pointsPower", currencyLayer: "pp", unlocked() { return hasUpgrade('pp', 24); } },
        31: { title: "次元解锁", description: "解锁P层的新东西", cost: new Decimal(10000), currencyDisplayName: "Points Power", currencyInternalName: "pointsPower", currencyLayer: "pp", unlocked() { return hasUpgrade('pp', 25); } },
    },
    milestones: {
        0: { requirementDescription: "7000 PP 点", effectDescription: "每秒获得重置时sa,lw,re的0.1%.", done() { return player.pp.points.gte(7000); } },
        1: { requirementDescription: "10000 PP 点", effectDescription: "每秒再获得重置时sa,lw,re的0.9%.", done() { return player.pp.points.gte(10000); } },
    },
    challenges: {
        11: {
            name: "指数坍缩I", challengeDescription: "你的点数获取速度被压缩为^0.6", goal: new Decimal("1e10000"),
            rewardDescription: function() {
                if (typeof player === 'undefined' || !player || !player.points) return "根据点数增幅Points Power获取";
                return "SP-23效果^5,SP-35效果^10,且根据点数增幅Points Power获取,当前:*" + format(player.points.add(10).log10().pow(0.2));
            },
            onComplete() {},
            unlocked() { return hasUpgrade('pp', 15); }
        },
        12: {
            name: "指数坍缩II", challengeDescription: "你的点数获取速度被压缩为^0.5", goal: new Decimal("1e10000"),
            rewardDescription: function() {
                if (typeof player === 'undefined' || !player || !player.points) return "根据P点增幅Points Power获取";
                let mult = player.p.points.add(10).log10().pow(0.19).times(2);
                return "解锁SP层新内容,P点获取*1e100,SP点获取*1e38,A点获取*1e9,根据P点增幅Points Power获取(不小于2),当前: *" + format(mult);
            },
            onComplete() {},
            unlocked() { return hasUpgrade('p', 45) || player.pp.activeChallenge == 12 || hasChallenge('pp', 12); }
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
        "成就": {
            content: ["main-display", "blank", "achievements"]
        },
        "里程碑": {
            content: ["main-display", "blank", "milestones"]
        },
    },
milestones: {
    0: { requirementDescription: "解放双手I (18成就点)", effectDescription: "永久自动购买P,SP,A层升级", done() { return player.ach.points.gte(18); } },
    },
    achievements: {
        rows: 4,    // 4行，每行6个，共24个成就
        cols: 6,

        // ---------- 第一行（初期） ----------
        11: {
            name: "起点",
            tooltip: "获得10点数 奖励:1成就点。",
            done() { return player.points.gte(10); },
            onComplete() { addPoints("ach", 1); }
        },
        12: {
            name: "P?",
            tooltip: "获得1P点 奖励:1成就点。",
            done() { return player.p.points.gte(1); },
            onComplete() { addPoints("ach", 1); }
        },
        13: {
            name: "一群P",
            tooltip: "获得100P点 奖励:1成就点。",
            done() { return player.p.points.gte(100); },
            onComplete() { addPoints("ach", 1); }
        },
        14: {
            name: "第二声望",
            tooltip: "解锁SP层 奖励:1成就点。",
            done() { return player.sp.unlocked; },
            onComplete() { addPoints("ach", 1); }
        },
        15: {
            name: "百倍SP",
            tooltip: "获得100SP点 奖励:1成就点。",
            done() { return player.sp.points.gte(100); },
            onComplete() { addPoints("ach", 1); }
        },
        16: {
            name: "放大!",
            tooltip: "解锁A层 奖励:1成就点。",
            done() { return player.a.unlocked; },
            onComplete() { addPoints("ach", 1); }
        },

        // ---------- 第二行（中期） ----------
        21: {
            name: "百万P点",
            tooltip: "获得1,000,000P点 奖励:2成就点。",
            done() { return player.p.points.gte(1e6); },
            onComplete() { addPoints("ach", 2); }
        },
        22: {
            name: "天文数字",
            tooltip: "获得1e308点数 奖励:2成就点。",
            done() { return player.points.gte("1e308"); },
            onComplete() { addPoints("ach", 2); }
        },
        23: {
            name: "律令编织",
            tooltip: "解锁LW层 奖励:2成就点。",
            done() { return player.lw.unlocked; },
            onComplete() { addPoints("ach", 2); }
        },
        24: {
            name: "源质增幅",
            tooltip: "解锁SA层 奖励:2成就点。",
            done() { return player.sa.unlocked; },
            onComplete() { addPoints("ach", 2); }
        },
        25: {
            name: "递归回声",
            tooltip: "解锁RE层 奖励:2成就点。",
            done() { return player.re.unlocked; },
            onComplete() { addPoints("ach", 2); }
        },
        26: {
            name: "千指点数",
            tooltip: "获得1e1000点数 奖励:2成就点。",
            done() { return player.points.gte("1e1000"); },
            onComplete() { addPoints("ach", 2); }
        },

        // ---------- 第三行（后期，TP 和 PP 相关） ----------
        31: {
            name: "时间之始",
            tooltip: "解锁TP层 奖励:3成就点。",
            done() { return player.tp.unlocked; },
            onComplete() { addPoints("ach", 3); }
        },
        32: {
            name: "时间之力",
            tooltip: "购买TP升级「时间之力」(TP-21) 奖励:3成就点。",
            done() { return hasUpgrade('tp', 21); },
            onComplete() { addPoints("ach", 3); }
        },
        33: {
            name: "碎片收集者",
            tooltip: "购买10个时间碎片 奖励:3成就点。",
            done() { return (player.tp.buyables[11] || new Decimal(0)).gte(10); },
            onComplete() { addPoints("ach", 3); }
        },
        34: {
            name: "力量初现",
            tooltip: "解锁PP层 奖励:3成就点。",
            done() { return player.pp.unlocked; },
            onComplete() { addPoints("ach", 3); }
        },
        35: {
            name: "万指点数",
            tooltip: "获得1e10000点数 奖励:3成就点。",
            done() { return player.points.gte("1e10000"); },
            onComplete() { addPoints("ach", 3); }
        },
        36: {
            name: "指数坍缩 I",
            tooltip: "完成PP挑战「指数坍缩I」 奖励:3成就点。",
            done() { return hasChallenge('pp', 11); },
            onComplete() { addPoints("ach", 3); }
        },

        // ---------- 第四行（终局） ----------
        41: {
            name: "五重起点",
            tooltip: "获得1e50000点数 奖励:4成就点。",
            done() { return player.points.gte("1e50000"); },
            onComplete() { addPoints("ach", 4); }
        },
        42: {
            name: "力量涌动",
            tooltip: "拥有1e6 Points Power 奖励:4成就点。",
            done() { return player.pp.pointsPower.gte(1e6); },
            onComplete() { addPoints("ach", 4); }
        },
        43: {
            name: "次元破壁",
            tooltip: "购买PP升级「次元解锁」 奖励:4成就点。",
            done() { return hasUpgrade('pp', 31); },
            onComplete() { addPoints("ach", 4); }
        },
        44: {
            name: "自增之力",
            tooltip: "购买30个P层「自增器」 奖励:4成就点。",
            done() { return (player.p.buyables[11] || new Decimal(0)).gte(30); },
            onComplete() { addPoints("ach", 4); }
        },
        45: {
            name: "终极のP",
            tooltip: "购买P层升级「终极增幅-P」 奖励:4成就点。",
            done() { return hasUpgrade('p', 45); },
            onComplete() { addPoints("ach", 4); }
        },
        46: {
            name: "指数坍缩II",
            tooltip: "完成PP挑战「指数坍缩II」 奖励:4成就点。",
            done() { return hasChallenge('pp', 12); },
            onComplete() { addPoints("ach", 4); }
        },
    },

    // 可选的全局效果（每点成就点数提供指数加成）
    effect() {
        return player.ach.points.add(1).pow(player.ach.points.add(1));
    },
    effectDescription() {
        return "成就点数使点数获取*" + format(tmp.ach.effect);
    },
});

const fmt = (v) => {
    let val = typeof v === "function" ? v() : v;
    return val instanceof Decimal ? format(val) : val;
};

const softcapList = [
    { name: "P-12", cap: "1e38" }, { name: "P-13", cap: "1e38" }, { name: "P-14", cap: "1e38" }, { name: "P-15", cap: "1e38" },
    { name: "P-21", cap: "1e38" }, { name: "P-23", cap: "1e38" }, { name: "P-24", cap: "1e38" }, { name: "P-25", cap: "1e38" },
    { name: "P-31", cap: "1e38" }, { name: "P-32", cap: "1e38" }, { name: "P-33", cap: "1e38" }, { name: "P-41", cap: "1e38" },
    { name: "SP-11", cap: "1e38" }, { name: "SP-12", cap: "1e38" }, { name: "SP-13", cap: "1e38" }, { name: "SP-14", cap: "1e38" },
    { name: "SP-15", cap: "1e38" }, { name: "SP-21", cap: "0.50" }, { name: "SP-22", cap: "1e38" }, { name: "SP-23", cap: "1e38" },
    { name: "SP-32", cap: "0.15" }, { name: "SP-33", cap: "0.66" }, { name: "SP-34", cap: "0.17" }, { name: "SP-35", cap: "1e9" },
    { name: "A-11", cap: "1e38" }, { name: "A-13", cap: "1e38" }, { name: "A-34", cap: "1e38" },
    { name: "TP-11", cap: "1e38" }, { name: "TP-13", cap: "1e38" }, { name: "TP-24", cap: "1e38" },
    { name: "PP-11", cap: "9" }, { name: "时间碎片", cap: "2" },
];

addLayer("s", {
    name: "Softcap", symbol: "S", position: 1, row: "side", color: "#cccccc",
    resource: "Softcap", type: "none",
    startData() { return { unlocked: true } },
    layerShown() { return true },
    tabFormat: {
        "软上限统计": {
            content: [
                ["blank"],
                ...softcapList.map(({ name, cap }) => ["display-text", () => `${name} : 软上限开始于 ${fmt(cap)}效果`])
            ],
        },
    },
});