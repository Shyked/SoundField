(function() {

  class Drawer extends EventHandler {

    constructor() {
      super();
      this._mapProps = null;

      this._objectsDisplay = [];
      this._context = null;
      this._tileField = null;
      this._zoom = 0.5;

      this._depth = 0;

      this._context = CanvasControl.create("canvasBoard", window.innerWidth, window.innerHeight, {
        display: "block",
        marginLeft: "auto",
        marginRight: "auto"
      });
    }

    async setMap(mapProps) {
      this._mapProps = mapProps;
      let imgResponse = await ImgLoader({ graphics: mapProps.tiles });

      this._tileField = new TileField(this._context, CanvasControl().height, CanvasControl().width);
      this._tileField.setup({
        title: "Graphics",
        zeroIsBlank: true,
        layout: this._mapProps.layout,
        graphics: imgResponse.files,
        graphicsDictionary: imgResponse.dictionary,
        tileHeight: 100,
        tileWidth: 200,
        tileSideHeight: 110,
        tileEdges: 10,
        shadowSide: 1
      });
      this._tileField.align("h-center", CanvasControl().width, 5, 0);
      this._tileField.align("v-center", CanvasControl().height, 5, 0);
      this._tileField.setZoom(this._zoom);

      this._depth = Math.max(this._mapProps.layout.length, this._mapProps.layout[0].length) * 2 - 1;
    }

    addObjectDisplay(objectDisplay) {
      this._objectsDisplay.push(objectDisplay);
    }

    resetObjectsDisplay() {
      this._objectsDisplay = [];
    }

    draw(elementsMap) {
      for (let deep = 0 ; deep < this._depth ; deep++) {
        for (let line = Math.max(deep - this._mapProps.layout[0].length + 1, 0) ; line < deep + 1 && line < this._mapProps.layout.length ; line++) {
          let x = line;
          let z = deep - line;
          for (let y = 0 ; y < elementsMap[x][z].length ; y++) {
            this._tileField.draw(x, z, y);
            for (let element in elementsMap[x][z][y]) {
              let pos = elementsMap[x][z][y][element].getPosition();
              this._tileField.draw(pos.x, pos.z, pos.y, elementsMap[x][z][y][element].getDisplay().img);
            }
          }
        }
      }
    }

    destroy() {
      this._trigger('destroy');
    }

  }

  window.Drawer = new Drawer();

})();

