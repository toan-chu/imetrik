(function () {
  "use strict";

  window.APP_CONFIG = {
    BRAND_NAME: "iMetriK",
    LOGO: "assets/logo-iMetriK.png",
    COLOR_PRIMARY: "#303841",
    COLOR_ACCENT: "#FF5722",
    FONT_DISPLAY: "'Quicksand'",
    FONT_MONO: "'Montserrat'",
    DEFAULT_LANG: "vi",
    FUZZY_MAX_EDITS: 2,
    UNION_THRESHOLD: 0.70,
    ANCHOR_MIN_COLS: 2,
    POLL_MS: 8000,
    ANIM_MAX_POINTS: 2500,
    CATEGORICAL_DEFAULT: ["#76ABAE", "#FF5722", "#303841", "#A8CBCD", "#FF9A73", "#59636C"],
    VISUAL_PALETTES: {
      auto: {
        light: ["#303841", "#FF5722", "#76ABAE", "#59636C", "#FF9A73", "#A8CBCD"],
        dark: ["#FF5722", "#F5F5F5", "#9AC5C7", "#FF9A73", "#C9D0D5", "#76ABAE"]
      },
      orange: {
        light: ["#FF5722", "#FF8A65", "#303841", "#FFB29A", "#59636C"],
        dark: ["#FF7043", "#FFAB91", "#F5F5F5", "#FFCCBC", "#C9D0D5"]
      },
      charcoal: {
        light: ["#303841", "#59636C", "#7C8790", "#A8B0B6", "#D4D8DB"],
        dark: ["#F5F5F5", "#D8DDE0", "#B4BDC3", "#8A969E", "#59636C"]
      },
      teal: {
        light: ["#76ABAE", "#A8CBCD", "#303841", "#D3E4E5", "#59636C"],
        dark: ["#9AC5C7", "#76ABAE", "#F5F5F5", "#C6E0E1", "#B4BDC3"]
      },
      ocean: {
        light: ["#277DA1", "#43AA8B", "#577590", "#4D908E", "#90BE6D", "#F9C74F"],
        dark: ["#7DD3FC", "#6EE7B7", "#A5B4FC", "#67E8F9", "#BEF264", "#FDE68A"]
      },
      forest: {
        light: ["#2D6A4F", "#40916C", "#74C69D", "#95D5B2", "#B7E4C7", "#52796F"],
        dark: ["#86EFAC", "#6EE7B7", "#A7F3D0", "#BBF7D0", "#D1FAE5", "#99F6E4"]
      },
      berry: {
        light: ["#7B2CBF", "#9D4EDD", "#C77DFF", "#E0AAFF", "#C9184A", "#FF758F"],
        dark: ["#D8B4FE", "#E9D5FF", "#F0ABFC", "#F5D0FE", "#FDA4AF", "#FECDD3"]
      },
      spectrum: {
        light: ["#F94144", "#F3722C", "#F9C74F", "#90BE6D", "#43AA8B", "#577590", "#7B2CBF"],
        dark: ["#FCA5A5", "#FDBA74", "#FDE68A", "#BBF7D0", "#99F6E4", "#BFDBFE", "#E9D5FF"]
      },
      sunset: {
        light: ["#E76F51", "#F4A261", "#E9C46A", "#6D597A", "#B56576", "#355070"],
        dark: ["#FDBA9A", "#FED7AA", "#FDE68A", "#D8B4FE", "#FDA4AF", "#BFDBFE"]
      }
    },
    CHART_PALETTE: {
      teal: ["#EDF5F5", "#D8E8E9", "#B8D2D4", "#76ABAE", "#558A8D", "#3A6568", "#303841"],
      orange: ["#FFF1EC", "#FFD9CC", "#FFB398", "#FF815A", "#FF5722", "#C83D13", "#7F260D"],
      charcoal: ["#F5F5F5", "#DDE0E2", "#B5BBC0", "#7C858C", "#525C64", "#303841", "#1F252A"],
      neutral: ["#FFFFFF", "#F5F5F5", "#E7EAEB", "#D3D8DA", "#9BA4A8", "#667176", "#303841"]
    }
  };

  var root = document.documentElement;
  if (root && root.style) {
    root.style.setProperty("--brand-primary", window.APP_CONFIG.COLOR_PRIMARY);
    root.style.setProperty("--brand-accent", window.APP_CONFIG.COLOR_ACCENT);
    root.style.setProperty("--brand-font-display", window.APP_CONFIG.FONT_DISPLAY);
    root.style.setProperty("--brand-font-body", window.APP_CONFIG.FONT_MONO);
  }
})();
