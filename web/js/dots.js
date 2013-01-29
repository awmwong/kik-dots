// window.addEventListener("resize", OnResizeCalled, false);

function OnResizeCalled() {
  var canvas = document.getElementById('live:Node1');
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
}

pulse.ready(function(){
  console.log('Pulse Ready');

  var gameWindow = document.getElementById('game-window');
  gameWindow.style.width = window.innerWidth + 'px';
  gameWindow.style.height = window.innerHeight + 'px';
  console.log(gameWindow.style.width);

  // pulse.debug.manager = new pulse.debug.DebugManager();

  // Main app engine
  var engine = new dot.GameEngine({
    gameWindow: 'game-window',
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
  Width: window.innerWidth,
  Height: window.innerHeight,
};

dot.GameEngine = pulse.Engine.extend({
  init: function(params) {
    this._super(params);
  }
});

dot.GameScene = pulse.Scene.extend({
  init: function(params) {
    var self = this;

    this._super(params);

    // State variables
    this.state = 'init';
    this.currentLevel = 1;
    this.streak = 1;
    this.currentDotIndex = 0;
    this.time = 0;
    this.animationSpeed = 75;
    this.score = 0;
    this.lastDotTouched = -1;
    this.roundDuration = 0;
    this.elapsedRoundTime = 0;

    // Current dots on the screen
    this.dots = [];

    // Create the main game layer
    this.layer = new pulse.Layer();
    this.layer.anchor.x = 0;
    this.layer.anchor.y = 0;
    this.addLayer(this.layer);

    // Score label
    this.scoreLabel = new pulse.CanvasLabel({
      text : '0',
      fontSize : 24
    });
    this.scoreLabel.fillColor = "#CCFF00";
    this.scoreLabel.anchor = { x: 0, y: 0 };
    this.scoreLabel.position = { x: 10, y: 2};
    this.layer.addNode(this.scoreLabel);

    // Combo label
    this.streakLabel = new pulse.CanvasLabel({
      text : 'Streak: 1x',
      fontSize: 12,
    });
    this.streakLabel.fillColor = "#CCFF00";
    this.streakLabel.anchor = { x: 0, y: 0 };
    this.streakLabel.position = { x: 10, y: 32};
    this.layer.addNode(this.streakLabel);

    // Timer label
    this.timerLabel = new pulse.CanvasLabel({
      text : '10',
      fontSize: 24
    });

    this.timerLabel.fillColor = "#CCFF00";
    this.timerLabel.anchor = { x: 0, y: 0 };
    this.timerLabel.position = { x: 10, y: dot.Constants.Height - 48};
    this.layer.addNode(this.timerLabel);

    // Timer bar
    this.timerBar = new dot.TimerBar();
    this.timerBar.position.x = 50;
    this.timerBar.position.y = 50;
    this.layer.addNode(this.timerBar);

    this.beginRound();

    this.layer.events.bind('dotTouched', function(evt) {
      self.dotTouched(evt);
    });

    this.layer.events.bind('touchend', function() {
      self.touchEnd();
    });
  },

  dotTouched: function(evt) {
    this.hasTouchedDots = true;
    var touchedDot = evt.sender;

    if (touchedDot.name == this.lastDotTouched + 1) {
      // if the dot you touched is the next consecutive dot
      this.lastDotTouched++;
    }
  },

  touchEnd: function() {
    if (this.state != 'playing') {
      return;
    }

    // If user hasn't begun touching dots
    if (!this.hasTouchedDots) {
      return;
    }

    if (this.lastDotTouched == this.dots.length - 1) {
      this.correctOrder();
    } else {
      this.incorrectOrder();
    }

  },

  correctOrder: function (){
    console.log('Correct order!');
    this.streak++;
    this.updateScore();
    this.beginRound();

  },

  incorrectOrder: function (){
    this.streak = 1;
    console.log('Incorrect order!');
    this.beginRound();
  },

  updateScore: function() {
    var timeRemaining = this.roundDuration - this.elapsedRoundTime;
    var timeRemainingAsSeconds = Math.floor((timeRemaining / 1000));

    timeAsString = timeRemainingAsSeconds;
    this.score += this.dots.length * this.streak * timeRemainingAsSeconds;
    this.scoreLabel.text = this.score;
    this.currentLevel++;
  },

  update: function(elapsed) {
    this._super(elapsed);

    this.streakLabel.text = "Streak: " + this.streak + "x";


    if (this.state == 'animating') {
      this.timerBar.percentage = 1;
      this.time += elapsed;
      if (this.time >= (this.animationSpeed - this.currentLevel)) {
        this.animationTick();
        this.time = 0;
      }
    }

    if (this.state == 'playing') {
      this.elapsedRoundTime += elapsed;
      this.updateTimers();
    }

  },

  updateTimers: function() {
    var timeRemaining = this.roundDuration - this.elapsedRoundTime;
    var timeRemainingAsSeconds = (timeRemaining / 1000).toFixed(1);

    timeAsString = timeRemainingAsSeconds;

    this.timerLabel.text = timeAsString;
    this.timerBar.percentage = Math.max(0, 1 - (this.elapsedRoundTime / this.roundDuration));

    if (this.timerBar.percentage === 0) {
      this.incorrectOrder();
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
    this.roundDuration = 5100.0 - (100 * this.currentLevel);
    this.elapsedRoundTime = 0;
    this.updateTimers();

    this.lastDotTouched = -1;
    this.hasTouchedDots = false;

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

    // 48 px to give room for the bottom timer bar
    this.yMax = this.maxY - (this.size.height/2) - 48;

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

dot.TimerBar = pulse.Visual.extend({
  init: function(params) {
    this._super(params);
    this.percentage = 1;
  },

  draw: function(ctx){
    this._super(ctx);

    var x = 48;
    var width = this.percentage * (dot.Constants.Width - x - 24);

    var height = 24;
    var y = dot.Constants.Height - height - 24;

    ctx.fillStyle = "#CCFF00";
    ctx.fillRect(x, y, width, height);
  }
})