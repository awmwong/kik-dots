var dot = {};
    dot.firebase = {};

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

dot.Constants = {
  Width: 0,
  Height: 0
};

dot.GameEngine = pulse.Engine.extend({
  init: function(params) {
    this._super(params);
  }
});

dot.User = {name: "Unknown", username: "kikteam", picture: null};

dot.Scores = {

  arrayOfScores: [],

  generateScoreCell: function(username, score, picture) {
  
    var picUrl;
    if (picture) {
      picUrl = 'http:' + picture;
    } else {
      picUrl = 'http://placekitten.com/48/48';
    }

    
    return "<div class='score-cell'> <img class='score-image' src='{0}'> <div class='score-text-wrapper'> <div class='score-username'>{1}</div> <div class='score-highscore'>{2}</div> </div> </div>".format(picUrl, username, score);

  },

  updateScore: function(data) {
    var kikuser = data.kikuser.replace('__', '.');
    var score = data.score;
    var picture = data.picture;

    for (var i = 0; i < this.arrayOfScores.length; i++) {
      var item = this.arrayOfScores[i];

      if (item.kikuser == kikuser) {
        this.arrayOfScores[i].score = score;
        this.arrayOfScores[i].picture = picture;
      }
    }
  },

  sortedScores: function() {

    return this.arrayOfScores.sort(function (a, b) {
      return b.score - a.score;
    });
  },

  top5: function() {
    return this.sortedScores().slice(0,5);
  },

  generateLeaderboard: function() {
    var top5scores = this.top5();

    $('#leaderboard-cell-wrapper').empty();

    for (var i = 0; i < top5scores.length; i++) {
      var item = top5scores[i];

      $('#leaderboard-cell-wrapper').append(this.generateScoreCell(item.kikuser, item.score, item.picture));      
    }

  },

  showLeaderboard: function() {
    $('#game-window').hide();
    $('#leaderboard').show();
  },

  hideLeaderboard: function() {
    $('#game-window').show();
    $('#leaderboard').hide();
  }

}

function doCardThings(){

  if (cards.browser) {
    cards.browser.setOrientationLock('portrait');

  }

  cards.kik.getUser(function(user){

    if (!user) {
      return ;
    }

    dot.User = {
      name: user.fullName,
      username: user.username,
      picture: user.thumbnail
    }

  });
  
}


dot.firebase.rootRef = new Firebase('https://dotts.firebaseio.com/');
dot.firebase.scoresRef = new Firebase('https://dotts.firebaseio.com/scores');

dot.firebase.scoresRef.on('child_added', function(snapshot) {
  var scoreData = snapshot.val();
  scoreData.kikuser = scoreData.kikuser.replace('__', '.');
  dot.Scores.arrayOfScores.push(scoreData);

  dot.Scores.generateLeaderboard();
});

dot.firebase.scoresRef.on('child_changed', function(snapshot) {
  var scoreData = snapshot.val();

  dot.Scores.updateScore(scoreData);
  dot.Scores.generateLeaderboard();
})

cards.ready(function(){

  if (cards.enabled === true) {
    doCardThings();
  }

  // var userScoreRef = new Firebase('https://dotts.firebaseio.com/scores/' + 'kikteam7');

  // userScoreRef.update({
  //   kikuser: 'kikteam7',
  //   score: 51134,
  // });

  // LEADERBOARD STUFF

  $('#leaderboard-x').tap(function() {
    dot.Scores.hideLeaderboard();
  });

  // END LEADERBOARD


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

  // Tutorial Scene
  var tutorialScene = new dot.TutorialScene();
  tutorialScene.events.bind('gameStart', function(){
    engine.scenes.deactivateScene(tutorialScene);
    gameScene.startNewGame();
    engine.scenes.activateScene(gameScene);
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

  menuScene.events.bind('tutorialStart', function(){
    engine.scenes.deactivateScene(menuScene);
    engine.scenes.activateScene(tutorialScene);

  })


  // Add and activiate the scene
  engine.scenes.addScene(gameScene);
  engine.scenes.addScene(menuScene);
  engine.scenes.addScene(tutorialScene);

  engine.scenes.activateScene(menuScene);

  // Start the update and render loop.
  // Run as fast as you can!
  engine.go(1);
  
});
