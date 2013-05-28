dot.DotSprite = pulse.Sprite.extend({
  init: function(params){
    var self = this;
    this._super(params);

    this.maxX = dot.Constants.Width;
    this.maxY = dot.Constants.Height;
    this.xMax = this.maxX - (this.size.width/2);

    // 48 px to give room for the bottom timer bar
    this.yMax = this.maxY - (this.size.height/2) - 48;

    // 36 px to give room not to trigger sidebar
    this.xMin = this.size.width / 2 + 36;

    // 48 px to give room for the top score and button
    this.yMin = (this.size.height / 2) + 48;

    this.touched = false;

    this.events.bind('touchstart', function(){
      self.touchmove();
    });

    this.events.bind('touchmove', function() {
      self.touchmove();
    });

  },

  touchmove: function(evt) {
    if (!this.touched) {
      var event = new pulse.Event();
      event.sender = this;
      this.parent.events.raiseEvent('dotTouched', event);
    }
  },
});
