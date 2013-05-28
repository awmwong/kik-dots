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
});

