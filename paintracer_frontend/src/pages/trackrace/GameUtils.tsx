// Helper function to calculate orientation of ordered triplet (p, q, r).
// The function returns:
// 0 -> p, q and r are collinear
// 1 -> Clockwise
// 2 -> Counterclockwise
export interface Point{
    x: number;
    y: number;
}

enum TripOrientation {
    COL = 0,
    CLW = 1,
    CCLW = 2
}

function tripletOrientation(p: Point, q: Point, r: Point) {
    let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    if (val === 0) return TripOrientation.COL;  // Collinear
    return (val > 0) ? TripOrientation.CLW : TripOrientation.CCLW; // Clock or counterclock wise
}

// Helper function to check if point q lies on segment pr when points are collinear
function onSegment(p: Point, q: Point, r: Point) {
    return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
           q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
}

// Function to check if line segments p1q1 and p2q2 intersect
export function doIntersect(p1: Point, q1: Point, p2: Point, q2: Point) {
    if ((p1.x === q1.x && p1.y === q1.y) || (p2.x === q2.x && p2.y === q2.y)){
        return false;
    }
    // Find the four orientations needed for general and special cases
    let o1 = tripletOrientation(p1, q1, p2);
    let o2 = tripletOrientation(p1, q1, q2);
    let o3 = tripletOrientation(p2, q2, p1);
    let o4 = tripletOrientation(p2, q2, q1);

    // General case: If the orientations are different, the segments intersect
    if (o1 !== o2 && o3 !== o4) {
        return true;
    }

    // Special case 1: p1, q1 and p2 are collinear and p2 lies on segment p1q1
    if (o1 === TripOrientation.COL && onSegment(p1, p2, q1)) return true;

    // Special case 2: p1, q1 and q2 are collinear and q2 lies on segment p1q1
    if (o2 === TripOrientation.COL && onSegment(p1, q2, q1)) return true;

    // Special case 3: p2, q2 and p1 are collinear and p1 lies on segment p2q2
    if (o3 === TripOrientation.COL && onSegment(p2, p1, q2)) return true;

    // Special case 4: p2, q2 and q1 are collinear and q1 lies on segment p2q2
    if (o4 === TripOrientation.COL && onSegment(p2, q1, q2)) return true;

    // If none of the cases hold, the segments do not intersect
    return false;
}

export function rotatePoint(x: number, y: number, cx: number, cy: number, radians: number): Point {
    let cosZ = Math.cos(radians);
    let sinZ = Math.sin(radians);
    
    let newX = cx + (x - cx) * cosZ - (y - cy) * sinZ;
    let newY = cy + (x - cx) * sinZ + (y - cy) * cosZ;
    
    return {x: newX, y: newY};
}

// Function to find the endpoints of a line segment after rotation
export function rotateLine(cx: number, cy: number, len: number, rads: number) {
    // Calculate the original endpoints of the line segment
    let halfL = len / 2;
    let p1: Point = {x: cx - halfL, y: cy}; // Endpoint 1 before rotation
    let p2: Point = {x: cx + halfL, y: cy}; // Endpoint 2 before rotation

    // Rotate both points around the center (x, y) by angle z
    let rotatedP1 = rotatePoint(p1.x, p1.y, cx, cy, rads);
    let rotatedP2 = rotatePoint(p2.x, p2.y, cx, cy, rads);

    return {endpoint1: rotatedP1, endpoint2: rotatedP2};
}