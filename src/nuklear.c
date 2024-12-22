#include <string.h>

//#define NK_PRIVATE

#define NK_MEMSET memset

#define NK_INCLUDE_FIXED_TYPES

#define NK_INCLUDE_DEFAULT_ALLOCATOR

#define NK_INCLUDE_STANDARD_IO

#define NK_INCLUDE_STANDARD_VARARGS

#define NK_INCLUDE STANDARD_BOOL

//#define NK_INCLUDE_VERTEX_BUFFER_OUTPUT

// #define NK_INCLUDE_FONT_BAKING

// #define NK_INCLUDE_DEFAULT_FONT

//#define NK_INCLUDE_COMMAND_USERDATA

#define NK_BUTTON_TRIGGER_ON_RELEASE

//#define NK_ZERO_COMMAND_MEMORY

#define NK_UNIT_DRAW_INDEX

#define NK_KEYSTATE_BASED_INPUT


#define NK_IMPLEMENTATION
#include "nuklear.h"

/* Only need these includes for the demos */
#include <time.h>
#include <limits.h>
#include <math.h>
#include <string.h> /* memcpy */
//#include "demo/common/style.c"
#include "demo/common/calculator.c"
#include "demo/common/canvas.c"
#include "demo/common/overview.c"
#include "demo/common/node_editor.c"



typedef struct nk_glfont_st {
  float width;
} *nk_glfont_t;

float nk_glfont_width_calc(nk_handle handle, float height, const char *text, int len)
{
  //struct nk_glfont_st glfont;
  //memcpy(&glfont, handle.ptr, sizeof(glfont));
  return (float)len * 10.657f;
}

struct nk_user_font * alloc_nk_glfont(float height, float width)
{
  struct nk_user_font *font = malloc(sizeof(struct nk_user_font) + sizeof(struct nk_glfont_st));
  struct nk_glfont_st glfont;
  font->userdata.ptr = font + sizeof(struct nk_user_font);
  font->height = height;
  font->width = nk_glfont_width_calc;
  glfont.width = width;
  memcpy(font->userdata.ptr, &glfont, sizeof(glfont));
  return font;
}

extern void nk_wasm_command_scissor(short x, short y, unsigned short w, unsigned short h);

extern void nk_wasm_command_line(unsigned short line_thickness, short x0, short y0, short x1, short y1, const struct nk_color *color);

extern void nk_wasm_command_curve(const struct nk_command_curve *q);

extern void nk_wasm_command_rect(unsigned short rounding, unsigned short line_thickness, short x, short y, unsigned short w, unsigned short h, const struct nk_color *color);

extern void nk_wasm_command_rect_filled(unsigned short rounding, short x, short y, unsigned short w, unsigned short h, const struct nk_color *color);

extern void nk_wasm_command_rect_multi_color(short x, short y, unsigned short w, unsigned short h, const struct nk_color *left, const struct nk_color *top, const struct nk_color *bottom, const struct nk_color *right);

extern void nk_wasm_command_circle(const struct nk_command_circle *c);

/*
    short x, y;
    unsigned short w, h;
    struct nk_color color;
*/
extern void nk_wasm_command_circle_filled(short x, short y, unsigned short w, unsigned short h, const struct nk_color *color);

extern void nk_wasm_command_arc(const struct nk_command_arc *c);
extern void nk_wasm_command_arc_filled(const struct nk_command_arc_filled *c);
extern void nk_wasm_command_triangle(const struct nk_command_triangle *t);

/*
    struct nk_vec2i a; //struct nk_vec2i {short x, y;};
    struct nk_vec2i b;
    struct nk_vec2i c;
    struct nk_color color;
*/
extern void nk_wasm_command_triangle_filled(short x0, short y0, short x1, short y1, short x2, short y2, const struct nk_color *color);

extern void nk_wasm_command_polygon(const struct nk_command_polygon *p);
extern void nk_wasm_command_polygon_filled(const struct nk_command_polygon_filled *p);
extern void nk_wasm_command_polyline(const struct nk_command_polyline *p);

/*
    const struct nk_user_font *font;
    struct nk_color background;
    struct nk_color foreground;
    short x, y;
    unsigned short w, h;
    float height;
    int length;
    char string[1];
*/
extern void nk_wasm_command_text(const struct nk_user_font *font, const struct nk_color *background, const struct nk_color *foreground, short x, short y, unsigned short w, unsigned short h, float height, int length, const char *string);

extern void nk_wasm_command_image(const struct nk_command_image *i);
extern void nk_wasm_command_custom(const struct nk_command_custom *c);

