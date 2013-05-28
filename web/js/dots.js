// CARDS STUFF
// Lock the orientation in lanscape mode
cards.ready(function(){
  console.log("Cards Ready");

  if (cards.browser) {
    cards.browser.setOrientationLock('portrait');
  }

  console.log('Pulse Ready');

  // Textures
  dot.Constants.GreenDot = new pulse.Texture({
    filename: 'img/hi-dot-green.png',
  });

  dot.Constants.BlackDot = new pulse.Texture({
    filename: 'img/hi-dot-black.png'
  });

  var gameWindow = document.getElementById('game-window');
  gameWindow.style.width = window.innerWidth + 'px';
  gameWindow.style.height = window.innerHeight + 'px';
  dot.Constants.Width = window.innerWidth;
  dot.Constants.Height = window.innerHeight;
  
  // Main app engine
  var engine = new dot.GameEngine({
    size: {
      width: dot.Constants.Width,
      height: dot.Constants.Height
    },
    gameWindow: 'game-window'
  });

  // Game scene
  var gameScene = new dot.GameScene();
  gameScene.events.bind('gameEnd', function(){
    engine.scenes.deactivateScene(gameScene);
    engine.scenes.activateScene(menuScene);
  })

  // Menu Scene
  var menuScene = new dot.MenuScene();
  menuScene.events.bind('gameStart', function(){
    engine.scenes.deactivateScene(menuScene);
    gameScene.startNewGame();
    engine.scenes.activateScene(gameScene);
  });

  // Add and activiate the scene
  engine.scenes.addScene(gameScene);
  // engine.scenes.activateScene(gameScene);

  engine.scenes.addScene(menuScene);  
  engine.scenes.activateScene(menuScene);

  // Start the update and render loop.
  engine.go(1);
  
});


var dot = {};

dot.Constants = {
  Width: 0,
  Height: 0
};

pulse.ready(function(){

});


dot.GameEngine = pulse.Engine.extend({
  init: function(params) {
    this._super(params);
  }
});

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
      self.events.raiseEvent('gameStart', e);
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



