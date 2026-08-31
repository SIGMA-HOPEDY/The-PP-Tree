function effectWithSoftcap(raw, cap, softPower, customCappedPower) {
    if (raw.lte(cap)) return raw;
    let ratio = raw.div(cap);
    let capped = ratio.pow(softPower);
    if (customCappedPower) {
        capped = customCappedPower(capped, ratio);
    }
    return cap.times(capped);
}
function dynamicSoftcap(raw, cap, resourceLayer, basePower, divisorFn) {
    if (raw.lte(cap)) return raw;
    let ratio = raw.div(cap);
    let dynamicPow = basePower.div(divisorFn(player[resourceLayer].points));
    return cap.times(ratio.pow(dynamicPow));
}
function applySoftcap(gain, threshold, baseExponent, upgrades, hintKey, penalty = 1) {
    let exponentBase = new Decimal(baseExponent);
    if (gain.lte(threshold)) {
        if (tmp && tmp.other && hintKey) tmp.other[hintKey] = "";
        return gain;
    }
    let excess = gain.minus(threshold);
    if (excess.lte(0)) return gain;
    let ratio = gain.div(threshold).max(1.0000000001);
    let logGain = ratio.log10();
    let loglogGain = logGain.add(1).log10();
    let exponent = exponentBase.div(new Decimal(9).plus(loglogGain));
    if (upgrades) {
        for (let upg of upgrades) {
            if (upg.cond()) exponent = exponent.times(upg.mult);
        }
    }
    if (penalty !== 1) exponent = exponent.times(penalty);
    if (!exponent.isFinite() || exponent.isNan() || exponent.lte(0)) exponent = new Decimal(0.9);
    let cappedExcess = excess.pow(exponent);
    let result = threshold.plus(cappedExcess);

    // 设置提示文本（新格式）
    if (tmp && tmp.other && hintKey) {
        const names = {
            'softcapHint': '一重软上限',
            'doubleSoftcapHint': '二重软上限',
            'tripleSoftcapHint': '三重软上限',
            'quadrupleSoftcapHint': '四重软上限',
            'quintupleSoftcapHint': '五重软上限',
            'sextupleSoftcapHint': '六重软上限',
            'septupleSoftcapHint': '七重软上限',
            'octupleSoftcapHint': '八重软上限',
            'nonupleSoftcapHint': '九重软上限'
        };
        let name = names[hintKey] || hintKey;
        tmp.other[hintKey] = `${name}:点数获取>${format(threshold, 3, true)}后^${format(exponent, 9, true)}`;
        if (hintKey === 'softcapHint') tmp.other.softcappedPointGen = result;
    }
    return result;
}
function getTimeCrystalDiscount() {
    let eff = tmp.tp?.buyables?.[12]?.effect;
    if (eff && eff.discount) return eff.discount;
    let crystals = player.tp?.buyables?.[12] || new Decimal(0);
    return Decimal.pow(crystals.div(114514), crystals);
}
function getTimeCrystalLimitBonus() {
    let eff = tmp.tp?.buyables?.[12]?.effect;
    if (eff && eff.limit) return eff.limit;
    let crystals = player.tp?.buyables?.[12] || new Decimal(0);
    return new Decimal(1.425).pow(crystals).add(1);
}
function getTimeFragmentBaseLimit() {
    let base = new Decimal(100).times(new Decimal(1.425).pow(getTimeCrystalLimitBonus()).add(1));
    if (hasChallenge('pp', 15)) base = base.times(2);
    return base;
}
function getEclipseCount() {
    return player.tp?.buyables?.[13] || new Decimal(0);
}
function getEclipseMultiplier(level) {
    let cnt = getEclipseCount();
    let base = new Decimal(1 + level / 100);
    if (hasChallenge('pp', 15)) base = base.times(1.000787);
    return Decimal.pow(base, cnt);
}
function getTimesPowerMultiplier() {
    let tp = player.timesPower;
    if (!tp || !(tp instanceof Decimal)) tp = new Decimal(0);
    let tpr = new Decimal(1.3);
    if (hasUpgrade('tp', 23)) tpr = new Decimal(2.026);
    return tp.add(1).pow(tpr);
}
function cleanUpgrades() {
    for (let layer in layers) {
        if (layers[layer].upgrades && player[layer] && player[layer].upgrades) {
            const valid = new Set();
            for (let ten = 1; ten <= 9; ten++) {
                for (let one = 1; one <= 5; one++) {
                    valid.add(ten * 10 + one);
                }
            }
            player[layer].upgrades = player[layer].upgrades.filter(id => valid.has(id));
        }
    }
}
function safeBuyMax(layer, id) {
    if (layers[layer].buyables[id].unlocked() && layers[layer].buyables[id].canAfford()) {
        layers[layer].buyables[id].buyMax();
    }
}
function getEnergySoftcapFactor() {
    let e = player.m.energy || new Decimal(0);
    let base = new Decimal(2);
    if (hasUpgrade('m', 35)) base = base.add(1);
    if (hasChallenge('m', 15)){ let eff=player.points.add(10).log10().log10().pow(0.2).div(10)
                let cape=new Decimal(1)
                if(eff.gte(cape))eff=eff.sub(cape).pow(0.5).add(cape)
                    base = base.add(eff)};
   if (hasUpgrade('m', 73)){  base = base.add(e.add(1).log10().add(1).log10().add(1).div(10))};
    if(hasMilestone('pr', 1)){base=base.add(Decimal.pow(player.pr.points,1.5).div(50));}
    if (hasUpgrade('hp', 12)) base = base.times(upgradeEffect('hp', 12));
    let raw = Decimal.pow(base, Decimal.log10(e.add(1)));
    let cap = new Decimal("1e9");
    let cap2 = new Decimal("1e38");
    if (raw.lte(cap)) return raw;
    let power = new Decimal(1).div((e.add(1).log10().add(1)).pow(0.25));
    let raw2 = cap.times(raw.div(cap).pow(power));
    if (raw2.lte(cap2)) return raw2;
    let power2 = new Decimal(1).div((e.add(1).log10().add(1)).pow(0.5));
    let raw3 = cap2.times(raw2.div(cap2).pow(power2));
    return raw3;
}
// 溢出软上限：当数值超过阈值时，压缩其指数塔高度
function overflowSoftcap(value, threshold) {
    value = new Decimal(value);
    threshold = new Decimal(threshold);

    if (value.lte(threshold)) {
        if (tmp && tmp.other) {
            tmp.other.overflowActive = false;
            tmp.other.overflowHint = "";
        }
        return value;
    }

    const base = 10;
    const k0 = 0.1;
    const c = 10;

    const x = value.slog(base).toNumber();
    const a = threshold.slog(base).toNumber();
    if (a < 1e-9) return value;

    const k = k0 / a;
    const expNegKc = Math.exp(-k * c);
    const numerator = 0.49 * (1 + expNegKc);
    const denominator = 1 + Math.exp(k * (x - a - c));
    const f = 0.5 + numerator / denominator;
    const g = a * Math.pow(x / a, f);

    if (tmp && tmp.other) {
        tmp.other.overflowActive = true;
        tmp.other.overflowHint = `溢出:点数获取>${format(threshold, 3, true)} 后,slog^${format(f, 9, true)}`;

        tmp.other.softcapHint = "";
        tmp.other.doubleSoftcapHint = "";
        tmp.other.tripleSoftcapHint = "";
        tmp.other.quadrupleSoftcapHint = "";
        tmp.other.quintupleSoftcapHint = "";
        tmp.other.sextupleSoftcapHint = "";
        tmp.other.septupleSoftcapHint = "";
        tmp.other.octupleSoftcapHint = "";
        tmp.other.nonupleSoftcapHint = "";
    }

    return Decimal.tetrate(base, g);
}
// HP 效果：极微弱提升点数指数塔高度
function getHPEffect() {
    let hp = player.hp?.points || new Decimal(0);
    if (hp.lte(0)) {
        tmp.hpSoftcapStage = "";
        return new Decimal(0);
    }

    let raw = hp.add(1).pow(0.1).log10().div('1e9');
    let cap1 = new Decimal('1e-9');
    let cap2 = new Decimal('1e-6');
    let cap3 = new Decimal('1e-4');
    let cap4 = new Decimal('1e-2');
    const hardCap = new Decimal(1);

    // 根据原始 raw 判断阶段
    if (raw.lte(cap1)) {
        tmp.hpSoftcapStage = "";
    } else if (raw.lte(cap2)) {
        tmp.hpSoftcapStage = "折算";
    } else if (raw.lte(cap3)) {
        tmp.hpSoftcapStage = "超折算";
    } else if (raw.lte(cap4)) {
        tmp.hpSoftcapStage = "究级折算";
    } else {
        tmp.hpSoftcapStage = "元折算";
    }

    // 应用四级软上限
    if (raw.gt(cap1)) raw = cap1.times(raw.div(cap1).pow(0.8));
    if (raw.gt(cap2)) raw = cap2.times(raw.div(cap2).pow(0.6));
    if (raw.gt(cap3)) raw = cap3.times(raw.div(cap3).pow(0.4));
    if (raw.gt(cap4)) raw = cap4.times(raw.div(cap4).pow(0.2));

    // 硬上限判断
    let result = Decimal.min(raw, hardCap);
    if (result.gte(hardCap)) {
        tmp.hpSoftcapStage = "极限";
    }

    return result;
}

// HP 升级效果汇总（乘法和指数）
function getHPGainEffect() {
    let mult = new Decimal(1);
    let exp = new Decimal(1);
    if (hasUpgrade('hp', 11)) mult = mult.times(upgradeEffect('hp', 11));
     if (hasUpgrade('hp', 21)) mult = mult.times(upgradeEffect('hp', 21));
    return { mult, exp };
}
function getPREffect() {
    let PR = player.pr?.points || new Decimal(0);
    let hp = player.hp?.points || new Decimal(0);
    if (PR.lte(0)) return new Decimal(1);
    let base = PR;
    if (hasMilestone('pr', 5)) {
        base = base.times(hp.add(1).log10().div(10000).add(1));
    }
    let raw = base.add(1).pow(2);
    return raw;
}