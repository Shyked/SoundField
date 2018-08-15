(function() {

  var DEFAULT_MAP_PATH = "resources/maps/";
  var DEFAULT_TILES_PATH = "resources/tiles/";
  var DEFAULT_AUDIO_PATH = "resources/audio/";
  var DEFAULT_SKIN_PATH = "resources/skins/";
  var DEFAULT_SKIN_SHADOW_PATH = "resources/skins/shadows/";

  class MapLoader extends EventHandler {

    constructor() {
      super();
    }

    async load(mapName) {
      var json = await JsonLoader(DEFAULT_MAP_PATH + mapName + ".json");
      if (!json.options)
        json.options = {};
      for (let i in json.tiles)
        json.tiles[i] = DEFAULT_TILES_PATH + json.tiles[i];
      for (let i in json.elements) {
        if (json.elements[i].sound)
          json.elements[i].sound = DEFAULT_AUDIO_PATH + json.elements[i].sound;
        if (json.elements[i].skin) {
          json.elements[i].shadow = DEFAULT_SKIN_SHADOW_PATH + json.elements[i].skin + ".png";
          json.elements[i].skin = DEFAULT_SKIN_PATH + json.elements[i].skin + ".png";
        }
      }
      if (json.listener.skin)
        json.listener.skin = DEFAULT_SKIN_PATH + json.listener.skin + ".png";
      if (!json.filters)
        json.filters = {};
      return new MapProps(json.layout, json.tiles, json.tilesCollisions, json.elements, json.listener, json.filters);
    };

    destroy() {
      this._trigger('destroy');
    };

  }

  class MapProps {

    constructor(layout, tiles, tilesCollisions, elements, listener, filters) {
      this.layout = layout;
      this.tiles = tiles;
      this.tilesCollisions = tilesCollisions;
      this.elements = elements;
      this.listener = listener;
      this.filters = filters;
    }

  }

  window.MapLoader = new MapLoader();

})();
