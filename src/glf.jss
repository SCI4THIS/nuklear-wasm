{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "GLFv1.0",
  "title": "glf",
  "description": "openGL Font data",
  "type": "object",
  "properties": {
    "lookup": {
      "description": "Glyph index data (points to idx)",
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "start": {
            "description": "The start offset of the glyph data",
            "type": "number"
          },
          "len": {
            "description": "The length of the glyph data",
            "type": "number"
          }
        }
      }
    },
    "idx": { 
      "description": "Glyph triangle data (points to pts)",
      "type": "array",
      "items": {
        "type": "number"
      }
    },
    "pts": {
      "description": "Glyph point data (XYST), where ST is the bezier curve weight",
      "type": "array",
      "items": {
        "type": "number"
      }
    },
    "cmap_lookup": {
      "description": "Character map lookup.  Charcode -> glyph index (points to lookup)",
      "type": "object",
      "patternProperties": {
        "^[0-9]{1,5}$": {
          "type": "number"
        }
      }
    },
  }
}
