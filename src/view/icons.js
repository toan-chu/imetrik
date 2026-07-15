(function () {
  "use strict";
  var IMK = window.IMK = window.IMK || {};

  IMK.Icons = {
    markup: function (name, label) {
      return "<i data-lucide='" + name + "' aria-hidden='true'></i><span class='sr-only'>" + IMK.escape(label) + "</span>";
    },
    refresh: function () {
      if (!window.lucide) return;
      window.lucide.createIcons({ attrs: { "stroke-width": 1.8 } });
    }
  };
})();
