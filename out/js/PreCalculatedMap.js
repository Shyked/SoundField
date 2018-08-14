/*
  Define an 3D array of collision elements
  Each cell is defined with a binary value
  - Solid (can't walk through)
  - Walkable (can walk above)
*/
class PreCalculatedMap {

  constructor(layout, tilesCollisions, elements) {
    this.tilesCollisionMap = [];
    this.elementsMap = [];

    for (let x in layout) {
      let line = [];
      let elementsLine = [];
      for (let z in layout[x]) {
        let column = [];
        let elementsColumn = [];
        for (let y in layout[x][z]) {
          if (!layout[x][z][y]) column.push(0); // Empty cell
          else column.push(tilesCollisions[layout[x][z][y] - 1]); // Use collision property of corresponding tile
          elementsColumn.push(0);
        }
        line.push(column);
        elementsLine.push(elementsColumn);
      }
      this.tilesCollisionMap.push(line);
      this.elementsMap.push(elementsLine);
    }

    for (let i in elements) {
      let pos = elements[i].getPosition();
      pos.x = Math.round(pos.x);
      pos.y = Math.round(pos.y);
      pos.z = Math.round(pos.z);
      if (!this.elementsMap[pos.x][pos.z][pos.y])
        this.elementsMap[pos.x][pos.z][pos.y] = [];
      this.elementsMap[pos.x][pos.z][pos.y].push(elements[i]);
    }
  }

}
