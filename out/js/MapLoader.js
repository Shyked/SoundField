(function() {

  var DEFAULT_MAP_PATH = "resources/maps/";
  var DEFAULT_TILES_PATH = "resources/tiles/";
  var DEFAULT_AUDIO_PATH = "resources/audio/";
  var DEFAULT_SKIN_PATH = "resources/skins/";

  class MapLoader extends EventHandler {

    constructor() {
      super();
    }

    async load(mapName) {
      var json = await JsonLoader(DEFAULT_MAP_PATH + mapName + ".json");
      for (let i in json.tiles)
        json.tiles[i] = DEFAULT_TILES_PATH + json.tiles[i];
      for (let i in json.elements) {
        if (json.elements[i].sound)
          json.elements[i].sound = DEFAULT_AUDIO_PATH + json.elements[i].sound;
        if (json.elements[i].skin)
          json.elements[i].skin = DEFAULT_SKIN_PATH + json.elements[i].skin + ".png";
      }
      if (json.listener.skin)
        json.listener.skin = DEFAULT_SKIN_PATH + json.listener.skin + ".png";
      return new MapProps(json.layout, json.tiles, json.tilesCollisions, json.elements, json.listener);
    };

    destroy() {
      this._trigger('destroy');
    };

  }

  class MapProps {

    constructor(layout, tiles, tilesCollisions, elements, listener) {
      this.layout = [];
      for (let x in layout) {
        let line = [];
        for (let z in layout[x]) {
          let column = [];
          for (let y in layout[x][z]) {
            column.push(layout[x][z][y]);
          }
          line.push(column);
        }
        this.layout.push(line);
      }

      this.tiles = [];
      for (let i in tiles) {
        this.tiles.push(tiles[i]);
      }

      this.tilesCollisions = [];
      for (let i in tilesCollisions) {
        this.tilesCollisions.push(tilesCollisions[i]);
      }

      this.elements = [];
      for (let i in elements) {
        let el = elements[i];
        el.options = el.options || {};
        this.elements.push({
          sound: el.sound,
          skin: el.skin,
          pos: {
            x: el.pos.x,
            y: el.pos.y,
            z: el.pos.z
          },
          options: {
            collision: typeof el.options.collision != "undefined" ? el.options.collision : 0
          }
        });
      }

      this.listener = {
        skin: listener.skin,
        pos: {
          x: listener.pos.x,
          y: listener.pos.y,
          z: listener.pos.z
        }
      };

    }

  }

  window.MapLoader = new MapLoader();

})();
