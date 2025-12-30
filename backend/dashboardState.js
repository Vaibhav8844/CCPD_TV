const dashboardState = {
  layout: [],
  layoutTemplate: null,
  widgetSlots: {},
  widgets: {
    announcements: [],
    drives: [],
    company_spotlight: null,
    stats: {},
    pdfslideshow: {
      url: "",
      interval: 5,
    },
    youtube: {  
      videoSource: "youtube", // "youtube" or "uploaded"
      videoId: "",
      videoUrl: "",
      autoplay: true,
      mute: true,
      loop: true
    },
    mediaSlideshow: [],
    backgroundMusic: {
      enabled: false,
      musicId: "none",
      musicUrl: "",
      volume: 0.3
    }
  },
  urgent_alert: null,
};

export default dashboardState;
