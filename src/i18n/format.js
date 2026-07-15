(function () {
  "use strict";
  var IMK = window.IMK = window.IMK || {};
  var C = window.APP_CONFIG;

  IMK.i18n = {
    lang: C.DEFAULT_LANG,
    currency: C.DEFAULT_LANG === "vi" ? { symbol: "đ", position: "suffix", code: "VND" } : { symbol: "$", position: "prefix", code: "USD" },
    setLang: function (lang) {
      this.lang = lang === "en" ? "en" : "vi";
      this.currency = this.lang === "vi" ? { symbol: "đ", position: "suffix", code: "VND" } : { symbol: "$", position: "prefix", code: "USD" };
      document.documentElement.lang = this.lang;
      this.applyStatic();
    },
    t: function (key) {
      return (IMK.STRINGS[this.lang] && IMK.STRINGS[this.lang][key]) || IMK.STRINGS.vi[key] || key;
    },
    locale: function () {
      return this.lang === "vi" ? "vi-VN" : "en-US";
    },
    number: function (value, options) {
      options = options || {};
      if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
      var opts = options.compact ? { notation: "compact", maximumFractionDigits: 1 } : { maximumFractionDigits: options.maxDigits == null ? 1 : options.maxDigits };
      return new Intl.NumberFormat(this.locale(), opts).format(Number(value));
    },
    money: function (value, cfg) {
      cfg = cfg || this.currency;
      var n = this.number(value, { maxDigits: 0 });
      return cfg.position === "suffix" ? n + cfg.symbol : cfg.symbol + n;
    },
    percent: function (value) {
      return this.number(value, { maxDigits: 1 }) + "%";
    },
    time: function (date) {
      return new Intl.DateTimeFormat(this.locale(), { hour: "2-digit", minute: "2-digit" }).format(date || new Date());
    },
    applyStatic: function () {
      document.querySelectorAll("[data-i18n]").forEach(function (el) {
        el.textContent = IMK.i18n.t(el.dataset.i18n);
      });
      document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
        var label = IMK.i18n.t(el.dataset.i18nTitle);
        el.title = label;
        if (el.getAttribute("aria-label")) el.setAttribute("aria-label", label);
      });
    }
  };
})();
