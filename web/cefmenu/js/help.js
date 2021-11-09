let help = new Vue({
  el: '#notifyAddonMenu',
  data: {
    show: false,
    button: "E",
    text: "Взаимодействовать",
  },
  methods: {
    showHelp: function(text, button = "E"){
      this.button = button;
      this.text = text;
      this.show = true;
    },
    hideHelp: function(){
      this.show = false;
    },
    showHelpTimer: function(text, button, timer = 3000){
      let self = this;
      if(self.show && self.button == button && self.text == text) return;
      self.showHelp(text, button)
      setTimeout(function(){
        self.hideHelp()
      }, timer)
    },

  }
});
