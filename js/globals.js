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
    if (penalty !== 1) {
        exponent = exponent.times(penalty);
    }
    if (!exponent.isFinite() || exponent.isNan() || exponent.lte(0)) exponent = new Decimal(0.9);
    let cappedExcess = excess.pow(exponent);
    let result = threshold.plus(cappedExcess);
    if (tmp && tmp.other && hintKey) {
        tmp.other[hintKey] = `点数获取大于 ${format(threshold, 3, true)} 后，受到软上限！(^${format(exponent, 9, true)})`;
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
    if (hasChallenge('m', 15)) base = base.add(player.points.add(10).log10().log10().pow(0.2).div(10));
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