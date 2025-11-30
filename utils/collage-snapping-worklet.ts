import { SnapLine } from '../types/collage';

export const snapToNearbyEdgesWorklet = (
    bounds: { x: number; y: number; width: number; height: number },
    otherBounds: { x: number; y: number; width: number; height: number }[],
    threshold: number
): {
    snappedX: boolean;
    snappedY: boolean;
    deltaX: number;
    deltaY: number;
    snapLines: SnapLine[];
} => {
    'worklet';
    let minDeltaX = Infinity;
    let minDeltaY = Infinity;
    let snappedX = false;
    let snappedY = false;

    // Store best snap candidates as primitives to avoid object allocation in loop
    // X-axis snap candidate
    let bestSnapX_x1 = 0;
    let bestSnapX_y1 = 0;
    let bestSnapX_x2 = 0;
    let bestSnapX_y2 = 0;

    // Y-axis snap candidate
    let bestSnapY_x1 = 0;
    let bestSnapY_y1 = 0;
    let bestSnapY_x2 = 0;
    let bestSnapY_y2 = 0;

    const boundsLeft = bounds.x;
    const boundsRight = bounds.x + bounds.width;
    const boundsCenterX = bounds.x + bounds.width / 2;

    const boundsTop = bounds.y;
    const boundsBottom = bounds.y + bounds.height;
    const boundsCenterY = bounds.y + bounds.height / 2;

    const count = otherBounds.length;
    for (let i = 0; i < count; i++) {
        const other = otherBounds[i];

        const otherLeft = other.x;
        const otherRight = other.x + other.width;
        const otherCenterX = other.x + other.width / 2;

        const otherTop = other.y;
        const otherBottom = other.y + other.height;
        const otherCenterY = other.y + other.height / 2;

        // --- Horizontal Snapping (Vertical Lines) ---
        // Check Left
        let delta = otherLeft - boundsLeft;
        if (Math.abs(delta) < threshold && Math.abs(delta) < Math.abs(minDeltaX)) {
            minDeltaX = delta;
            snappedX = true;
            bestSnapX_x1 = otherLeft;
            bestSnapX_y1 = Math.min(boundsTop, otherTop) - 20;
            bestSnapX_x2 = otherLeft;
            bestSnapX_y2 = Math.max(boundsBottom, otherBottom) + 20;
        }
        delta = otherRight - boundsLeft;
        if (Math.abs(delta) < threshold && Math.abs(delta) < Math.abs(minDeltaX)) {
            minDeltaX = delta;
            snappedX = true;
            bestSnapX_x1 = otherRight;
            bestSnapX_y1 = Math.min(boundsTop, otherTop) - 20;
            bestSnapX_x2 = otherRight;
            bestSnapX_y2 = Math.max(boundsBottom, otherBottom) + 20;
        }
        delta = otherCenterX - boundsLeft;
        if (Math.abs(delta) < threshold && Math.abs(delta) < Math.abs(minDeltaX)) {
            minDeltaX = delta;
            snappedX = true;
            bestSnapX_x1 = otherCenterX;
            bestSnapX_y1 = Math.min(boundsTop, otherTop) - 20;
            bestSnapX_x2 = otherCenterX;
            bestSnapX_y2 = Math.max(boundsBottom, otherBottom) + 20;
        }

        // Check Right
        delta = otherLeft - boundsRight;
        if (Math.abs(delta) < threshold && Math.abs(delta) < Math.abs(minDeltaX)) {
            minDeltaX = delta;
            snappedX = true;
            bestSnapX_x1 = otherLeft;
            bestSnapX_y1 = Math.min(boundsTop, otherTop) - 20;
            bestSnapX_x2 = otherLeft;
            bestSnapX_y2 = Math.max(boundsBottom, otherBottom) + 20;
        }
        delta = otherRight - boundsRight;
        if (Math.abs(delta) < threshold && Math.abs(delta) < Math.abs(minDeltaX)) {
            minDeltaX = delta;
            snappedX = true;
            bestSnapX_x1 = otherRight;
            bestSnapX_y1 = Math.min(boundsTop, otherTop) - 20;
            bestSnapX_x2 = otherRight;
            bestSnapX_y2 = Math.max(boundsBottom, otherBottom) + 20;
        }
        delta = otherCenterX - boundsRight;
        if (Math.abs(delta) < threshold && Math.abs(delta) < Math.abs(minDeltaX)) {
            minDeltaX = delta;
            snappedX = true;
            bestSnapX_x1 = otherCenterX;
            bestSnapX_y1 = Math.min(boundsTop, otherTop) - 20;
            bestSnapX_x2 = otherCenterX;
            bestSnapX_y2 = Math.max(boundsBottom, otherBottom) + 20;
        }

        // Check Center
        delta = otherLeft - boundsCenterX;
        if (Math.abs(delta) < threshold && Math.abs(delta) < Math.abs(minDeltaX)) {
            minDeltaX = delta;
            snappedX = true;
            bestSnapX_x1 = otherLeft;
            bestSnapX_y1 = Math.min(boundsTop, otherTop) - 20;
            bestSnapX_x2 = otherLeft;
            bestSnapX_y2 = Math.max(boundsBottom, otherBottom) + 20;
        }
        delta = otherRight - boundsCenterX;
        if (Math.abs(delta) < threshold && Math.abs(delta) < Math.abs(minDeltaX)) {
            minDeltaX = delta;
            snappedX = true;
            bestSnapX_x1 = otherRight;
            bestSnapX_y1 = Math.min(boundsTop, otherTop) - 20;
            bestSnapX_x2 = otherRight;
            bestSnapX_y2 = Math.max(boundsBottom, otherBottom) + 20;
        }
        delta = otherCenterX - boundsCenterX;
        if (Math.abs(delta) < threshold && Math.abs(delta) < Math.abs(minDeltaX)) {
            minDeltaX = delta;
            snappedX = true;
            bestSnapX_x1 = otherCenterX;
            bestSnapX_y1 = Math.min(boundsTop, otherTop) - 20;
            bestSnapX_x2 = otherCenterX;
            bestSnapX_y2 = Math.max(boundsBottom, otherBottom) + 20;
        }


        // --- Vertical Snapping (Horizontal Lines) ---
        // Check Top
        delta = otherTop - boundsTop;
        if (Math.abs(delta) < threshold && Math.abs(delta) < Math.abs(minDeltaY)) {
            minDeltaY = delta;
            snappedY = true;
            bestSnapY_x1 = Math.min(boundsLeft, otherLeft) - 20;
            bestSnapY_y1 = otherTop;
            bestSnapY_x2 = Math.max(boundsRight, otherRight) + 20;
            bestSnapY_y2 = otherTop;
        }
        delta = otherBottom - boundsTop;
        if (Math.abs(delta) < threshold && Math.abs(delta) < Math.abs(minDeltaY)) {
            minDeltaY = delta;
            snappedY = true;
            bestSnapY_x1 = Math.min(boundsLeft, otherLeft) - 20;
            bestSnapY_y1 = otherBottom;
            bestSnapY_x2 = Math.max(boundsRight, otherRight) + 20;
            bestSnapY_y2 = otherBottom;
        }
        delta = otherCenterY - boundsTop;
        if (Math.abs(delta) < threshold && Math.abs(delta) < Math.abs(minDeltaY)) {
            minDeltaY = delta;
            snappedY = true;
            bestSnapY_x1 = Math.min(boundsLeft, otherLeft) - 20;
            bestSnapY_y1 = otherCenterY;
            bestSnapY_x2 = Math.max(boundsRight, otherRight) + 20;
            bestSnapY_y2 = otherCenterY;
        }

        // Check Bottom
        delta = otherTop - boundsBottom;
        if (Math.abs(delta) < threshold && Math.abs(delta) < Math.abs(minDeltaY)) {
            minDeltaY = delta;
            snappedY = true;
            bestSnapY_x1 = Math.min(boundsLeft, otherLeft) - 20;
            bestSnapY_y1 = otherTop;
            bestSnapY_x2 = Math.max(boundsRight, otherRight) + 20;
            bestSnapY_y2 = otherTop;
        }
        delta = otherBottom - boundsBottom;
        if (Math.abs(delta) < threshold && Math.abs(delta) < Math.abs(minDeltaY)) {
            minDeltaY = delta;
            snappedY = true;
            bestSnapY_x1 = Math.min(boundsLeft, otherLeft) - 20;
            bestSnapY_y1 = otherBottom;
            bestSnapY_x2 = Math.max(boundsRight, otherRight) + 20;
            bestSnapY_y2 = otherBottom;
        }
        delta = otherCenterY - boundsBottom;
        if (Math.abs(delta) < threshold && Math.abs(delta) < Math.abs(minDeltaY)) {
            minDeltaY = delta;
            snappedY = true;
            bestSnapY_x1 = Math.min(boundsLeft, otherLeft) - 20;
            bestSnapY_y1 = otherCenterY;
            bestSnapY_x2 = Math.max(boundsRight, otherRight) + 20;
            bestSnapY_y2 = otherCenterY;
        }

        // Check Center
        delta = otherTop - boundsCenterY;
        if (Math.abs(delta) < threshold && Math.abs(delta) < Math.abs(minDeltaY)) {
            minDeltaY = delta;
            snappedY = true;
            bestSnapY_x1 = Math.min(boundsLeft, otherLeft) - 20;
            bestSnapY_y1 = otherTop;
            bestSnapY_x2 = Math.max(boundsRight, otherRight) + 20;
            bestSnapY_y2 = otherTop;
        }
        delta = otherBottom - boundsCenterY;
        if (Math.abs(delta) < threshold && Math.abs(delta) < Math.abs(minDeltaY)) {
            minDeltaY = delta;
            snappedY = true;
            bestSnapY_x1 = Math.min(boundsLeft, otherLeft) - 20;
            bestSnapY_y1 = otherBottom;
            bestSnapY_x2 = Math.max(boundsRight, otherRight) + 20;
            bestSnapY_y2 = otherBottom;
        }
        delta = otherCenterY - boundsCenterY;
        if (Math.abs(delta) < threshold && Math.abs(delta) < Math.abs(minDeltaY)) {
            minDeltaY = delta;
            snappedY = true;
            bestSnapY_x1 = Math.min(boundsLeft, otherLeft) - 20;
            bestSnapY_y1 = otherCenterY;
            bestSnapY_x2 = Math.max(boundsRight, otherRight) + 20;
            bestSnapY_y2 = otherCenterY;
        }
    }

    const snapLines: SnapLine[] = [];
    if (snappedX) {
        snapLines.push({
            x1: bestSnapX_x1,
            y1: bestSnapX_y1,
            x2: bestSnapX_x2,
            y2: bestSnapX_y2,
            type: 'vertical'
        });
    }
    if (snappedY) {
        snapLines.push({
            x1: bestSnapY_x1,
            y1: bestSnapY_y1,
            x2: bestSnapY_x2,
            y2: bestSnapY_y2,
            type: 'horizontal'
        });
    }

    return {
        snappedX,
        snappedY,
        deltaX: snappedX ? minDeltaX : 0,
        deltaY: snappedY ? minDeltaY : 0,
        snapLines,
    };
};
