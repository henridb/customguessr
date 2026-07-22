import galaxyUrl from "../assets/galaxy.svg";

// Single source of truth for the map image. To swap in the real galaxy image
// later, drop the file into src/assets/ and change this one import (Vite handles
// hashing and the GitHub Pages base path for imported assets automatically).
export const MAP_IMAGE_URL: string = galaxyUrl;

// Intrinsic aspect ratio of the map image (width / height). Used to lay out the
// map container so normalized [0,1] coordinates map cleanly onto the rendered
// image. Update this if the replacement image has different proportions.
export const MAP_ASPECT_RATIO = 1600 / 900;
