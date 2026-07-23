// A planet or star placed on the galaxy map.
//
// Coordinates are NORMALIZED to the map image: x and y are both in [0, 1],
// where (0, 0) is the top-left corner of the image and (1, 1) the bottom-right.
// Storing them this way keeps every guess, marker, and score independent of the
// image's pixel size or how large it happens to render on screen.
export type BodyType = "planet" | "star";

export interface Body {
  /** Stable unique id (slug for seed data, crypto.randomUUID() for admin-created). */
  id: string;
  name: string;
  type: BodyType;
  /** Normalized horizontal position in [0, 1]. */
  x: number;
  /** Normalized vertical position in [0, 1]. */
  y: number;
  /** Optional flavor text shown on reveal / in the admin editor. */
  description?: string;
  /** Optional likelihood multiplier for more important planets. Must be an integer. */
  likelihood?: number;
}

/** A point on the map in normalized [0, 1] coordinates (a guess or a body). */
export interface Point {
  x: number;
  y: number;
}
