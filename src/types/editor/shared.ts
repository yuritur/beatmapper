import type { Member } from "../utils";

export const View = {
	DETAILS: "details",
	BEATMAP: "notes",
	LIGHTSHOW: "events",
	PREVIEW: "preview",
} as const;
export type View = Member<typeof View>;

export const ObjectType = {
	NOTE: "block",
	BOMB: "mine",
	OBSTACLE: "obstacle",
} as const;
export type ObjectType = Member<typeof ObjectType>;

export const ObjectTool = {
	LEFT_NOTE: "left-block",
	RIGHT_NOTE: "right-block",
	BOMB_NOTE: "mine",
	OBSTACLE: "obstacle",
} as const;
export type ObjectTool = Member<typeof ObjectTool>;

export const ObjectPlacementMode = {
	NORMAL: "original",
	EXTENSIONS: "mapping-extensions",
} as const;
export type ObjectPlacementMode = Member<typeof ObjectPlacementMode>;

export const ObjectSelectionMode = {
	SELECT: "select",
	DESELECT: "deselect",
	DELETE: "delete",
} as const;
export type ObjectSelectionMode = Member<typeof ObjectSelectionMode>;

export const EventTool = {
	ON: "on",
	OFF: "off",
	FLASH: "flash",
	FADE: "fade",
} as const;
export type EventTool = Member<typeof EventTool>;

export const EventColor = {
	PRIMARY: "red",
	SECONDARY: "blue",
	WHITE: "white",
} as const;
export type EventColor = Member<typeof EventColor>;

export const EventEditMode = {
	PLACE: "place",
	SELECT: "select",
} as const;
export type EventEditMode = Member<typeof EventEditMode>;

export const TrackType = {
	LIGHT: "blocks",
	TRIGGER: "trigger",
	VALUE: "speed",
	UNSUPPORTED: "unknown",
} as const;
export type TrackType = Member<typeof TrackType>;

export const ColorSchemeKey = {
	SABER_LEFT: "colorLeft",
	SABER_RIGHT: "colorRight",
	OBSTACLE: "obstacleColor",
	ENV_LEFT: "envColorLeft",
	ENV_RIGHT: "envColorRight",
	BOOST_LEFT: "envColorLeftBoost",
	BOOST_RIGHT: "envColorRightBoost",
} as const;
export type ColorSchemeKey = Member<typeof ColorSchemeKey>;
