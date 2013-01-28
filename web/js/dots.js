pulse.ready(function(){
  console.log('Pulse Ready');

  // Main app engine
  var engine = new dot.GameEngine({
    gameWindow: 'game-window',
    width: dot.Constants.Width,
    height: dot.Constants.Height
  });

  // Game scene
  var gameScene = new dot.GameScene();

  // Add and activiate the scene
  engine.scenes.addScene(gameScene);
  engine.scenes.activateScene(gameScene);

  // Start the update and render loop.
  engine.go(16);
});

var dot = {};

dot.Constants = {
  Width: 320,
  Height: 480,
};

dot.GameEngine = pulse.Engine.extend({
  init: function(params) {
    this._super(params);

    this.level = 1;

    this.dots = [];

  }
});

dot.GameScene = pulse.Scene.extend({
  init: function(params) {
    var self = this;

    this._super(params);

    // Current level of the game
    this.currentLevel = 1;

    // Current dots on the screen
    this.dots = [];

    // Create the main game layer
    this.layer = new pulse.Layer();
    this.layer.anchor.x = 0;
    this.layer.anchor.y = 0;
    this.addLayer(this.layer);

    this.beginRound();

    this.events.bind('touchend', function() {
      console.log('Touch ended in the main canvas!');
      self.generateDots(3);
    });
  },

  beginRound: function(params) {
    var self = this;

    // Generate the dots
    this.generateDots(10)
  },

  generateDots: function(number) {
    
    // Remove the old dots
    for (var i = this.dots.length - 1; i >= 0; i--) {
      var adot = this.dots[i]
      this.layer.removeNode(adot.name);
    };

    // Make new dots!
    for (var i = 0; i < number; i++) {
      var adot = new dot.DotSprite({
        src: 'img/dot.png',
        size: {
          width: 48,
          height: 48
        },
        name: 'dot' + i
      });
   
      adot.position.x = Math.floor(Math.random() * adot.xMax);
      adot.position.y = Math.floor(Math.random() * adot.yMax);

      console.log('d ' + adot.xMax + ',' + adot.xMin);


      console.log('Generate dot at ' + adot.position.x + ',' + adot.position.y);
      this.layer.addNode(adot);
      this.dots[i] = adot;
    }
  }

});


dot.DotSprite = pulse.Sprite.extend({
  init: function(params){
    var self = this;
    this._super(params);

    this.maxX = dot.Constants.Width;
    this.maxY = dot.Constants.Height;
    this.xMax = this.maxX - (this.size.width/2);
    this.yMax = this.maxY - (this.size.height/2);
    this.xMin = this.size.width / 2;
    this.yMin = this.size.height / 2;

    this.touched = false;

    this.events.bind('touchmove', function() {
      self.touchmove();
    });
  },

  touchmove: function(evt) {
    if (!this.touched) {
      console.log('moved through ' + this.name);

      this.touched = true;

      this.events.raiseEvent('dotTouched', new pulse.Event({
        dot: this
      }));
    }
  }
  
});