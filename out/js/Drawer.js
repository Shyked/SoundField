(function() {

  class Drawer extends EventHandler {

    constructor() {
      super();
      this._mapProps = null;

      this._context = null;
      this._tileField = null;
      this._zoom = 0.8;

      this._depth = 0;

      this._context = CanvasControl.create("canvasBoard", window.innerWidth, window.innerHeight, {
        display: "block",
        marginLeft: "auto",
        marginRight: "auto"
      });

      this._initEvents();
    }

    _initEvents() {
      this._registerEvent(
        window, 'resize',
        this._onresize);
    }

    _onresize() {
      CanvasControl.update(window.innerWidth, window.innerHeight);
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
        tilesHeightOffset: this._mapProps.tilesHeightOffset,
        shadowSide: 1,
        filters: this._mapProps.filters
      });
      this._tileField.align("h-center", CanvasControl().width, 5, 0);
      this._tileField.align("v-center", CanvasControl().height, 5, 0);
      this._tileField.setZoom(this._zoom);

      this._depth = Math.max(this._mapProps.layout.length, this._mapProps.layout[0].length) * 2 - 1;
    }

    _getMaxY(elementsMap, dynamicDisplays) {
      let maxY = 0;
      for (let x in this._mapProps.layout) {
        for (let z in this._mapProps.layout[x]) {
          if (this._mapProps.layout[x][z].length > maxY)
            maxY = this._mapProps.layout[x][z].length;
          if (elementsMap[x][z].length > maxY)
            maxY = elementsMap[x][z].length;
          if (dynamicDisplays[x][z].length > maxY)
            maxY = dynamicDisplays[x][z].length;
        }
      }
      return maxY;
    }

    draw(elementsMap, dynamicDisplays) {
                  //this._context.globalCompositeOperation = 'source-over';
      this._context.clearRect(0, 0, CanvasControl().width, CanvasControl().height)
      let maxY = this._getMaxY(elementsMap, dynamicDisplays);
      for (let deep = 0 ; deep < this._depth ; deep++) {
        for (let line = Math.max(deep - this._mapProps.layout[0].length + 1, 0) ; line < deep + 1 && line < this._mapProps.layout.length ; line++) {
          for (let y = 0 ; y < maxY ; y++) {
            let x = line;
            let z = deep - line;

            for (let element in elementsMap[x][z][y]) {
              let display = elementsMap[x][z][y][element].getDisplay();
              if (display.img) {
                let pos = display.getPosition();
                if (!display.filteredImg) display.filteredImg = this._tileField.filterImg(display.img, display.shadowMask);
                this._tileField.draw(pos.x, pos.z, pos.y, display.filteredImg);
              }
            }

            if (dynamicDisplays[x][z][y]) {
              for (let displayInd in dynamicDisplays[x][z][y]) {
                let display = dynamicDisplays[x][z][y][displayInd];
                if (display.img) {
                  let pos = display.getPosition();
                  if (!display.filteredImg) display.filteredImg = this._tileField.filterImg(display.img, display.shadowMask);
                  this._tileField.draw(pos.x, pos.z, pos.y, display.filteredImg);
                  // this._context.globalCompositeOperation = 'multiply';
                }
              }
            }

            this._tileField.draw(x, z, y);

          }
        }
      }
    }

    moveCamera(x, y, z) {
      if (this._tileField) {
        let coords = this._tileField.getPixelCoords(x, z, y);
        this._tileField.setOffset(-coords.x + CanvasControl().width / 2, -coords.y + CanvasControl().height / 2);
      }
    }

    destroy() {
      this._trigger('destroy');
    }

  }

  window.Drawer = new Drawer();

})();

