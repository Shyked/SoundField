(function() {

  var cooldowns = {};
  var cooldownHandlers = {};
  var idInc = 0;

  window.utils = {

    rotatePoint: function(x, y, angle, centerX, centerY) {
      x -= centerX;
      y -= centerY;
      var point = {};
      point.x = x * Math.cos(angle) - y * Math.sin(angle);
      point.y = x * Math.sin(angle) + y * Math.cos(angle);
      point.x += centerX;
      point.y += centerY;
      return point;
    },

    toAngleDist: function(pos) {
      if (pos.x != 0 || pos.y != 0) {
        var dist = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
        var angle = Math.acos(pos.x / dist);
        if (pos.y < 0) angle = -angle;
        return {
          angle: angle,
          dist: dist
        };
      }
      else {
        return {
          angle: 0,
          dist: 0
        };
      }
    },

    toXY: function(angleDist) {
      var x = Math.cos(angleDist.angle) * angleDist.dist;
      var y = Math.sin(angleDist.angle) * angleDist.dist;
      return {
        x: x,
        y: y
      };
    },

    distance: function(pos1, pos2) {
      return Math.sqrt(
        (pos2.x - pos1.x) * (pos2.x - pos1.x)
        + (pos2.y - pos1.y) * (pos2.y - pos1.y)
        );
    },

    // Defines a cooldown for a function
    // If multiple functions are triggered with the same id
    // during "cooldown" seconds, only the last one will be executed
    cooldown: function(handler, id, cooldown) {
      if (!cooldowns[id]) {
        handler();
        cooldownHandlers[id] = null;
        cooldowns[id] = setTimeout(function() {
          cooldowns[id] = null;
          if (cooldownHandlers[id]) {
            window.utils.cooldown(cooldownHandlers[id], id, cooldown);
          }
        }, cooldown);
      }
      else cooldownHandlers[id] = handler;
    },

    generateUniqueId: function() {
      return ++idInc;
    },

    roundToDecimal: function(number, decimal) {
      var coeff = Math.pow(10, decimal);
      return Math.round(number * coeff) / coeff;
    }

  };

})();
