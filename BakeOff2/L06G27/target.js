// Target class (position and width)
class Target
{
  constructor(w, l, id, c)
  {
    this.width  = w;
    this.label  = l;
    this.id     = id;
    this.colour = c;
    this.appeared = false;
    this.correct = false;
    this.x = 0;
    this.y = 0;
  }
  
  setPosition(x, y)
  {
    this.x = x;
    this.y = y;
  }

  // Checks if a mouse click took place
  // within the target
  clicked(mouse_x, mouse_y)
  {
    return dist(this.x, this.y, mouse_x, mouse_y) < this.width / 2;
  }

  isHovering() {
    return dist(this.x, this.y, mouseX, mouseY) < this.width / 2;
  }

  // Has appeared as a trial
  hasAppeared() {
    this.appeared = true;
  }

  // Target is a hit
  isCorrect() {
    this.correct = true;
  }

  reset() {
    this.appeared = false;
    this.correct = false;
  }

  // Draws the target (i.e., a circle)
  // and its label
  draw()
  {
    const MAX_PPCM = 66.53;
    let r = this.colour[0];
    let g = this.colour[1];
    let b = this.colour[2];
    let brightness = 200;
    let font_scaler = 1.35 * PPCM/MAX_PPCM;
  

    if (this.isHovering())
      brightness = 100;

    if (this.appeared) {
      stroke(color(0, 255, 0));
      strokeWeight(5);
    }
    
    // Draws the target
    fill(color(r, g, b, brightness));
    rectMode(CENTER);
    rect(this.x, this.y, this.width * 1.25, this.width, 10);
    rectMode(CORNER);
    noStroke();

    fill(color(255, 255, 255));
    textStyle(BOLD);
    textFont('Arial', 26 * font_scaler);
    textAlign(CENTER, TOP);
    text(this.label[0]+this.label[1]+this.label[2], this.x, this.y - (30 * font_scaler));
    
    // Draw label
    textStyle(NORMAL);
    textFont('Arial', 14 * font_scaler);
    textAlign(CENTER);
    text(this.label, this.x - (this.width * 1.2 - 1.5) / 2, this.y - 5, this.width * 1.2, this.width);
  }
}