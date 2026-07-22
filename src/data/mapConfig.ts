import galaxyUrl from "../assets/galaxy.png";

// Single source of truth for the map image. To swap in the real galaxy image
// later, drop the file into src/assets/ and change this one import (Vite handles
// hashing and the GitHub Pages base path for imported assets automatically).
export const MAP_IMAGE_URL: string = galaxyUrl;