dot.GameScene = pulse.Scene.extend({
  init: function(params) {
    var self = this;

    this._super(params);

    // Current dots on the screen
    this.dots = [];

    // Trail Points
    this.trailPoints = [];

    // Success Messages
    this.successMessages = ['Ok!', 'Sweet!', 'Nice!', 'Yea!', 'Wicked!', 'Cool!', 'Woot!'];

    // Fail Messages!
    this.failureMessages = ['Fail!', 'Nope!', 'Huh?!', 'No!', 'Bad!', 'What?!', 'LOL!'];

    // Create the main game layer
    this.layer = new dot.MainLayer();
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
      text : 'Lives: 3 | Streak: 1x',
      fontSize: 18,
    });
    this.streakLabel.fillColor = "#CCFF00";
    this.streakLabel.anchor = { x: 0, y: 0 };
    this.streakLabel.position = { x: 10, y: 32};
    this.layer.addNode(this.streakLabel);

    // Pause Button
    this.pauseButton = new pulse.Sprite({
      src: 'img/x-button.png',
      size: {
        width: 24,
        height: 24
      }
    });

    this.pauseButton.position = { 
      x: dot.Constants.Width - 32,
      y: 24
    }

    this.pauseButton.events.bind('touchend', function(e) {
      self.resetState();

      setTimeout(function(){
        self.events.raiseEvent('gameEnd', e);
      }, 25);
    });

    this.layer.addNode(this.pauseButton);

    // Timer label
    this.timerLabel = new pulse.CanvasLabel({
      text : '10',
      fontSize: 24
    });

    this.timerLabel.fillColor = "#CCFF00";
    this.timerLabel.anchor = { x: 0, y: 0 };
    this.timerLabel.position = { x: 10, y: dot.Constants.Height - 48};
    this.layer.addNode(this.timerLabel);

    // Announcement label
    this.announcementLabel = new dot.AnnouncementLabel({
      text: 'Go!',
      fontSize: 48,
    })
    this.announcementLabel.fillColor = "#CCFF00";
    this.announcementLabel.position = { x: dot.Constants.Width / 2, y: dot.Constants.Height / 2};
    this.announcementLabel.visible = false;
    this.layer.addNode(this.announcementLabel);

    // Timer bar
    this.timerBar = new dot.TimerBar();
    this.timerBar.position.x = 25;
    this.timerBar.position.y = 25;
    this.layer.addNode(this.timerBar);

    this.startNewGame();

    this.layer.events.bind('dotTouched', function(evt) {
      self.dotTouched(evt);
    });

    this.layer.events.bind('touchend', function(evt) {
      self.layer.touchend(evt);
      self.touchEnd();
    });

    this.layer.events.bind('touchmove', function(evt) {
      self.layer.touchmove(evt);
    })
  },

  resetState: function(){
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
    this.lives = 3;

    // Labels
    this.scoreLabel.text = this.score;
    this.announcementLabel.visible = false;

    // Remove the old dots
    for (var i = this.dots.length - 1; i >= 0; i--) {
      var adot = this.dots[i]
      this.layer.removeNode(adot.name);
    };

  },

  startNewGame: function(){
    var self = this;
    this.resetState();
    setTimeout(function(){
      self.beginRound();
    }, 10);
  },

  dotTouched: function(evt) {

    if (this.state !== 'playing') {
      return;
    }

    this.hasTouchedDots = true;
    var touchedDot = evt.sender;
    touchedDot.touched = true;
    touchedDot.texture = dot.Constants.BlackDot;

    if (touchedDot.name == this.lastDotTouched + 1) {
      // if the dot you touched is the next consecutive dot
      this.lastDotTouched++;
    }
  },

  touchEnd: function() {
    if (this.state !== 'playing') {
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
    var randomIndex = Math.floor(Math.random() * (this.successMessages.length - 1));
    this.announcementLabel.showAnnouncement(this.successMessages[randomIndex]);
    this.streak++;
    this.updateScore();
    this.beginRound();

  },

  incorrectOrder: function (){
    var randomIndex = Math.floor(Math.random() * (this.successMessages.length - 1));
    this.announcementLabel.showBadAnnouncement(this.failureMessages[randomIndex]);
    this.streak = 1;
    this.lives--;

    if (this.lives === 0) {
      var prevHighScore = localStorage['highscore'];

      if (this.score > prevHighScore || prevHighScore === undefined) {
        localStorage['highscore'] = this.score;
      }
      this.state = 'paused';
      this.announcementLabel.showBadAnnouncement('Game Over!', true);
    } else {
      this.beginRound();
    }
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

    this.streakLabel.text = "Lives: " + this.lives +" | Streak: " + this.streak + "x";


    if (this.state === 'animating') {
      this.timerBar.percentage = 1;
      this.time += elapsed;
      if (this.time >= (this.animationSpeed - this.currentLevel)) {
        this.animationTick();
        this.time = 0;
      }
    }

    if (this.state === 'playing') {
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
      this.announcementLabel.showAnnouncement('Go!');
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
    this.generateDots(this.numDotsForLevel(this.currentLevel));

  },

  numDotsForLevel: function(number) {
    // Follows a logarithmic difficulty curve.
    var dotsForLevel = 2 * Math.log(this.currentLevel);

    return Math.min(12, Math.max(3, Math.floor(dotsForLevel)));
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
        src: dot.Constants.GreenDot,
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
      adot.zindex = 1;
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

dot.MainLayer = pulse.Layer.extend({
  init: function(params) {
    var self = this;
    this._super(params);

    this.events.bind('touchmove', function(evt) {
      self.touchmove(evt);
    });

    // this.events.bind('touchend'), function(evt) {
    //   self.touchend(evt);
    // }

    this.lastTrailPoint = { position: {x: 0, y:0 } };
    this.trailPoints = [];
  },

  draw: function(ctx){
    this._super(ctx);

    for (var i = 0; i < this.trailPoints.length; i++) {
      var point = this.trailPoints[i]

    }
  },

  touchmove: function(evt){

    var evtX = evt.position.x.toFixed(0);
    var evtY = evt.position.y.toFixed(0);

    var lastX = this.lastTrailPoint.position.x;
    var lastY = this.lastTrailPoint.position.y;

    var xs = evtX - lastX;

    xs *= xs;

    var ys = evtY - lastY;
    ys *= ys;

    var lineDistance = Math.sqrt(xs + ys);
    if (lineDistance >= 10) {
      this.addNewTrailPoint({x: evtX, y: evtY});
    }
  },

  addNewTrailPoint: function(point){
    var trailPoint = new dot.TrailDotSprite({
      name: 'tp' + point.x + point.y
    });

    trailPoint.position.x = point.x;
    trailPoint.position.y = point.y;

    this.lastTrailPoint = trailPoint;
    this.trailPoints.push(trailPoint);
    this.addNode(trailPoint);
    console.log('added: ' + trailPoint.name);
  },

  touchend: function(){
    for (var i = 0; i < this.trailPoints.length; i++) {
      var trailPoint = this.trailPoints[i];
      this.removeNode(trailPoint.name);
    }
    this.trailPoints.length = 0;
  },


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

    // 24 px to give room not to trigger sidebar
    this.xMin = this.size.width / 2 + 24;

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

dot.TrailDotSprite = pulse.Visual.extend({
  init: function(params){
    this._super(params);
  },

  draw: function(ctx){
    this._super(ctx);
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, 2, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fill();
  }
})

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
});

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