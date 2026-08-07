// ==========================
// 全局辅助函数
// ==========================

// 标准软上限计算函数（用于升级效果）
function effectWithSoftcap(raw, cap, softPower, customCappedPower) {
    if (raw.lte(cap)) return raw;
    let ratio = raw.div(cap);
    let capped = ratio.pow(softPower);
    if (customCappedPower) {
        capped = customCappedPower(capped, ratio);
    }
    return cap.times(capped);
}

// 基于玩家资源的动态压缩指数
function dynamicSoftcap(raw, cap, resourceLayer, basePower, divisorFn) {
    if (raw.lte(cap)) return raw;
    let ratio = raw.div(cap);
    let dynamicPow = basePower.div(divisorFn(player[resourceLayer].points));
    return cap.times(ratio.pow(dynamicPow));
}

// 通用软上限处理器（用于 getPointGen 中的多重软上限）
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

// 时间之晶相关
function getTimeCrystalDiscount() {
    let eff = tmp.tp?.buyables?.[12]?.effect;
    if (eff && eff.discount) return eff.discount;
    // 回退：如果没有效果对象（如初始化时），手动计算一次
    let crystals = player.tp?.buyables?.[12] || new Decimal(0);
    return Decimal.pow(crystals.div(114514), crystals);
}

function getTimeCrystalLimitBonus() {
    let eff = tmp.tp?.buyables?.[12]?.effect;
    if (eff && eff.limit) return eff.limit;
    // 回退
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
    let base = new Decimal(1 + level / 100);          // 1.01, 1.02, 1.03
    if (hasChallenge('pp', 15)) base = base.times(1.000787); // 基数微增
    return Decimal.pow(base, cnt);
}

function getTimesPowerMultiplier() {
    let tp = player.timesPower;
    if (!tp || !(tp instanceof Decimal)) tp = new Decimal(0);
    let tpr = new Decimal(1.3);
    if (hasUpgrade('tp', 23)) tpr = new Decimal(2.026);
    return tp.add(1).pow(tpr);
}

// 清理旧升级ID（仅执行一次）
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
// 安全批量购买（已足够，无须添加）
function safeBuyMax(layer, id) {
    if (layers[layer].buyables[id].unlocked() && layers[layer].buyables[id].canAfford()) {
        layers[layer].buyables[id].buyMax();
    }
}
// 能量延长软上限因子（可在显示和计算中复用）
function getEnergySoftcapFactor() {
    let energy = player.m.energy || new Decimal(0);
    let base = new Decimal(2);
    if (hasUpgrade('m', 35)) base = base.add(1);
    return Decimal.pow(base, Decimal.log10(energy.add(1)));
}