addLayer("ach", {
  name: "Achievements",
  symbol: "A",
  position: 0,
  row: "side",
  color: "#fbff00ff",
  resource: "成就点数",
  type: "none",

  startData() {
    return {
      unlocked: true,
      points: new Decimal(0),
    };
  },

  layerShown() {
    return true;
  },

  tooltip: "成就",
  achievementPopups: true,

  infoboxes: {
    introBox1: {
      title: "成就",
      unlocked() { return true },
      body() {
        return "显示游戏中的所有成就，他们会提供一些小奖励，大部分也不需要刻意去做才能完成。<br>部分成就会提供一些特殊奖励";
      },
    },
    introBox2: {
      title: "进度里程碑",
      unlocked() { return true },
      body() {
        return "显示游戏中的所有进度里程碑，他们会优化游戏体验，大部分也不需要刻意去做才能完成。<br>部分进度里程碑会提供一些特殊奖励";
      },
    },
  },

  tabFormat: {
    "成就": {
      content: [
        ["infobox", "introBox1"], 
        ["display-text", function () {
          let ach = player.ach.points;
          let eff = tmp.ach?.effect || new Decimal(1);
          return `你有 <h2 style="color: #fbff00ff; text-shadow: 0px 0px 10px #fbff00ff;">${formatWhole(ach)}</h2> 成就点数,使微小点数获取 <h2 style="color: #fbff00ff; text-shadow: 0px 0px 10px #fbff00ff;">*${format(eff, 4, true)}</h2>`;
        }],
        "blank",
        "achievements",
      ],
    },
    "进度里程碑": {
      content: [
        ["infobox", "introBox2"],
        ["display-text", function () {
          let ach = player.ach.points;
          let eff = tmp.ach?.effect || new Decimal(1);
          return `你有 <h2 style="color: #fbff00ff; text-shadow: 0px 0px 10px #fbff00ff;">${formatWhole(ach)}</h2> 成就点数,使微小点数获取 <h2 style="color: #fbff00ff; text-shadow: 0px 0px 10px #fbff00ff;">*${format(eff, 4, true)}</h2>`;
        }],
        "blank",
        "milestones",
      ],
    },
  },

  milestones: {
  },

  achievements: {
    rows: 100,
    cols: 6,

    11: {
      name: "始",
      tooltip: "获得1微小点数 奖励:1成就点。",
      done() {
        return player.points.gte(1);
      },
      onComplete() {
        addPoints("ach", 1);
      },
    },
  },

  effect() {
    let base = new Decimal(1.001);
    let raw = base.pow(player.ach.points);
    let cap = new Decimal("1e2026");
    return raw.lte(cap) ? raw : cap.times(raw.div(cap).pow(0.5));
  },

  effectDescription() {
    return "成就点数使微小点数获取*" + format(tmp.ach.effect || new Decimal(1), 4, true);
  },
});