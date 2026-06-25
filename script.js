let highestZ = 1;

class Paper {
    // Use unified variables for tracking position, regardless of input type
    holdingPaper = false;
    startPointX = 0; // Unified variable for mouseTouchX/touchStartX
    startPointY = 0; // Unified variable for mouseTouchY/touchStartY
    currentPointX = 0; // Unified variable for mouseX/touchMoveX
    currentPointY = 0; // Unified variable for mouseY/touchMoveY
    prevPointX = 0; // Unified variable for prevMouseX/prevTouchX
    prevPointY = 0; // Unified variable for prevMouseY/prevTouchY
    velX = 0;
    velY = 0;
    rotation = Math.random() * 30 - 15;
    currentPaperX = 0;
    currentPaperY = 0;
    rotating = false;

    // --- HELPER FUNCTION: GET COORDINATES ---
    // Gets the X/Y position from either a MouseEvent or a TouchEvent
    getCoordinates(e) {
        if (e.touches && e.touches.length) {
            // Touch event: use the first touch point
            return {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
            };
        } else {
            // Mouse event
            return {
                x: e.clientX,
                y: e.clientY,
            };
        }
    }

    init(paper) {
        // --- 1. MOVEMENT/DRAGGING LOGIC (Combined mousemove and touchmove) ---
        const handleMove = (e) => {
            // Prevent default browser behavior (like scrolling/zooming) on touch
            if (e.type.includes("touch")) {
                e.preventDefault();
            }

            const coords = this.getCoordinates(e);
            this.currentPointX = coords.x;
            this.currentPointY = coords.y;

            if (!this.rotating) {
                // Calculate velocity (change since last recorded position)
                this.velX = this.currentPointX - this.prevPointX;
                this.velY = this.currentPointY - this.prevPointY;
            }

            // Rotation calculation logic (based on starting point)
            const dirX = this.currentPointX - this.startPointX;
            const dirY = this.currentPointY - this.startPointY;
            const dirLength = Math.sqrt(dirX * dirX + dirY * dirY);
            const dirNormalizedX = dirX / dirLength;
            const dirNormalizedY = dirY / dirLength;

            const angle = Math.atan2(dirNormalizedY, dirNormalizedX);
            let degrees = (180 * angle) / Math.PI;
            degrees = (360 + Math.round(degrees)) % 360;
            if (this.rotating) {
                this.rotation = degrees;
            }

            if (this.holdingPaper) {
                if (!this.rotating) {
                    // Update paper position
                    this.currentPaperX += this.velX;
                    this.currentPaperY += this.velY;
                }
                // Update previous point for next velocity calculation
                this.prevPointX = this.currentPointX;
                this.prevPointY = this.currentPointY;

                paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;
            }
        };

        // Attach to the document to ensure dragging continues smoothly
        document.addEventListener("mousemove", handleMove);
        document.addEventListener("touchmove", handleMove); // <--- TOUCH MOVE ADDED

        // --- 2. START DRAG LOGIC (Combined mousedown and touchstart) ---
        const handleStart = (e) => {
            if (this.holdingPaper) return;
            this.holdingPaper = true;

            paper.style.zIndex = highestZ;
            highestZ += 1;

            const coords = this.getCoordinates(e);
            this.startPointX = coords.x;
            this.startPointY = coords.y;
            this.prevPointX = coords.x;
            this.prevPointY = coords.y;

            // Check for right-click on desktop for rotation (e.button === 2)
            if (e.button === 2) {
                this.rotating = true;
            }
        };

        paper.addEventListener("mousedown", handleStart);
        paper.addEventListener("touchstart", handleStart); // <--- TOUCH START ADDED

        // --- 3. END DRAG LOGIC (Combined mouseup and touchend/touchcancel) ---
        const handleEnd = () => {
            this.holdingPaper = false;
            this.rotating = false;
        };

        window.addEventListener("mouseup", handleEnd);
        window.addEventListener("touchend", handleEnd); // <--- TOUCH END ADDED
        window.addEventListener("touchcancel", handleEnd); // <--- TOUCH CANCEL ADDED

        // --- SPECIAL ROTATION EVENTS FOR TOUCH (Two-finger gesture) ---
        // Note: 'gesturestart/end' might be deprecated or unreliable on newer mobile browsers, but kept for compatibility.
        paper.addEventListener("gesturestart", (e) => {
            e.preventDefault();
            this.rotating = true;
        });
        paper.addEventListener("gestureend", () => {
            this.rotating = false;
        });

        // --- CRITICAL CSS FIX (Inline) ---
        // Ensures the browser's default touch actions (like scrolling) don't interfere.
        paper.style.touchAction = "none";
    }
}

const papers = Array.from(document.querySelectorAll(".paper"));

papers.forEach((paper) => {
    const p = new Paper();
    p.init(paper);
});