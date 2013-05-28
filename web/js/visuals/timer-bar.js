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
