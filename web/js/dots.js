pulse.ready(function(){
  console.log('Pulse Ready');

  // pulse.debug.manager = new pulse.debug.DebugManager();

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

    // Current dots on the screen
    this.dots = [];

    // Create the main game layer
    this.layer = new pulse.Layer();
    this.layer.anchor.x = 0;
    this.layer.anchor.y = 0;
    this.layer.size.x = dot.Constants.width;
    this.layer.size.y = dot.Constants.height;
    this.layer.fillColor = "#666666"

    this.addLayer(this.layer);

    this.scoreLabel = new pulse.CanvasLabel({
      text : '0',
      fontSize : 18
    });
    this.scoreLabel.fillColor = "#000000";
    this.scoreLabel.anchor = { x: 0, y: 0 };
    this.scoreLabel.position = { x: 10, y: 2};
    this.layer.addNode(this.scoreLabel);

    // state variables
    this.state = 'init';
    this.currentLevel = 1;
    this.streak = 0;
    this.currentDotIndex = 0;
    this.time = 0;
    this.animationSpeed = 75;
    this.score = 0;
    this.lastDotTouched = -1;

    this.beginRound();

    this.layer.events.bind('dotTouched', function(evt) {
      self.dotTouched(evt);
    });

    this.layer.events.bind('touchend', function() {
      self.touchEnd();
    });
  },

  dotTouched: function(evt) {
    var touchedDot = evt.sender;

    if (touchedDot.name == this.lastDotTouched + 1) {
      // if the dot you touched is the next consecutive dot
      this.lastDotTouched++;
    }
  },

  touchEnd: function() {
    if (this.lastDotTouched == this.dots.length - 1) {
      console.log('Correct order!');
      this.updateScore();
    } else {
      this.streak = 0
      console.log('Incorrect order!');
    }

    this.beginRound();
  },

  updateScore: function() {
    this.score += this.dots.length * ++this.streak;
    this.scoreLabel.text = this.score;
    this.currentLevel++;
  },

  update: function(elapsed) {
    this._super(elapsed);

    if (this.state == 'animating') {
      this.time += elapsed;
      if (this.time >= (this.animationSpeed - this.currentLevel)) {
        this.animationTick();
        this.time = 0;
      }
    }
  },

  animationTick: function() {

    if (!this.dots.length) return;

    var currentDot = this.dots[this.currentDotIndex];

    currentDot.alpha += 20;

    if (currentDot.alpha >= 100) {
      this.currentDotIndex++;
    }

    if (this.currentDotIndex >= this.dots.length) {
      this.state = 'playing';
    }
  },

  beginRound: function(params) {
    var self = this;

    // Reset states
    this.currentDotIndex = 0;
    this.lastDotTouched = -1;

    var dotCount;

    // Generate the dots
    this.generateDots(Math.min(12, Math.max(3, this.currentLevel / 2)));
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
        name: i
      });

      do {
        var randomX = Math.floor(Math.random() * (adot.xMax - adot.xMin)) + adot.xMin;
        var randomY = Math.floor(Math.random() * (adot.yMax - adot.yMin)) + adot.yMin;
        adot.position.x = randomX;
        adot.position.y = randomY;
      } while (this.checkOverlapping(adot));

      adot.alpha = 0;
      this.layer.addNode(adot);
      this.dots[i] = adot;
    }

    this.state = 'animating';
  },

  checkOverlapping: function(adot) {
    // checks if the dot passed in is overlapping with any other dots
    for (var i = this.dots.length - 1; i >= 0; i--) {
      var anotherDot = this.dots[i]

      var xs = anotherDot.position.x - adot.position.x;
      xs *= xs;

      var ys = anotherDot.position.y - adot.position.y;
      ys *= ys;

      var lineDistance = Math.sqrt(xs + ys);

      if (lineDistance <= adot.size.width + 24) {
        return true;
      }
    };
    return false;
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

    // 48 px to give room for the top score and button
    this.yMin = (this.size.height / 2) + 48;

    this.touched = false;

    this.events.bind('touchmove', function() {
      self.touchmove();
    });
  },

  touchmove: function(evt) {
    if (!this.touched) {
      this.touched = true;

      var event = new pulse.Event();
      event.sender = this;
      this.parent.events.raiseEvent('dotTouched', event);
    }
  }
  
});