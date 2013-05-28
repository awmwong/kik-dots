dot.AnnouncementLabel = pulse.CanvasLabel.extend({
  init: function(params) {
    this._super(params);
    this.time = 0;
    this.easeTime = 0;
    this.animationSpeed = 50;
    this.alpha = 100;
    this.zindex = 10;
  },

  update: function(elapsed) {
    this._super(elapsed);
    this.time += elapsed;
    this.easeTime += elapsed;
    if (this.time >= this.animationSpeed && this.sticky === false) {
      this.time = 0;
      // tick!
      var newAlpha = Math.max(0, pulse.util.easeOutCubic(this.easeTime, 100, -100, this.animationSpeed * 15));
      this.alpha = newAlpha;

      if (this.alpha === 0) {
        this.visible = false;
      }
    }
  },

  showAnnouncement: function(message, sticky) {
    var self = this;

    this.fillColor = "#CCFF00";
    this.text = message;
    if (sticky) {
      this.sticky = true;
    } else {
      this.sticky = false;
    }

    setTimeout(function(){
      self.alpha = 100;
      self.easeTime = 0;
      self.visible = true;
    },10)

  },

  showBadAnnouncement: function(message, sticky) {
    var self = this;

    this.fillColor = "#FF2200";
    this.text = message;
    if (sticky) {
      this.sticky = true;
    } else {
      this.sticky = false;
    }

    setTimeout(function(){
      self.alpha = 100;
      self.easeTime = 0;
      self.visible = true;
    }, 10);
  }
});