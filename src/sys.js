
let sysjs = function (g) {

let DEBUG_FUNCTION_PRINTS = false;
let DEBUG_REALLOC         = false;
let wasm3_proto           = { };

/* UTILITY */
/*----------------------------------------------------------------------------*/

let s_printf_lf = function(modifier, data, output_type)
{
  let data_orig = data;
  let n2 = (1 << 24) * g.memory[data + 3] +
           (1 << 16) * g.memory[data + 2] +
           (1 <<  8) * g.memory[data + 1] +
           (1 <<  0) * g.memory[data + 0];
  data += 4;
  let n1 = (1 << 24) * g.memory[data + 3] +
           (1 << 16) * g.memory[data + 2] +
           (1 <<  8) * g.memory[data + 1] +
           (1 <<  0) * g.memory[data + 0];
  let sign = 0;
  if (n1 & 0x80000000) {
    sign = 1;
  }
  let exponent =  (n1 & 0x7FF00000) >> 20;
  let fraction1 = (n1 & 0x000FFFFF);
  let fraction2 = (n2);
  let fraction = ((0x00100000 | fraction1) << 32) + fraction2;
  let num = (fraction / 1048576.0) * Math.pow(2,exponent-1023);
  data += 4;
  let s = "";
  if (n1 == 0 && n2 == 0) {
    s = "0.00";
  } else {
    if (modifier == ".2") {
      s += (Math.round(num * 100) / 100).toFixed(2);
    } else {
      s += num;
    }
  }
  return { s: s, n: data - data_orig };
}

let s_printf_d = function(modifier, data, output_type)
{
  let left_align = false;
  let zero_pad = false;
  let i = 0;
  let data_orig = data;
  if (modifier[i] == '-') {
    left_align = true;
    i++;
  }
  if (modifier[i] == '0') {
    zero_pad = true;
    i++;
  }
  let width = 0;
  if (i >= modifier.length) {
  } else if (modifier[i] == '*') {
    width = (1 << 24) * g.memory[data + 3] +
            (1 << 16) * g.memory[data + 2] +
            (1 <<  8) * g.memory[data + 1] +
            (1 <<  0) * g.memory[data + 0];
    data += 4;
  } else if ('1' <= modifier[i] && modifier[i] <= '9') {
    width = Number(modifier.substr(i));
  } else {
    console.error("Unhandled modifier: " + modifier);
  }

  let n = (1 << 24) * g.memory[data + 3] +
          (1 << 16) * g.memory[data + 2] +
          (1 <<  8) * g.memory[data + 1] +
          (1 <<  0) * g.memory[data + 0];
  data += 4;

  let s;
  if (output_type == 'd') {
    s = n.toString(10);
  } else if (output_type == 'x') {
    s = n.toString(16);
  } else if (output_type == 'X') {
    s = n.toString(16).toUpperCase();
  }
  if (width != 0) {
    let adjust = width - s.length;
    for (let i=0; i<adjust; i++) {
      if (left_align) {
        s = s + " ";
      } else if (zero_pad) {
        s = "0" + s;
      } else {
        s = " " + s;
      }
    }
  }

  return { s: s, n: data - data_orig };
};

let s_from_printf = function(i32_1, i32_2, i32_3)
{
  let fmt = i32_1;
  let data = i32_2;
  let n = i32_3;
  if (n == undefined) {
    n = 0;
  }
  let s = "";
  let i = 0;
  let modifier = "";
  while (g.memory[fmt + i] != 0) {
    let c = String.fromCharCode(g.memory[fmt + i]);
    if (c != '%') {
      s += String.fromCharCode(g.memory[fmt + i]);
      i++;
      if (n > 0 && i >= n) { return s; }
      modifier = "";
      continue;
    }
    let is_modifier = false;
    i++;
    if (n > 0 && i >= n) { return s; }
    do {
      c = String.fromCharCode(g.memory[fmt + i]);
      is_modifier = false;
      switch (c) {
        case '%': s += "%"; break;
        case '-':
        case '*':
        case '.':
        case ' ':
        case '0': case '1': case '2': case '3': case '4':
        case '5': case '6': case '7': case '8': case '9':
          modifier += c;
          is_modifier = true;
          break;
        case 'f':
          res = s_printf_lf(modifier, data, c);
          data += res.n;
          s += res.s;
          break;
        case 'd':
        case 'u':
        case 'x':
        case 'X':
          res = s_printf_d(modifier, data, c);
          data += res.n;
          s += res.s;
          break;
        case 'p':
          res = s_printf_d("08X", data, 'X');
          data += res.n;
          s += "0x" + res.s;
          break;
        case 'c':
          let cc = (1 << 24) * g.memory[data + 3] +
                   (1 << 16) * g.memory[data + 2] +
                   (1 <<  8) * g.memory[data + 1] +
                   (1 <<  0) * g.memory[data + 0];
          data += 4;
          s += String.fromCharCode(cc);
          break;
        case 's':
          let s_n = (1 << 24) * g.memory[data + 3] +
                    (1 << 16) * g.memory[data + 2] +
                    (1 <<  8) * g.memory[data + 1] +
                    (1 <<  0) * g.memory[data + 0];
          data += 4;
          let s_c = g.memory[s_n];
          while (s_c != 0) {
            s += String.fromCharCode(s_c);
            s_n++;
            s_c = g.memory[s_n];
          }
          break;
        default:
          s += "%" + modifier + c;
          break;
      }
      i++;
      if (n > 0 && i >= n) { return s; }
    } while (is_modifier);
  }
  return s;
};

let str_c = function(p) {
  let s = "";
  let i = 0;
  while (g.memory[p + i] != 0) {
    s += String.fromCharCode(g.memory[p + i]);
    i++;
  }
  return s;
};

let c_str = function(s) {
  let data = malloc(s.length + 1);
  for (let i=0; i<s.length; i++) {
    g.memory[data + i] = s.charCodeAt(i);
  }
  g.memory[data + s.length] = 0;
  return data;
};

let c_getp = function(ps, i) {
  let ix = i * 4;
  let res = 0;
  for (let j=4; j-->0;) {
    res = res * 256;
    res += g.memory[ps + ix + j];
  }
  return res;
};

let c_getlp = function(ps, i) {
  let ix = i * 8;
  let res = 0;
  for (let j=8; j-->0;) {
    res = res * 256;
    res += g.memory[ps + ix + j];
  }
  return res;
};

let c_setp = function(ps, i, p) {
  let ix = i * 4;
  //for (let j=4; j-->0;) {
  for (let j=0; j<4; j++) {
    g.memory[ps + ix + j] = p % 256;
    p = p / 256;
  }
};

let c_argv = function(arr_s) {
  let data = malloc(4 * arr_s.length);
  for (let i=0; i<arr_s.length; i++) {
    let s = c_str(arr_s[i]);
    c_setp(data, i, s);
  }
  return data;
};

/* LIBRARY */
/*----------------------------------------------------------------------------*/

wasm3_proto["cos"] = "f(f)";
let cos = function (f32) {
  let ret = Math.cos(f32);
  if (DEBUG_FUNCTION_PRINTS) {
    console.log("cos(" + f32 + ") = " + ret);
  }
  return ret;
}

wasm3_proto["sin"] = "f(f)";
let sin  = function(f32) {
  let ret = Math.sin(f32);
  if (DEBUG_FUNCTION_PRINTS) {
    console.log("sin(" + f32 + ") = " + ret);
  }
  return ret;
}

wasm3_proto["fmod"] = "f(ff)";
let fmod  = function(f32_1, f32_2) {
  let ret = f32_1 % f32_2;
  if (DEBUG_FUNCTION_PRINTS) {
    console.log("fmod(" + f32_1 + "," + f32_2 + ") = " + ret);
  }
  return ret;
};

wasm3_proto["localtime"] = "*(*)"
let localtime = function (i32) {
  if (DEBUG_FUNCTION_PRINTS) {
    console.log("localtime");
  }
  let data = malloc(9 * 4);
  let dt = new Date();
  let sec = dt.getSeconds();
  let min = dt.getMinutes();
  let hour = dt.getHours();
  let mday = dt.getDate();
  let mon = dt.getMonth();
  let year = dt.getFullYear() - 1900;
  let wday = dt.getDay();
  let yday = 1;
  let is_dst = 0;
  let vals = [ sec, min, hour, mday, mon, year, wday, yday, is_dst ];
  for (let i=0; i<9; i++) {
    let val = vals[i];
    g.memory[data + 4 * i + 3] = 0;
    g.memory[data + 4 * i + 2] = 0;
    g.memory[data + 4 * i + 1] = val / 256;
    g.memory[data + 4 * i + 0] = val % 256;
  }
  return data;
};

wasm3_proto["__assert_fail"] = "v(**i*)"
let __assert_fail = function(i32_1, i32_2, i32_3, i32_4) {
  if (DEBUG_FUNCTION_PRINTS) {
    console.log("__assert_fail(" + i32_1 + "," + i32_2 + "," + i32_3 + "," + i32_4 + ")");
  }
  let assertion = str_c(i32_1);
  let file = str_c(i32_2);
  let line = i32_3;
  let func = str_c(i32_4);
  console.error(file + ":" + line + ":" + func + ":" + assertion);
  throw new Error("assert_fail");
};

wasm3_proto["time"] = "i(*)";
let time = function(i32) {
  if (DEBUG_FUNCTION_PRINTS) {
    console.log("time(" + i32 + ")");
  }
  return BigInt(Math.floor(Date.now()/1000));
};

wasm3_proto["atof"] = "i(*)";
let atof = function(i32_1) {
  let s = str_c(i32_1);
  if (DEBUG_FUNCTION_PRINTS) {
    console.log("atof(" + i32_1 + "):" + s + "=" + Number(s));
  }
  return Number(s);
}

wasm3_proto["strcpy"] = "*(**)";
let strcpy = function (i32_1, i32_2) {
  let dst = i32_1;
  let src = i32_2;
  let i   = 0;
  if (DEBUG_FUNCTION_PRINTS) {
    console.log("strcpy(" + i32_1 + "," + i32_2 + ")");
  }
  while (g.memory[src + i] != 0) {
    g.memory[dst + i] = g.memory[src + i];
    i++;
  }
  g.memory[dst + i] = 0;
  return src + i; /* This function returns a pointer to the terminating null byte
                     of the copied string */
};

wasm3_proto["strlen"] = "i(*)";
let strlen = function(i32_1) {
  let src = i32_1;
  let i   = 0;
  if (DEBUG_FUNCTION_PRINTS) {
    console.log("strlen(" + i32_1 + ")");
  }
  while (g.memory[src + i] != 0) {
    i++;
  }
  return i;
};

wasm3_proto["strcat"] = "*(**)";
let strcat = function (i32_1, i32_2, i32_3) {
  let dst     = i32_1;
  let src     = i32_2;
  let i       = 0;
  let dst_len = strlen(dst);

  if (DEBUG_FUNCTION_PRINTS) {
    console.log("strcat(" + i32_1 + "," + i32_2 + ")");
  }
  while (g.memory[src + i] != 0) {
    g.memory[dst + dst_len + i] = g.memory[src + i];
    i++;
  }
  g.memory[dst + dst_len + i] = 0;
  return dst;
};

wasm3_proto["strncat"] = "*(**i)";
let strncat = function (i32_1, i32_2, i32_3) {
  let dst     = i32_1;
  let src     = i32_2;
  let n       = i32_3;
  let i       = 0;
  let dst_len = strlen(dst);

  if (DEBUG_FUNCTION_PRINTS) {
    console.log("strncat(" + i32_1 + "," + i32_2 + "," + i32_3 + ")");
  }
  for (i=0; i<n && g.memory[src + i] != 0; i++) {
    g.memory[dst + dst_len + i] = g.memory[src + i];
  }
  g.memory[dst + dst_len + i] = 0;
  return dst;
};

wasm3_proto["memmove"] = "*(**i)";
let memmove = function (i32_1, i32_2, i32_3) {
  let dst = i32_1;
  let src = i32_2;
  let n   = i32_3;

  if (DEBUG_FUNCTION_PRINTS) {
    console.log("memmove(" + i32_1 + "," + i32_2 + "," + i32_3 + ")");
  }

  if (src == dst) {
    return dst;
  }

  if (dst < src) {
    for (let i=0; i<n; i++) {
      g.memory[dst + i] = g.memory[src + i];
    }
  } else {
    for (let i=n; i-->0; ) {
      g.memory[dst + i] = g.memory[src + i];
    }
  }
  return dst;
};

wasm3_proto["memset"] = "*(**i)";
let memset = function(i32_1, i32_2, i32_3) {
  let dst = i32_1;
  let val = i32_2;
  let n   = i32_3;

  if (DEBUG_FUNCTION_PRINTS) {
    console.log("memset(" + i32_1 + "," + i32_2 + "," + i32_3 + ")");
  }
  for (let i=0; i<n; i++) {
    g.memory[dst + i] = val;
  }
  return dst;
};

wasm3_proto["strnlen"] = "i(*i)";
let strnlen = function(i32_1, i32_2) {
  let src = i32_1;
  let n   = i32_2;
  let i   = 0;

  if (DEBUG_FUNCTION_PRINTS) {
    console.log("strnlen(" + i32_1 + "," + i32_2 + ")");
  }
  while (g.memory[src + i] != 0 && i < n) {
    i++;
  }
  return i;
};

wasm3_proto["fwrite"] = "i(*ii*)";
let fwrite = function(i32_1, i32_2, i32_3, i32_4) {
  let ptr   = i32_1;
  let size  = i32_2;
  let nmemb = i32_3;
  let FILE  = i32_4;
  let i     = 0; /* number of members (bytes if size=1) written */
  console.log("!IMPL: fwrite(" + i32_1 + "," + i32_2 + "," + i32_3 + "," + i32_4 + ")");
  return i;
};

wasm3_proto["vsnprintf"] = "i(*i**)";
let vsnprintf = function(i32_1, i32_2, i32_3, i32_4) {
  let dst    = i32_1;
  let n      = i32_2;
  let format = i32_3;
  let ap     = i32_4;
  let i      = 0; /* number of characters printed. */
  if (DEBUG_FUNCTION_PRINTS) {
    console.log("vsnprintf(" + i32_1 + "," + i32_2 + "," + str_c(i32_3) + "," + i32_4 + ")");
  }
  let s = s_from_printf(i32_3, i32_4, i32_2);
  for (i=0; i<s.length; i++) {
    g.memory[dst + i] = s.charCodeAt(i);
    i++;
  }
  if (i < i32_2) {
    g.memory[dst + i] = 0;
  }
  console.log("->" + s);
  return i;
};

wasm3_proto["fputc"] = "i(i*)";
let fputc = function(i32_1, i32_2) {
  let c    = i32_1;
  let FILE = i32_2;
  console.log("!IMPL: fputc(" + i32_1 + "," + i32_2 + ")");
  return c; /* or EOF on error */
};

wasm3_proto["fputs"] = "i(**)";
let fputs = function(i32_1, i32_2) {
  let s    = i32_1;
  let FILE = i32_2;
  let i    = 1;
  console.log("!IMPL: fputs(" + i32_1 + "," + i32_2 + ")");
  return i; /* return nonnegative number on success, or EOF on error. */
};

wasm3_proto["strcmp"] = "i(**)";
let strcmp = function(i32_1, i32_2) {
  let s1  = i32_1;
  let s2  = i32_2;
  let i   = 0;
  if (DEBUG_FUNCTION_PRINTS) {
    console.log("strcmp(" + str_c(i32_1) + "," + str_c(i32_2) + ")");
  }
  while (g.memory[s1 + i] != 0 && g.memory[s1 + i] == g.memory[s2 + i]) {
    i++;
  }
  return g.memory[s1 + i] - g.memory[s2 + i]; /* 0 = s1/s2 equal; <0 = s1 < s2; >0 s1 > s2 */
};

wasm3_proto["fflush"] = "i(*)";
let fflush = function(i32_1) {
  let FILE = i32_1;
  console.log("!IMPL: fflush(" + i32_1 + ")");
  return 0; /* Upon successful completion 0 is returned. Otherwise EOF and errno is set */
};

wasm3_proto["free"] = "v(*)";
let free = function(i32_1) {
  let ptr            = i32_1;
  let size           = g.memory_allocd[ptr];
  let adj_left_size  = 0;
  let adj_right_size = 0;
  let left_ptr       = ptr;

  if (DEBUG_FUNCTION_PRINTS) {
    console.log("free(" + i32_1 + ")");
  }

  if (g.memory_freed[ptr + size] > 0) {
    let adj_right_size = g.memory_freed[ptr + size];
    delete g.memory_freed[ptr + size];
  }
  if (g.memory_freed_adj[ptr] > 0) {
    let left_ptr      = g.memory_freed_adj[ptr];
    let adj_left_size = g.memory_freed[left_ptr];
    delete g.memory_freed_adj[ptr];
  }
  let total_size = size + adj_left_size + adj_right_size;
  delete g.memory_allocd[ptr];
  if ((left_ptr + total_size) == g.memory_head) {
    g.memory_head = left_ptr;
  } else {
    g.memory_freed[left_ptr] = total_size;
    g.memory_freed_adj[left_ptr + total_size] = left_ptr;
  }
  return;
};

wasm3_proto["malloc"] = "*(i)";
let malloc = function(i32_1) {
  let size = i32_1;
  if (DEBUG_FUNCTION_PRINTS) {
    console.log("malloc(" + i32_1 + ")");
  }
  size = ((size + 7)  >> 3) << 3;
  if (g.memory_start == undefined) {
    g.memory_start = g.memory.length;
    g.memory_head = g.memory_start;
    g.memory_end = g.memory_start;
    g.memory_allocd = { };
    g.memory_freed = { };
    g.memory_freed_adj = { };
  }
  let off = g.memory_head;
  g.memory_head = g.memory_head + size;
  if (g.memory_head > g.memory_end) {
    let additional_bytes_needed = g.memory_head - g.memory_end;
    /* 1 page = 65,536 bytes */
    npages = (65535 + additional_bytes_needed) / 65536;
    g.memory_grow(npages);
    g.memory_end = g.memory.length;
  }
  g.memory_allocd[off] = size;
  return off;
};

wasm3_proto["calloc"] = "*(ii)";
let calloc = function(i32_1, i32_2) {
  let n = i32_1 * i32_2;
  let p = malloc(n);
  if (DEBUG_FUNCTION_PRINTS) {
    console.log("calloc(" + i32_1 + "," + i32_2 + ")");
  }
  for (let i=0; i<n; i++) {
    g.memory[p + i] = 0;
  }
  return p;
};

wasm3_proto["realloc"] = "*(*i)";
let realloc = function(i32_1, i32_2) {
  let ptr      = i32_1;
  let new_size = i32_2;

  if (DEBUG_FUNCTION_PRINTS) {
    console.log("realloc(" + i32_1 + "," + i32_2 + ")");
  }
  if (ptr == 0) {
    return malloc(new_size);
  }
  let old_size = g.memory_allocd[ptr];
  if (DEBUG_REALLOC) {
    console.log("old_size: " + old_size);
    console.log("g.memory_head: " + g.memory_head + ", calculated: " + (ptr + old_size));
  }
  if ((ptr + old_size) == g.memory_head) {
    g.memory_head = ptr + new_size;
    g.memory_allocd[ptr] = new_size;
    if (g.memory_head > g.memory_end) {
      let additional_bytes_needed = g.memory_head - g.memory_end;
      /* 1 page = 65,536 bytes */
      npages = (65535 + additional_bytes_needed) / 65536;
      g.memory_grow(npages);
      g.memory_end = g.memory.length;
    }
    return ptr;
  }
  let ptr_new = malloc(new_size);
  for (let i=0; i<old_size; i++) {
    g.memory[ptr_new+i] = g.memory[ptr+i];
  }
  free(ptr);
  return ptr_new;
};

wasm3_proto["memcmp"] = "i(**i)";
let memcmp = function(i32_1, i32_2, i32_3) {
  let p1  = i32_1;
  let p2  = i32_2;
  let n   = i32_3;

  if (DEBUG_FUNCTION_PRINTS) {
    console.log("memcmp(" + i32_1 + "," + i32_2 + "," + i32_3 + ")");
  }
  for (let i=0; i<n; i++) {
    let res = g.memory[p1 + i] - g.memory[p2 + i];
    /* 0 = s1/s2 equal; <0 = s1 < s2; >0 s1 > s2 */
    if (res != 0) { return res; }
  }
  return 0;
};

wasm3_proto["snprintf"] = "i(*i**)";
let snprintf = function(i32_1, i32_2, i32_3, i32_4) {
  let s   = s_from_printf(i32_3, i32_4, i32_2);
  let dst = i32_1;
  let i   = 0;
  if (DEBUG_FUNCTION_PRINTS) {
    console.log("snprintf(" + i32_1 + "," + i32_2 + "," + i32_3 + "," + i32_4 + "): " + s);
  }
  for (i=0; i<s.length; i++) {
    g.memory[dst + i] = s.charCodeAt(i);
  }
  if (i < i32_2) {
    g.memory[dst + i] = 0;
  }
  console.log("output: " + str_c(dst));
  return i;
};

wasm3_proto["sprintf"] = "i(***)";
let sprintf = function(i32_1, i32_2, i32_3) {
  let s = s_from_printf(i32_2, i32_3)
  let dst = i32_1;
  let i   = 0;
  if (DEBUG_FUNCTION_PRINTS) {
    console.log("sprintf(" + i32_1 + "," + i32_2 + "," + i32_3 + ")");
  }
  for (i=0; i<s.length; i++) {
    g.memory[dst + i] = s.charCodeAt(i);
  }
  g.memory[dst + i] = 0;
  return i;
}; 

wasm3_proto["printf"] = "i(**)";
let printf = function(i32_1, i32_2) {
  let fmt  = i32_1;
  let args = i32_2;
  if (DEBUG_FUNCTION_PRINTS) {
    console.log("printf(" + i32_1 + "," + i32_2 + ")");
  }
  let s = s_from_printf(fmt, args);
  console.log(s);
  return s.length;
};

wasm3_proto["fprintf"] = "i(***)";
let fprintf = function(i32_1, i32_2, i32_3) {
  let file = i32_1;
  let fmt  = i32_2;
  let args = i32_3;
  let s    = s_from_printf(fmt, args);
  console.log("!IMPL: fprintf(" + i32_1 + "," + i32_2 + "," + i32_3 + ") // " + s);
  return s.length;
};

wasm3_proto["strtoul"] = "i(**i)"
let strtoul = function(i32_1, i32_2, i32_3) {
  let s    = i32_1;
  let e    = i32_2;
  let base = i32_3;
  let n    = 0;
  console.log("!IMPL: strtoul(" + i32_1 + "," + i32_2 + "," + i32_3 + ")");
  return n;
	  /*
    let i    = 0;
    let neg  = 0;
    let c;
    let c_next;

    do {
      c = g.memory[s + i];
      i++;
    } while (ISSPACE(c));

    if (c == '-') {
      neg = 1;
      c = g.memory[s + i];
      i++;
    } else if (c == '+') {
      c = g.memory[s + i];
      i++;
    }

    c_next = g.memory[s + i];
    if ((base == 0 || base == 16) && c == '0' && (c_next == 'x' || c_next == 'X')) {
      i++;
      c = g.memory[s + i];
      i++;
      base = 16;
    }

    if (base == 0) {
      if (c == '0') {
        base = 8;
      } else {
        base = 10;
      }
    }

    let cutoff = ULONG_MAX / base;
    let cutlim = ULONG_MAX % base;
    let acc;
    let any;
    for (acc=0, any=0;;) {
      c = g.memory[s + i];
      i++;
    }
    */
};

wasm3_proto["strtod"] = "F(**)";
let strtod = function(i32_1, i32_2) {
  let s = i32_1;
  let e = i32_2;
  let n = 0;
  console.log("!IMPL: strtod(" + i32_1 + "," + i32_2 + ")");
  /* AFTER *e = s */
  return n;
};

wasm3_proto["clock"] = "i()";
let clock = function() {
  if (DEBUG_FUNCTION_PRINTS) {
    console.log("clock()");
  }
  return Date.now();
};

wasm3_proto["abort"] = "v()";
let abort = function() {
  console.log("!IMPL: abort()");
};

wasm3_proto["__extendsftf2"] = "v(*f)";
let __extendsftf2 = function(i32_1, f32_1) {
  /* conversion: long double __extendsftf2(float a), long double -> pointer */
  console.log("!IMPL: __extendsftf2(" + i32_1 + "," + f32_1 + ")");
  return; /* result store in pointer */
};

wasm3_proto["__fpclassifyl"] = "i(II)";
let __fpclassifyl = function(i64_1, i64_2) {
  console.log("__fpclassifyl(" + i64_1 + "," + i64_2 + ")");
/* FP_NAN, FP_INFINITE, FP_ZERO, FP_SUBNORMAL, FP_NORMAL */
  return 0; /* result i32 */
};

wasm3_proto["__signbitl"] = "i(**)";
let __signbitl = function(i32_1, i32_2) {
  /* __signbitl has the same spcification as signbit, except __signbitl argument type is long double */
  console.log("__signbitl(" + i32_1 + "," + i32_2 + ")");
  return 0; /* result i32 */
};

wasm3_proto["__extenddftf2"] = "v(iF)"
let __extenddftf2 = function(i32_1, f64_1) {
  /* conversion: long double __extenddftf2(double a) */
  console.log("__extenddftf2(" + i32_1 + "," + f64_1 + ")");
  return; /* result stored in pointer */
};

  return {
      __assert_fail: __assert_fail,
      __extenddftf2: __extenddftf2,
      __extendsftf2: __extendsftf2,
      __fpclassifyl: __fpclassifyl,
      __signbitl:    __signbitl,
      abort:         abort,
      atof:          atof,
      calloc:        calloc,
      clock:         clock,
      cos:           cos,
      fflush:        fflush,
      fmod:          fmod,
      fputc:         fputc,
      fputs:         fputs,
      free:          free,
      fwrite:        fwrite,
      localtime:     localtime,
      malloc:        malloc,
      memcmp:        memcmp,
      memcpy:        memmove,
      memmove:       memmove,
      memset:        memset,
      putc:          fputc,
      realloc:       realloc,
      sin:           sin,
      strcmp:        strcmp,
      strcpy:        strcpy,
      strlen:        strlen,
      strnlen:       strnlen,
      strtod:        strtod,
      strtoul:       strtoul,
      strtoull:      strtoul,
      time:          time,
      vsnprintf:     vsnprintf,
      c_str:         c_str,
      c_argv:        c_argv,
      c_setp:        c_setp,
      c_getp:        c_getp,
      c_getlp:       c_getlp,
      str_c:         str_c,
      printf:        printf,
      fprintf:       fprintf,
      snprintf:      snprintf,
      sprintf:       sprintf,
      strcat:        strcat,
      strncat:       strncat,
      wasm3_proto:   wasm3_proto,
  };
}

module.exports.sysjs       = sysjs;
