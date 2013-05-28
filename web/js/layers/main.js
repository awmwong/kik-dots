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
  },

  touchend: function(){
    for (var i = 0; i < this.trailPoints.length; i++) {
      var trailPoint = this.trailPoints[i];
      this.removeNode(trailPoint.name);
    }
    this.trailPoints.length = 0;
  },
});