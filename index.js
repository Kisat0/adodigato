module.exports = function WarriorHelper(mod) {
  //SKILL ASLT
  let BD = 290930,
    RBA = 360100,
    RB = 40930,
    apex = false,
    isTank = false;

  const BW = 400112,
    TC = 281030,
    S = 380130,
    AS = 410190,
    BF = 420130,
    baseBD = 290930,
    apexBD = 370130,
    baseRB = 40930,
    apexRB = 360130,
    BW_def = 400122,
    TC_def = 390130,
    OSTANCE = 100103,
    TSTANCE = 100201;
  /*     100201
        100103
        100801 */
  const GAME = mod.game;
  let enable, job, gameId, timeout;
  let player = mod.game.me;
  let lastLastSkill,
    lastSkill,
    failsafe = null;
  let name;
  let allCD = new Array(50).fill(true);

  //HOOK
  GAME.on("enter_game", () => {
    job = (GAME.me.templateId - 10101) % 100;
    if (job == 0) {
      enable = true;
    } else {
      enable = false;
    }
  });
  GAME.on("leave_game", () => {
    job = -1;
  });

  mod.hook("S_LOGIN", 14, (event) => {
    gameId = event.gameId;
  });
  mod.hook("S_ABNORMALITY_BEGIN", 4, (event) => {
    if (!enable) return;
    if (event.id === TSTANCE) isTank = true;
    if (event.id === OSTANCE) isTank = false;

    if (event.target == gameId && event.id == 100811) {
      apex = true;
      BD = apexBD;
      RB = apexRB;
    }
  });
  mod.hook("S_ABNORMALITY_END", 1, (event) => {
    if (!enable) return;
    if (event.id === TSTANCE) isTank = false;
    if (event.id === OSTANCE) isTank = true;

    if (event.target == gameId && event.id == 100811) {
      apex = false;
      BD = baseBD;
      RB = baseRB;
    }
  });

  mod.hook("S_START_COOLTIME_SKILL", 3, (event) => {
    if (!enable) return;

    allCD[Math.floor(event.skill.id / 10000)] = false;
    timeout = setTimeout(() => {
      allCD[Math.floor(event.skill.id / 10000)] = true;
    }, event.cooldown - 1000);
  });

  mod.hook("C_START_SKILL", 7, { order: -100 }, (event) => {
    if (!enable) return;

    /* 
        if (Math.floor(event.skill.id / 10000) == 36) {
            event.skill.id = RBA
            StartInstanceSkill(event)
        } */

    if (event.skill.id == BW) {
      event.skill.id = BW;
      StartInstanceSkill(event);
    }

    if(event.skill.id == BW_def && isTank) {
      event.skill.id = BW_def;
      StartInstanceSkill(event);
    }

    if (apex) return;

    /* if (Math.floor(event.skill.id / 10000) == 4) {
                    event.skill.id = RB
                    StartInstanceSkill(event)
                } */
    if (Math.floor(event.skill.id / 10000) == 28) {
      event.skill.id = TC;
      StartInstanceSkill(event);
    }

    if (Math.floor(event.skill.id / 10000) == 39) {
      if (isTank) event.skill.id = event.skill.id = TC_def;
      else event.skill.id = TC;
      StartInstanceSkill(event);
    }

    if (Math.floor(event.skill.id / 10000) == 38) {
      event.skill.id = S;
      StartInstanceSkill(event);
    }

    lastLastSkill = lastSkill;
    lastSkill = event.skill.id;
  });

  //FONCTION
  function StartInstanceSkill(event) {
    mod.send("C_START_INSTANCE_SKILL", 7, {
      skill: event.skill,
      loc: event.loc,
      w: event.w,
      continue: event.continue,
      targets: [{ arrowId: 0, gameId: event.target, hitCylinderId: 0 }],
      endpoints: [event.dest],
    });
  }

  function repeater(key, trigger) {
    if (lastSkill == trigger && failsafe < 40) {
      failsafe++;
      var robot17 = require("robotjs");
      robot17.keyTap(key);
      setTimeout(
        function (key, trigger) {
          repeater(key, trigger);
        },
        50,
        key,
        trigger
      );
    }
  }

  function reloadModule(fileName) {
    delete require.cache[require.resolve(fileName)];
    mod.command.message("Reloading: " + fileName);
    return require(fileName);
  }
  mod.command.add(["wh", "war", "warrior"], (param) => {
    if (param == null) {
      enable = !enable;
      mod.command.message("Warrior Helper: " + `${enable ? "On" : "Off"}`);
    }
  });
};
