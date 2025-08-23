// Adapted from https://codepen.io/chengarda/pen/wRxoyB

export class CanvasManager {
  MAX_ZOOM = 5;
  MIN_ZOOM = 0.2;
  SCROLL_SENSITIVITY = 0.0005;

  /**
   * @param {HTMLCanvasElement} canvas The canvas to manage
   * @param {*} draw The callback to redraw the elements on the canvas
   */
  constructor(canvas, draw) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.draw = draw;

    this.cameraOffset = { x: 0, y: 0 }; // Automatically set to half the window (center) when first resized
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    
    this.initialPinchDistance = null;
    this.lastZoom = this.cameraZoom;

    // Rebinds "this" keyword for the handlers
    this.redraw = this.redraw.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.adjustZoom = this.adjustZoom.bind(this);

    // Registers the events
    window.addEventListener("resize", this.onResize);
    canvas.addEventListener("mousedown", this.onPointerDown);
    canvas.addEventListener("mousemove", this.onPointerMove);
    canvas.addEventListener("mouseup", this.onPointerUp);
    canvas.addEventListener("touchstart", (event) => this.handleTouch(event, this.onPointerDown));
    canvas.addEventListener("touchmove", (event) => this.handleTouch(event, this.onPointerMove));
    canvas.addEventListener("touchend", (event) => this.handleTouch(event, this.onPointerUp));
    canvas.addEventListener("wheel", this.adjustZoom);

    console.log("Canvas events registered");
    this.reset();
  }

  redraw() {
    this.ctx.reset();

    // Translate to the canvas centre before zooming - so you'll always zoom on what you're looking directly at
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.scale(this.cameraZoom, this.cameraZoom);
    this.ctx.translate(
      -this.canvas.width / 2 + this.cameraOffset.x,
      -this.canvas.height / 2 + this.cameraOffset.y
    );

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.draw(this.ctx);
  }

  reset() {
    this.canvas.width = document.body.clientWidth;
    this.canvas.height = document.body.clientHeight;
    this.cameraOffset = { x: document.body.clientWidth / 2, y: document.body.clientHeight / 2 };
    this.cameraZoom = 1;
    
    this.redraw();
  }

  /**
   * Get the location of an event.
   * @param {TouchEvent} event - The triggering event.
   * @returns {Coordinates} The coordinates where the even happened.
   */
  getEventLocation(event) {
    if (event.touches && event.touches.length == 1) {
      // Touch
      return { x: event.touches[0].clientX, y: event.touches[0].clientY };
    } else if (event.clientX && event.clientY) {
      // Mouse
      return { x: event.clientX, y: event.clientY };
    }
  }

  /**
   * Set the new size for the canvas.
   * @param {Event} event - The triggering event.
   */
  onResize(event) {
    const old_width = this.canvas.width;
    const old_height = this.canvas.height;
    const new_width = document.body.clientWidth;
    const new_height = document.body.clientHeight;
    this.canvas.width = new_width;
    this.canvas.height = new_height;

    this.cameraOffset.x -= (old_width - new_width) / 2;
    this.cameraOffset.y -= (old_height - new_height) / 2;

    this.redraw();
  }

  /**
   * Set the initial drag location.
   * @param {TouchEvent|MouseEvent} event - The triggering event.
   */
  onPointerDown(event) {
    this.isDragging = true;
    this.dragStart.x = this.getEventLocation(event).x / this.cameraZoom - this.cameraOffset.x;
    this.dragStart.y = this.getEventLocation(event).y / this.cameraZoom - this.cameraOffset.y;
  }

  /**
   * Set the camera offset when moving.
   * @param {TouchEvent|MouseEvent} event - The triggering event.
   */
  onPointerMove(event) {
    if (!this.isDragging) return;
    this.cameraOffset.x = this.getEventLocation(event).x / this.cameraZoom - this.dragStart.x;
    this.cameraOffset.y = this.getEventLocation(event).y / this.cameraZoom - this.dragStart.y;

    requestAnimationFrame(this.redraw);
  }

  /**
   * Stop dragging.
   * @param {TouchEvent|MouseEvent} event - The triggering event.
   */
  onPointerUp(event) {
    this.isDragging = false;
    // Touch
    this.initialPinchDistance = null;
    this.lastZoom = this.cameraZoom;
  }

  /**
   * Handle touches on the screen.
   * @param {TouchEvent} event - The triggering event.
   * @param {*} singleTouchHandler - The handler for single touch.
   */
  handleTouch(event, singleTouchHandler) {
    if (event.touches.length == 1) {
      this.singleTouchHandler(event);
    } else if (event.type == "touchmove" && event.touches.length == 2) {
      this.isDragging = false;
      this.handlePinch(event);
    }
  }

  /**
   * Handle pinching with two fingers.
   * @param {TouchEvent} event - The triggering event (second finger).
   */
  handlePinch(event) {
    event.preventDefault();

    let touch1 = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    let touch2 = { x: event.touches[1].clientX, y: event.touches[1].clientY };

    // This is distance squared, but no need for an expensive sqrt as it's only used in ratio
    let currentDistance = (touch1.x - touch2.x) ** 2 + (touch1.y - touch2.y) ** 2;

    if (this.initialPinchDistance == null) {
      this.initialPinchDistance = currentDistance;
    }

    this.cameraZoom = (this.lastZoom * currentDistance) / this.initialPinchDistance;
    this.cameraZoom = Math.min(this.cameraZoom, this.MAX_ZOOM);
    this.cameraZoom = Math.max(this.cameraZoom, this.MIN_ZOOM);

    requestAnimationFrame(this.redraw);
  }

  /**
   * Zoom in or out.
   * @param {WheelEvent} event - The scrolling event.
   */
  adjustZoom(event) {
    if (this.isDragging) return;
    this.cameraZoom -= event.deltaY * this.SCROLL_SENSITIVITY;
    this.cameraZoom = Math.min(this.cameraZoom, this.MAX_ZOOM);
    this.cameraZoom = Math.max(this.cameraZoom, this.MIN_ZOOM);

    requestAnimationFrame(this.redraw);
  }
}
