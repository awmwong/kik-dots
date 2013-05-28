var dot = {};

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

cards.ready(function(){
  console.log("Cards Ready");

  if (cards.enabled === true) {
    doCardThings();
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
