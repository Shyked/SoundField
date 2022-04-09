/*  Copyright (c) 2014 Iain Hamilton

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

var TileField = function(ctx, mapWidth, mapHeight, mapLayout) {

  var tileCache = [];
  var uniqueTileCache = [];

  var title = "";
  var drawX = 0;
  var drawY = 0;

  var tileHeight = 0;
  var tileWidth = 0;
  var tileSideHeight = 0;
  var tileEdges = 0;

  var tilesHeightOffset = [];

  var maxHeight = 0;
  var lightMap = null;
  var lightX = null;
  var lightY = null;

  var shadowSide = null;
  var shadowMap = [];

  var filters = {};
  var filtersType = {}; // false for predefined filter (string), true for custom filter (object)

  var curZoom = 1;
  var mouseUsed = false;
  var applyInteractions = false;
  var focusTilePosX = 0;
  var focusTilePosY = 0;

  var alphaWhenFocusBehind =  {}; // Used for applying alpha to objects infront of focus 

  var tilesHide = null;
  var hideSettings = null;

  var particleTiles =null;
  var particleMap = [];
  var particleMapHolder = [];

  var tileImages = [];
  var tileImagesDictionary = [];

  function _setup(settings) {
    tileWidth = settings.tileWidth;
    tileHeight = settings.tileHeight;
    tileSideHeight = settings.tileSideHeight;
    tileEdges = settings.tileEdges || 0;
    lightMap = settings.lightMap;
    title = settings.title;
    applyInteractions = settings.applyInteractions;
    // 0: left | 1: right | 2: behind right | 3: behind left
    shadowSide = settings.shadowSide || 1;
    tilesHeightOffset = settings.tilesHeightOffset || [];

    if (settings.filters) {
      _setFilters(settings.filters);
    }

    if (settings.particleMap) {
      _particleTiles(settings.particleMap);
    }

    if (settings.graphics) {
      tileImages = settings.graphics;
    }
    if (settings.graphicsDictionary) {
      tileImagesDictionary = settings.graphicsDictionary;
    }

    if (settings.layout) {
      _setLayout(settings.layout, settings.width);
    }
    
    alphaWhenFocusBehind = settings.alphaWhenFocusBehind;
  }


  function _draw(i, j, k, objectImg) {

    if (objectImg || tileCache[i][j][k]) {

      let xpos, ypos, widht, height;

      if (objectImg) {
        [xpos, ypos, width, height] = _getObjectBox(i, j, k, objectImg);
      }
      else {
        width = tileCache[i][j][k].width;
        height = tileCache[i][j][k].height;
        xpos = ((i - j) * (tileWidth / 2) - tileEdges) * curZoom;
        ypos = ((i + j) * (tileHeight / 2) + k * (-tileSideHeight) - tileEdges) * curZoom;
      }

      xpos += drawX;
      ypos += drawY;


      ctx.drawImage(objectImg || tileCache[i][j][k],
        0, 0,
        width, height,
        xpos, ypos,
        width * curZoom, height * curZoom);

    }

  }

  function _getLayout() {
    return mapLayout;
  }

  function _setLayout(data, width) {
    if (width) {
      var row = [];
      var col = 0;

      mapLayout = [];
      for (var i = 0; i < data.length; i++) {
        col ++;
        if (col !== width) {
          row.push(data[i]);
        }
        else {
          row.push(data[i]);
          mapLayout.push(row);
          row = [];
          col = 0;
        }
      }
    }
    else {
      mapLayout = data;
    }

    _updateMaxHeight();
    _updateShadowMap();
    _updateTileCache();
  }

  function _setFilters(filtersOpt) {
    filters = filtersOpt;
    for (var i in filters) {
      if (typeof filters[i] == "string") filtersType[i] = false;
      else filtersType[i] = true;
    }
  }

  function _updateMaxHeight() {
    maxHeight = 0;
    var height = 0;
    for (var i in mapLayout) {
      for (var j in mapLayout[i]) {
        height = mapLayout[i][j].length;
        if (height > maxHeight) maxHeight = height;
      }
    }
  }

  function _updateShadowMap() {
    // 11111 -- top, top left, bottom left, top right, bottom right
    shadowMap = [];
    for (var i = 0 ; i < mapLayout.length ; i++) {
      var line = [];
      for (var j = 0 ; j < mapLayout[i].length ; j++) {
        line.push((new Array(mapLayout[i][j].length)).fill(0));
      }
      shadowMap.push(line);
    }
    
    var inc;
    var dir;
    switch (shadowSide) {
      case 0:
        inc = 1; dir = false; break;
      case 1:
        inc = 1; dir = true; break;
      case 2:
        inc = -1; dir = false; break;
      case 3:
        inc = -1; dir = true; break;
    }

    var process = function(i, j, k) {
      if (k < 0) return;

      var bottomAndAdjOk = 0;

      // Tile right below
      if (!_getTile(i, j, k - 1)) {
        bottomAndAdjOk++;
        if (_getTile(i - 1, j, k - 1)) dir
                                        ? shadowMap[i - 1][j][k - 1] |= 0   // 00000
                                        : shadowMap[i - 1][j][k - 1] |= 2;  // 00010
        if (_getTile(i, j - 1, k - 1)) dir
                                        ? shadowMap[i][j - 1][k - 1] |= 8   // 01000
                                        : shadowMap[i][j - 1][k - 1] |= 0;  // 00000
      }

      // Adjacent tile
      dir ? i += inc : j += inc;
      if (!_getTile(i, j, k)) {
        bottomAndAdjOk++;
        if (_getTile(i - 1, j, k)) dir
                                        ? inc == 1 &&
                                          (shadowMap[i - 1][j][k] |= 3)   // 00011
                                        : shadowMap[i - 1][j][k] |= 1;    // 00001
        if (_getTile(i, j - 1, k)) dir
                                        ? shadowMap[i][j - 1][k] |= 4     // 00100
                                        : inc == 1 &&
                                          (shadowMap[i][j - 1][k] |= 12); // 01100

        if (_getTile(i, j, k - 1))       shadowMap[i][j][k - 1] |= 16;    // 10000
      }


      // Diag tile, if at least one of precedent tiles was empty
      if (bottomAndAdjOk) {
        k--;
        if (_getTile(i, j, k) > 0) return;

        if (_getTile(i - 1, j, k)) shadowMap[i - 1][j][k] |= 3;  // 00011
        if (_getTile(i, j - 1, k)) shadowMap[i][j - 1][k] |= 12; // 01100
        if (_getTile(i, j, k - 1)) shadowMap[i][j][k - 1] |= 16; // 10000

        process(i, j, k);
      }
    };

    for (var k = 0 ; k < maxHeight ; k++) {
      for (var i = 0 ; i < mapLayout.length ; i++) {
        for (var j = 0 ; j < mapLayout[i].length ; j++) {
          if (_getTile(i, j, k)) process(i, j, k);
          if (shadowSide == 0) shadowMap[i][j][k] |= 12; // 01100
          if (shadowSide == 1) shadowMap[i][j][k] |= 3; // 00011
        }
      }
    }
  }

  function _updateTileCache() {
    tileCache = [];
    for (var i = 0 ; i < mapLayout.length ; i++) {
      var line = [];
      for (var j = 0 ; j < mapLayout[i].length ; j++) {
        line.push((new Array(mapLayout[i][j].length)).fill(0));
      }
      tileCache.push(line);
    }

    var process = function(i, j, k) {
      let graphicValue = _getGraphicValueAt(i, j, k);
      if (graphicValue == null) return;

      if (!uniqueTileCache[graphicValue]) uniqueTileCache[graphicValue] = [];
      if (!uniqueTileCache[graphicValue][shadowMap[i][j][k]]) {

        var img = tileImages[tileImagesDictionary[graphicValue]];
        
        var holderCache = document.createElement("canvas"); // Set new Buffer element
        holderCache.width = img.width;
        holderCache.height = img.height;
        var ctxCache = holderCache.getContext('2d');
        
        ctxCache.drawImage(img, 0, 0, holderCache.width, holderCache.height);

        var imageData = ctxCache.getImageData(0, 0, holderCache.width, holderCache.height);
        var data = imageData.data;

        var shadowAreas = _getShadowAreas(i, j, k);
        for (var itD = 0; itD < data.length; itD += 4) {
          var x = (itD / 4) % holderCache.width;
          var y = ((itD / 4) - x) / holderCache.width;
          var shadowPixel = false;
          for (var itA in shadowAreas) {
            if (_isPointInPolygon(shadowAreas[itA], { x: x, y: y })) shadowPixel = true;
          }
          if (shadowPixel) {
            _applyFilter("shadow", data, itD, 1);
          }
          else {
            _applyFilter("light", data, itD, 1);
          }
        }
        ctxCache.putImageData(imageData, 0, 0);

        uniqueTileCache[graphicValue][shadowMap[i][j][k]] = holderCache;

      }

      tileCache[i][j][k] = uniqueTileCache[graphicValue][shadowMap[i][j][k]];
    };

    for (var i = 0 ; i < mapLayout.length ; i++) {
      for (var j = 0 ; j < mapLayout[i].length ; j++) {
        for (var k = 0 ; k < mapLayout[i][j].length ; k++) {
          if (_getTile(i, j, k)) process(i, j, k);
        }
      }
    }
  }

  function _filterImg(img, shadowMask) {
    let filteredImg = document.createElement("canvas");
    filteredImg.width = img.width;
    filteredImg.height = img.height;
    let filteredCtx = filteredImg.getContext('2d');
    filteredCtx.drawImage(img, 0, 0, filteredImg.width, filteredImg.height);
    let filteredData = filteredCtx.getImageData(0, 0, filteredImg.width, filteredImg.height);

    if (shadowMask) {
      let maskCanvas = document.createElement("canvas");
      maskCanvas.width = shadowMask.width;
      maskCanvas.height = shadowMask.height;
      let maskCtx = maskCanvas.getContext('2d');
      maskCtx.drawImage(shadowMask, 0, 0, filteredImg.width, filteredImg.height);
      let maskData = maskCtx.getImageData(0, 0, filteredImg.width, filteredImg.height);

      for (var itD = 0; itD < filteredData.data.length; itD += 4) {
        if (filters.light) {
          _applyFilter("light", filteredData.data, itD, 1 - maskData.data[itD + 3] / 255);
        }
        if (filters.shadow) {
          _applyFilter("shadow", filteredData.data, itD, maskData.data[itD + 3] / 255);
        }
      }
    }
    else {
      for (var itD = 0; itD < filteredData.data.length; itD += 4) {
        _applyFilter("light", filteredData.data, itD, 1);
      }
    }

    filteredCtx.putImageData(filteredData, 0, 0);

    return filteredImg;
  }

  function _applyFilter(filterName, data, i, alpha) {
    if (filters[filterName]) {
      if (filtersType[filterName]) _customFilter(filters[filterName], data, i, alpha);
      else _pxFilters[filters[filterName]](data, i, alpha);
    }
  }

  var _pxFilters = {
    blueShadow: function(data, i, alpha) {
      data[i]     = _computeFilter(data[i]    , 0.6, 0, alpha);
      data[i + 1] = _computeFilter(data[i + 1], 0.7, 0, alpha);
      data[i + 2] = _computeFilter(data[i + 2], 1.6, 0, alpha);
    },
    darkShadow: function(data, i, alpha) {
      data[i]     = _computeFilter(data[i]    , 0.4, -20, alpha);
      data[i + 1] = _computeFilter(data[i + 1], 0.6, -10, alpha);
      data[i + 2] = _computeFilter(data[i + 2], 1, -10, alpha);
    },
    sunset: function(data, i, alpha) {
      data[i]     = _computeFilter(data[i]    , 1.2, 10, alpha);
      // data[i + 1] *= 1;
      // data[i + 2] *= 1;
    },
    moonlight: function(data, i, alpha) {
      // data[i]     = data[i]     * (1 - 0.5 * alpha) + 0 * alpha;
      // data[i + 1] = data[i + 1] * (1 - 0.3 * alpha) + 10 * alpha;
      // data[i + 2] = data[i + 1] * (1 - 0.1* alpha) + 10 * alpha;
      data[i]     = _computeFilter(data[i]    , 0.6, 0, alpha);
      data[i + 1] = _computeFilter(data[i + 1], 1, 0, alpha);
      data[i + 2] = _computeFilter(data[i + 2], 1.6, 30, alpha);
    }
  };

  function _customFilter(filter, data, i, alpha) {
    data[i]     = _computeFilter(data[i]    , filter.r.factor, filter.r.offset, alpha);
    data[i + 1] = _computeFilter(data[i + 1], filter.g.factor, filter.g.offset, alpha);
    data[i + 2] = _computeFilter(data[i + 2], filter.b.factor, filter.b.offset, alpha);
  }

  function _computeFilter(data, factor, offset, alpha) {
    return (data * factor + offset) * alpha + data * (1 - alpha);
  }

  function _getShadowAreas(i, j, k) {

    var graphicValue = _getGraphicValueAt(i, j, k);
    if (graphicValue == null) return null;

    var stackGraphic = tileImages[tileImagesDictionary[graphicValue]];
    if (!stackGraphic) return null;

    let tempTileSideHeight = tileSideHeight - tilesHeightOffset[graphicValue][0] + tilesHeightOffset[graphicValue][1];
    var xpos = tileEdges;
    var ypos = tileEdges + tilesHeightOffset[graphicValue][0];
    var shadowFlags = _getShadowFlags(i, j, k);
    var corners = _getCubeCorners(xpos, ypos, tempTileSideHeight);

    var areas = [];

    var points = [];

    points = [];

    if (shadowFlags & 12) { // 01100
      switch (shadowFlags & 12) {
        case 12: // 01100 Full shadow
          points.push({ x: corners[2].x, y: corners[2].y });
          points.push({ x: corners[4].x, y: corners[4].y });
          points.push({ x: corners[7].x, y: corners[7].y });
          points.push({ x: corners[5].x, y: corners[5].y });
          _zoomPolygon(points, 2, corners[4]);
          break;
        case 8: // 01000 Top of the side
          points.push({ x: corners[2].x, y: corners[2].y });
          points.push({ x: corners[4].x, y: corners[4].y });
          if (shadowSide == 1) points.push({ x: corners[7].x, y: corners[7].y });
          if (shadowSide == 3) points.push({ x: corners[5].x, y: corners[5].y });
          break;
        case 4: // 00100 Bottom of the side
          points.push({ x: corners[5].x, y: corners[5].y });
          points.push({ x: corners[7].x, y: corners[7].y });
          if (shadowSide == 1) points.push({ x: corners[2].x, y: corners[2].y });
          if (shadowSide == 3) points.push({ x: corners[4].x, y: corners[4].y });
          _zoomPolygon(points, 2, { x: (corners[2].x + corners[7].x) / 2, y: (corners[2].y + corners[7].y) / 2 });
          break;
      }
    }

    if (points.length > 2) areas.push(points);

    points = [];

    if (shadowFlags & 3) { // 00011
      switch (shadowFlags & 3) {
        case 3: // 00011 Full shadow
          points.push({ x: corners[4].x, y: corners[4].y });
          points.push({ x: corners[3].x, y: corners[3].y });
          points.push({ x: corners[6].x, y: corners[6].y });
          points.push({ x: corners[7].x, y: corners[7].y });
          _zoomPolygon(points, 2, corners[4]);
          break;
        case 2: // 00010 Top of the side
          points.push({ x: corners[4].x, y: corners[4].y });
          points.push({ x: corners[3].x, y: corners[3].y });
          if (shadowSide == 0) points.push({ x: corners[7].x, y: corners[7].y });
          if (shadowSide == 2) points.push({ x: corners[6].x, y: corners[6].y });
          break;
        case 1: // 00001 Bottom of the side
          points.push({ x: corners[7].x, y: corners[7].y });
          points.push({ x: corners[6].x, y: corners[6].y });
          if (shadowSide == 0) points.push({ x: corners[3].x, y: corners[3].y });
          if (shadowSide == 2) points.push({ x: corners[4].x, y: corners[4].y });
          _zoomPolygon(points, 2, { x: (corners[3].x + corners[7].x) / 2, y: (corners[3].y + corners[7].y) / 2 });
          break;
      }
    }

    if (points.length > 2) areas.push(points);


    if (shadowFlags & 16) {
      points = [];

      points.push({ x: corners[1].x, y: corners[1].y });
      points.push({ x: corners[3].x, y: corners[3].y });
      points.push({ x: corners[4].x, y: corners[4].y });
      points.push({ x: corners[2].x, y: corners[2].y });
      _zoomPolygon(points, 2, corners[4]);

      if (points.length > 2) areas.push(points);
    }

    return areas;
  }

  function _isPointInPolygon(polygon, point) {
    var c = false;
    for (var i = 0, j = polygon.length - 1 ; i < polygon.length ; j = i++) {
      if ( ((polygon[i].y > point.y) != (polygon[j].y > point.y)) &&
       (point.x < (polygon[j].x - polygon[i].x) * (point.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x) )
         c = !c;
    }
    return c;
  }

  function _getCubeCorner(xpos, ypos, tileSideHeight, corner, takeTileEdges) {
    /*
              1
             _o_
          _—¯   ¯—_
      2 o_         _o 3
        | ¯—_   _—¯ |
        |     o 4   |
      5 o_    |    _o 6
          ¯—_ | _—¯
             ¯o¯
              7
    */
    if (typeof takeTileEdges == "undefined") takeTileEdges = false;
    var te = takeTileEdges ? tileEdges : 0;

    switch (corner) {
      case 1:
        return { x: xpos + (tileWidth / 2 * curZoom), y: ypos + (-te * curZoom) };
      case 2:
        return { x: xpos + (-te * curZoom), y: ypos + ((-te * tileHeight / tileWidth + tileHeight / 2) * curZoom) };
      case 3:
        return { x: xpos + ((te + tileWidth) * curZoom), y: ypos + ((-te * tileHeight / tileWidth + tileHeight / 2) * curZoom) };
      case 4:
        return { x: xpos + (tileWidth / 2 * curZoom), y: ypos + (tileHeight) * curZoom };
      case 5:
        return { x: xpos + (-te * curZoom), y: ypos + ((-te * tileHeight / tileWidth + tileHeight / 2 + tileSideHeight) * curZoom) };
      case 6:
        return { x: xpos + ((te + tileWidth) * curZoom), y: ypos + (te * tileHeight / tileWidth + tileHeight / 2 + tileSideHeight) * curZoom };
      case 7:
        return { x: xpos + (tileWidth / 2 * curZoom), y: ypos + ((te + tileHeight + tileSideHeight) * curZoom) };
      default:
        throw "Unknown cube corner: " + corner;
    }

  }

  function _getCubeCorners(xpos, ypos, tileSideHeight) {
    var corners = {};
    for (var i = 1 ; i <= 7 ; i++) {
      corners[i] = _getCubeCorner(xpos, ypos, tileSideHeight, i);
    }
    return corners;
  }

  function _zoomPolygon(polygon, zoom, center) {
    for (var id in polygon) {
      polygon[id].x = (polygon[id].x - center.x) * zoom + center.x;
      polygon[id].y = (polygon[id].y - center.y) * zoom + center.y;
    }
  }

  function _getGraphicValueAt(i, j, k) {
    var graphicValue = (mapLayout[i] ? (mapLayout[i][j] ? mapLayout[i][j][k] : null) : null);
    if (!graphicValue) return null;
    return graphicValue - 1;
  }

  function _getMaxHeight() {
    return maxHeight;
  }

  function _getTile(i, j, k) {
    if (mapLayout[i] && mapLayout[i][j]) {
      return mapLayout[i][j][k];
    }
    else return null;
  }

  function _getShadowFlags(i, j, k) {
    if (shadowMap[i] && shadowMap[i][j]) {
      return shadowMap[i][j][k];
    }
    else return null;
  }

  function _getObjectBox(i, j, k, objectImg) {
    let width = objectImg.width;
    let height = objectImg.height;
    let xpos = ((i - j) * (tileWidth / 2) + (tileWidth - width) / 2) * curZoom;
    let ypos = ((i + j) * (tileHeight / 2) + (k - 1) * (-tileSideHeight) + tileHeight - height) * curZoom;
    return [xpos, ypos, width, height];
  }

  function _setZoom(dir) {
    if (Number(dir)) {
      curZoom = dir;
    }
    else if (dir === "in") {
      if (curZoom  + 0.1 <= 1) {
        curZoom += 0.1;
      }
      else {
        curZoom = 1;
      }
    }else if (dir === "out") {
      if (curZoom - 0.1 > 0.1) {
        curZoom -= 0.1;
      }
      else {
        curZoom = 0.1;
      }
    }
  }

  function _getTilePos(x, y) {
    var  xpos, ypos;
    xpos = (x - y) * (tileHeight * curZoom) + drawX;
    ypos = (x + y) * (tileWidth / 4 * curZoom) + drawY;
    return {x: xpos, y: ypos};
  }

  function _getXYCoords(x, y) {
    var positionY, positionX;
    positionY = (2 * (y - drawY) - x + drawX) / 2;
    positionX = x + positionY - drawX - (tileHeight * curZoom);
    positionY = Math.round(positionY / (tileHeight * curZoom));
    positionX = Math.round(positionX / (tileHeight * curZoom));
    return({x: positionX, y: positionY});
  }

  function _getPixelCoords(i, j, k) {
    return {
      x: ((i - j) * (tileWidth / 2) + tileWidth / 2) * curZoom,
      y: ((i + j) * (tileHeight / 2) + (k - 1) * (-tileSideHeight) + tileHeight) * curZoom
    };
  }

  // function _setTile(x, y, val) {
  //   if (!mapLayout[x]) {
  //     mapLayout[x] = [];
  //   }
  //   mapLayout[x][y] = val;

  // }


  function _align(position, screenDimension, size, offset) {
    switch(position) {
      case "h-center":
        drawX = (screenDimension / 2) - ((tileWidth / 4  * size) * curZoom) / (size / 2);
      break;
      case "v-center":
        drawY = (screenDimension / 2) - ((tileHeight/2 * size) * curZoom) - ((offset * tileHeight) * curZoom) / 4;
      break;
    }
  }

  function _flip(setting) {
    if (particleTiles) {
    // -- particleMap = JsisoUtils.flipTwoDArray(particleMap, setting);
    }
    _setLayout(JsisoUtils.flipTwoDArray(mapLayout, setting));

  }

  function _rotate(setting) {
    if (particleTiles) {
    // -- particleMap = JsisoUtils.rotateTwoDArray(particleMap, setting);
    }
    _setLayout(JsisoUtils.rotateTwoDArray(mapLayout, setting));
  }

  return {

    setup: function(settings) {
      return _setup(settings);
    },

    draw: function(i, j, k, objectImg) {
      return _draw(i, j, k, objectImg);
    },

    filterImg: function(img, shadowMask) {
      return _filterImg(img, shadowMask);
    },

    getLayout: function() {
      return _getLayout();
    },

    setLayout: function(data, width) {
      _setLayout(data, width);
    },

    getMaxHeight: function() {
      return _getMaxHeight();
    },

    getHeightLayout: function() {
      return _getHeightLayout();
    },

    getTile: function(tileX, tileY) {
      return Number(_getTile(tileX, tileY));
    },

    getHeightMapTile: function(tileX, tileY) {
      return Number(_getHeightMapTile(tileX, tileY));
    },

    setTile: function(tileX, tileY, val) {
      _setTile(tileX, tileY, val);
    },

    setHeightmapTile: function(tileX, tileY, val) {
      _setHeightmapTile(tileX, tileY, val);
    },

    getObjectBox: function(i, j, k, objectImg) {
      _getObjectBox(i, j, k, objectImg);
    },

    setZoom: function(direction) {
      // in || out
      return _setZoom(direction);
    },

    getXYCoords: function(XPosition, YPosition) {
      return _getXYCoords(XPosition, YPosition);
    },

    align: function(position, screenDimension, size, offset) {
      return _align(position, screenDimension, size, offset);
    },

    rotate: function(direction) {
      // left || right
      return _rotate(direction);
    },

    flip: function(direction) {
      // horizontal || vertical
      return _flip(direction);
    },

    setOffset: function(x, y) {
      if (x !== null) {
        drawX = x;
      }
      if (y !== null) {
        drawY = y;
      }
    },

    getTilePos: function(x, y) {
      return _getTilePos(x, y);
    },

    getPixelCoords: function(i, j, k) {
      return _getPixelCoords(i, j, k);
    },

    getOffset: function() {
      return {x: drawX, y: drawY};
    },

    move: function(direction, distance) {
      // left || right || up || down
      var particle, subPart;

      distance = distance || tileHeight;
      if (direction === "up") {
        drawY += distance / 2 * curZoom;
        drawX += distance * curZoom;
      }
      else if (direction === "down") {
        drawY += distance / 2 * curZoom;
        drawX -= distance * curZoom;
      }
      else if (direction === "left") {
        drawY -= distance / 2 * curZoom;
        drawX -= distance * curZoom;
      }
      else if (direction === "right") {
        drawY -= distance / 2 * curZoom;
        drawX += distance * curZoom;
      }
    }
  };
};
