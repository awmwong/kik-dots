dot.TutorialScene = pulse.Scene.extend({
  init: function(params) {
    var self = this;
    this._super(params);

    this.tutorialLayer = new pulse.Layer();
    this.tutorialLayer.anchor.x = 0;
    this.tutorialLayer.anchor.y = 0;
    this.addLayer(this.tutorialLayer);

    this.tutorialImage = new pulse.Sprite({
      src:'img/how-to-dotts.png',
      size: {
        width: 320,
        height: 400,
      }
    });
    this.tutorialLayer.addNode(this.tutorialImage);
    this.tutorialImage.position = { x: dot.Constants.Width / 2, y: dot.Constants.Height / 2 - 45};

    // Play Button
    this.playButton = new pulse.Sprite({
      src:'img/play-button.png',
      size: {
        width: 160,
        height: 90
      }
    });
    this.playButton.position = { x: dot.Constants.Width / 2, y: dot.Constants.Height / 2 + 175};
    this.playButton.events.bind('touchend', function(e){
      // Set flag that tutorial has been seen
      localStorage['seenTutorial'] = true;
      self.events.raiseEvent('gameStart', e);
    });
    this.tutorialLayer.addNode(this.playButton);
  },

  update: function(elapsed) {
    this._super(elapsed);
  },

});
