dot.MenuScene = pulse.Scene.extend({
  init: function(params) {
    var self = this;
    this._super(params);

    // Create a new layer
    this.menuLayer = new pulse.Layer();
    this.menuLayer.anchor.x = 0;
    this.menuLayer.anchor.y = 0;
    this.addLayer(this.menuLayer);


    // Play Button
    this.playButton = new pulse.Sprite({
      src:'img/play-button.png',
      size: {
        width: 160,
        height: 90
      }
    });
    this.playButton.position = { x: dot.Constants.Width / 2, y: dot.Constants.Height / 2};
    this.playButton.events.bind('touchend', function(e){

      if (dot.Scores.shown == true) {
        return;
      }

      var seenTutorial = localStorage['seenTutorial'];

      if (seenTutorial !== undefined && seenTutorial == 'true') {
        self.events.raiseEvent('gameStart', e);
      } else {
        self.events.raiseEvent('tutorialStart', e);
      }
    });
    this.menuLayer.addNode(this.playButton);

    // Score Label
    this.scoreLabel = new pulse.CanvasLabel({
      text: "Highscore: ",
      fontSize: 20,
    });
    this.menuLayer.addNode(this.scoreLabel);
    this.scoreLabel.position = { x: dot.Constants.Width / 2, y: (dot.Constants.Height / 2) + (this.playButton.size.height / 2) + 24};
    this.scoreLabel.fillColor = '#CCFF00'

    // Scores button

    this.scoreButton = new pulse.Sprite({
      src:'img/score-button.png',
      size: {
        width: 107,
        height: 60
      }
    })
    this.scoreButton.position = { x: dot.Constants.Width / 2, y: this.scoreLabel.position.y + 60 };
    this.scoreButton.events.bind('touchend', function(e) {
      dot.Scores.showLeaderboard();
    })

    this.menuLayer.addNode(this.scoreButton);

  },

  update: function(elapsed) {
    this._super(elapsed);
    this.updateScore();
  },

  updateScore: function() {
    var highScore = localStorage['highscore'];
    if ( highScore !== undefined) {
      this.scoreLabel.visible = true;
      this.scoreLabel.text = "Highscore: " + highScore;
    } else {
      this.scoreLabel.visible = false;
    }
  }
});