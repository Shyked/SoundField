/*
  Define an 3D array of collision elements
  Each cell is defined with a binary value

    Solid (can't walk through)
    | Walkable (can walk above)
    | |
    0 0
*/
class PreCalculatedMap {

  constructor(layout, tilesCollisions, elements) {
    this._dynamicDisplaysReserse = {};

    this.tilesCollisionMap = [];
    this.elementsMap = [];
    this.dynamicDisplays = [];

    for (let x in layout) {
      let line = [];
      for (let z in layout[x]) {
        let column = [];
        for (let y in layout[x][z]) {
          if (!layout[x][z][y]) column.push(0); // Empty cell
          else column.push(tilesCollisions[layout[x][z][y] - 1]); // Use collision property of corresponding tile
        }
        line.push(column);
      }
      this.tilesCollisionMap.push(line);
    }

    this._buildEmpty2DArray(this.elementsMap, layout.length, layout[0].length);
    this._buildEmpty2DArray(this.dynamicDisplays, layout.length, layout[0].length);

    for (let i in elements) {
      let pos = elements[i].getPosition();
      pos.x = Math.round(pos.x);
      pos.y = Math.round(pos.y);
      pos.z = Math.round(pos.z);
      this._fill3DArray(this.elementsMap, pos);
      this.elementsMap[pos.x][pos.z][pos.y].push(elements[i]);
    }
  }

  _buildEmpty2DArray(array, width, height) {
    for (let x = 0 ; x < width ; x++) {
      let line = [];
      for (let z = 0 ; z < height ; z++) {
        line.push([]);
      }
      array.push(line);
    }
  }

  _fill3DArray(array, pos) {
    if (!array[pos.x][pos.z][pos.y])
      array[pos.x][pos.z][pos.y] = [];
  }

  addDynamicDisplay(display) {
    let pos = display.getPosition();
    if (pos.x > 17) debugger;
    // The + 0.1 puts the display a bit ahead so it does not pass behind floor on a nearest column
    pos.x = Math.round(pos.x + 0.1);
    pos.y = Math.round(pos.y);
    pos.z = Math.round(pos.z + 0.1);
    this._fill3DArray(this.dynamicDisplays, pos);

    this.dynamicDisplays[pos.x][pos.z][pos.y].push(display);
    if (!this._dynamicDisplaysReserse[display.id]) this._dynamicDisplaysReserse[display.id] = {};
    this._dynamicDisplaysReserse[display.id].x = pos.x
    this._dynamicDisplaysReserse[display.id].y = pos.y;
    this._dynamicDisplaysReserse[display.id].z = pos.z;
  }

  updateDynamicDisplay(display) {
    let prevPos = this._dynamicDisplaysReserse[display.id];
    let displaysOnPos = this.dynamicDisplays[prevPos.x][prevPos.z][prevPos.y];
    displaysOnPos.splice(displaysOnPos.indexOf(display), 1);

    this.addDynamicDisplay(display);
  }

}