void nk_wasm_draw(struct nk_context *ctx)
{
  const struct nk_command *cmd = 0;
  int i;
  nk_foreach(cmd, ctx) {
    switch(cmd->type) {
      case NK_COMMAND_NOP: break;
      case NK_COMMAND_SCISSOR: {
          const struct nk_command_scissor *s = (const struct nk_command_scissor*)cmd;
          nk_wasm_command_scissor(s->x, s->y, s->w, s->h);
      } break;
      case NK_COMMAND_LINE: {
          const struct nk_command_line *l = (const struct nk_command_line*)cmd;
          nk_wasm_command_line(l->line_thickness, l->begin.x, l->begin.y, l->end.x, l->end.y, &l->color);
      } break;
      case NK_COMMAND_CURVE: {
          const struct nk_command_curve *q = (const struct nk_command_curve*)cmd;
          nk_wasm_command_curve(q);
      } break;
      case NK_COMMAND_RECT: {
          const struct nk_command_rect *r = (const struct nk_command_rect*)cmd;
	  nk_wasm_command_rect(r->rounding, r->line_thickness, r->x, r->y, r->w, r->h, &r->color);
      } break;
      case NK_COMMAND_RECT_FILLED: {
          const struct nk_command_rect_filled *r = (const struct nk_command_rect_filled*)cmd;
	  nk_wasm_command_rect_filled(r->rounding, r->x, r->y, r->w, r->h, &r->color);
      } break;
      case NK_COMMAND_RECT_MULTI_COLOR: {
          const struct nk_command_rect_multi_color *r = (const struct nk_command_rect_multi_color*)cmd;
           nk_wasm_command_rect_multi_color(r->x, r->y, r->w, r->h, &r->left, &r->top, &r->bottom, &r->right);
      } break;
      case NK_COMMAND_CIRCLE: {
          const struct nk_command_circle *c = (const struct nk_command_circle*)cmd;
          nk_wasm_command_circle(c);
      } break;
      case NK_COMMAND_CIRCLE_FILLED: {
          const struct nk_command_circle_filled *c = (const struct nk_command_circle_filled *)cmd;
          nk_wasm_command_circle_filled(c->x, c->y, c->w, c->h, &c->color);
      } break;
      case NK_COMMAND_ARC: {
          const struct nk_command_arc *c = (const struct nk_command_arc*)cmd;
	  nk_wasm_command_arc(c);
      } break;
      case NK_COMMAND_ARC_FILLED: {
          const struct nk_command_arc_filled *c = (const struct nk_command_arc_filled*)cmd;
	  nk_wasm_command_arc_filled(c);
      } break;
      case NK_COMMAND_TRIANGLE: {
          const struct nk_command_triangle *t = (const struct nk_command_triangle*)cmd;
          nk_wasm_command_triangle(t);
      } break;
      case NK_COMMAND_TRIANGLE_FILLED: {
          const struct nk_command_triangle_filled *t = (const struct nk_command_triangle_filled*)cmd;
          nk_wasm_command_triangle_filled(t->a.x, t->a.y, t->b.x, t->b.y, t->c.x, t->c.y, &t->color);
      } break;
      case NK_COMMAND_POLYGON: {
          const struct nk_command_polygon*p = (const struct nk_command_polygon*)cmd;
          nk_wasm_command_polygon(p);
      } break;
      case NK_COMMAND_POLYGON_FILLED: {
          const struct nk_command_polygon_filled *p = (const struct nk_command_polygon_filled*)cmd;
          nk_wasm_command_polygon_filled(p);
      } break;
      case NK_COMMAND_POLYLINE: {
          const struct nk_command_polyline *p = (const struct nk_command_polyline*)cmd;
	  nk_wasm_command_polyline(p);
      } break;
      case NK_COMMAND_TEXT: {
          const struct nk_command_text *t = (const struct nk_command_text*)cmd;
	  nk_wasm_command_text(t->font, &t->background, &t->foreground, t->x, t->y, t->w, t->h, t->height, t->length, t->string);
      } break;
      case NK_COMMAND_IMAGE: {
          const struct nk_command_image *i = (const struct nk_command_image*)cmd;
	  nk_wasm_command_image(i);
      } break;
      case NK_COMMAND_CUSTOM: {
          const struct nk_command_custom *c = (const struct nk_command_custom*)cmd;
	  nk_wasm_command_custom(c);
      } break;
      default: break;
    }
  }
  nk_clear(ctx);
}

float nk_color_r(const struct nk_color *color) { return (float)color->r/255.0f; }
float nk_color_g(const struct nk_color *color) { return (float)color->g/255.0f; }
float nk_color_b(const struct nk_color *color) { return (float)color->b/255.0f; }
float nk_color_a(const struct nk_color *color) { return (float)color->a/255.0f; }

nk_bool nk_wasm_begin(struct nk_context *ctx, const char *title, float x, float y, float w, float h, nk_flags flags)
{
  struct nk_rect r = { x, y, w, h };
  return nk_begin(ctx, title, nk_rect(x,y,w,h), flags);
}

void nk_wasm_draw_calculator(struct nk_context *ctx)
{
  calculator(ctx);
}

void nk_wasm_draw_canvas(struct nk_context *ctx)
{
  canvas(ctx);
}

void nk_wasm_draw_overview(struct nk_context *ctx)
{
  overview(ctx);
}

void nk_wasm_draw_node_editor(struct nk_context *ctx)
{
  node_editor(ctx);
}

float test_f(float a)
{
  return 2.5 * a;
}

unsigned char malloc_memory[1000000];
size_t tail = 0;

void *my_malloc(size_t size)
{
  size_t curtail = tail;
  tail = tail + size;
  size_t off = 8 - (tail % 8);

  if (off < 8) {
    tail += off;
  }
  return &malloc_memory[curtail];
}
