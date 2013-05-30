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

        var cleanUsername = dot.User.username.replace('.', '__');

        var userScoreRef = new Firebase('https://dotts.firebaseio.com/scores/' + cleanUsername);

        userScoreRef.update({
          kikuser: cleanUsername,
          picture: dot.User.picture,
          score: this.score,
        });

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
