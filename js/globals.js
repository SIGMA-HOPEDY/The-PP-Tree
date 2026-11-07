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
function safeBuyMax(layer, id) {
    if (layers[layer].buyables[id].unlocked() && layers[layer].buyables[id].canAfford()) {
        layers[layer].buyables[id].buyMax();
    }
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