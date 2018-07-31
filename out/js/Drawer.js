
var Drawer = function() {

  EventHandler.apply(this);

  this._objectsDisplay = [];
  this._context = null;
  this._mapLayout = null;
  this._tileField = null;
  this._maxHeight = 0;

  this._init = function() {
    this._context = CanvasControl.create("graphicBoard", window.innerWidth, window.innerHeight, {
      display: "block",
      marginLeft: "auto",
      marginRight: "auto"
    });

    // this._mapLayout = [
    //   [[1], [1], [1], [1], [1], [1], [1], [1], [1], []],
    //   [[1], [1], [1], [1], [1], [1], [1], [1], [1], [1]],
    //   [[1], [1], [1], [1], [1], [1], [1], [1], [1], [1]],
    //   [[1], [1], [1], [1], [1], [1], [1], [1], [1], [1]],
    //   [[1], [1], [1], [1, 1, 1, 1], [1, 1, 1], [1, 0, 0 ,1], [1], [1], [1], [1]],
    //   [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1, 1], [1], [1], [0], [1], [1], [1]],
    //   [[1], [1], [1], [1, 1], [1], [1], [1], [1], [1], [1]],
    //   [[1], [1], [1], [1], [1, 1], [1], [1], [1], [1], [1]],
    //   [[1], [1], [1], [1], [1], [1], [1], [1], [1], [1]],
    //   [[1], [1], [1], [1], [1], [1], [1], [1], [1], [1]]
    //   ];

    this._mapLayout = [
      [[1], [1], [1], [1], [1], [1], [1], [1], [1], [1]],
      [[1], [1], [1], [1], [1], [1], [1], [1], [1], [1]],
      [[1], [1], [1, 1, 1, 1, 1], [1, 1, 1, 1], [1, 1], [1], [1], [1, 1], [1], [1]],
      [[1], [1], [1], [1], [1], [1], [1, 1], [1], [1], [1]],
      [[1], [1], [1, 1, 1, 1, 1], [1, 1, 1, 1], [1, 1], [1], [1], [1], [1], [1]],
      [[1], [1, 0, 0, 1], [1], [1], [1], [1], [1], [1], [1], [1]],
      [[1], [1], [1, 1], [1], [1], [1], [1], [1], [1], [1]],
      [[1, 1], [1], [1, 1], [1], [1, 1], [1], [1, 1], [1, 0, 1], [1], [1]],
      [[1, 1], [1], [1], [1], [1], [1], [1], [1], [1], [1]],
      [[1], [1, 1, 1], [1], [1], [1], [1], [1], [1], [1], [1]],
    ];

    var img = document.createElement('img');
    var img2 = document.createElement('img');
    img.onload = () => {
      this._tileField = new TileField(this._context, CanvasControl().height, CanvasControl().width);
      this._tileField.setup({
        title: "Graphics",
        zeroIsBlank: true,
        layout: this._mapLayout,
        graphics: {"grass.png": img, "grass-template.png": img2},
        graphicsDictionary: ["grass.png", "grass-template.png"], 
        tileHeight: 100,
        tileWidth: 200,
        tileEdges: 10,
        shadow: {
          offset: 100, // Offset is the same height as the stack tile
          verticalColor: '(5, 5, 30, 0.5)',
          horizontalColor: '(6, 5, 50, 0.5)',
          side: 1
        },
        // shadowDistance: {
        //   distance: 5,
        //   darkness: 1,
        //   color: "#000"
        // }
      });
      this._tileField.align("h-center", CanvasControl().width, 5, 0);
      this._tileField.align("v-center", CanvasControl().height, 5, 0);
      this._tileField.setZoom(0.5);
    };
    img.src = "img/grass.png";
    img2.src = "img/grass-template.png";
  };

  this.addObjectDisplay = function(objectDisplay) {
    this._objectsDisplay.push(objectDisplay);
  };

  this.draw = function(objectsDisplay) {
    if (this._tileField) {
      this._context.clearRect(0, 0, CanvasControl().width, CanvasControl().height);
      for (var i = 0 ; i < 10 ; i++) {
        for (var j = 0 ; j < 10 ; j++) {
          for (var k = 0 ; k < this._tileField.getMaxHeight() ; k++) {
            this._tileField.draw(i, j, k);
          }
        }
        // this._tileField.drawHorizontalShadows(k);
      }
    }
  };

  this.destroy = function() {
    this._trigger('destroy');
  };

  this._init();

};
