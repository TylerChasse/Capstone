/**
 * Tutorial.js - Tutorial and Frame classes
 *
 * A Tutorial contains a list of Frames that can be navigated through.
 * Each Frame has a title, descriptive text, and an optional image.
 *
 * Usage:
 *   const tutorial = new Tutorial({
 *     id: 'my-tutorial',
 *     name: 'My Tutorial',
 *     frames: [
 *       new Frame({ title: 'Step 1', text: 'Do this...', image: myImage }),
 *       new Frame({ title: 'Step 2', text: 'Then do this...' }),
 *     ]
 *   });
 */

export class Frame {
  constructor({ title, text, image = null, highlight = null }) {
    this.title = title;
    this.text = text;
    this.image = image;
    this.highlight = highlight;
  }
}

export class Tutorial {
  constructor({ id, name, frames }) {
    this.id = id;
    this.name = name;
    this.frames = frames;
  }
}
