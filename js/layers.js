addLayer("bp", {
  name: "Base Points", // 层名称
  symbol: "BP",        // 显示在侧边栏的图标
  position: 0,         // 位置
  row: 0,              // 行数（0为主行）
  color: "#00aeffff",    // 颜色
  resource: "基础点数", // 资源名称
  baseResource: "微小点数", // 来源资源
  type: "none",        // 层类型

  startData() {
    return {
      unlocked: true,
      points: new Decimal(0),
      exp: new Decimal(0.5), // 初始 exp 为 0.5
    };
  },

  layerShown() {
    return true;
  },
  tooltip: "BP(基础点数)",
  tabFormat: {
    "基础点数": {
      content: [
        ["display-text", function() {
          return `你有 <h2 style="color: #00bfff; text-shadow: 0px 0px 10px #00bfff;">${format(player.bp.points)}</h2> 基础点数`;
        }],
        ["display-text", function() {
          return `公式指数: <h2 style="color: #00bfff;">${format(player.bp.exp)}</h2>`;
        }],
        "blank",
        "upgrades", 
      ],
    },
  },
  upgrades: {}
});