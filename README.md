WebAssembly / WebGL port of Nuklear.

index.html is the entirity.  

Preview / use here

https://htmlpreview.github.io/?https://github.com/SCI4THIS/nuklear-wasm/blob/main/index.html

index.html is the final compiled HTML amalgam file.  This is also provided
for ease of use.  If you want to experiment you can run

$ cd src; python3 -m http.server

This ports nuklear to use a custom glfont rendering scheme.  It doesn't use emscripten, but
runs the loop in javascript.

For an excellent example of a port using emscripten:

https://github.com/DeXP/nuklear-webdemo

Using the Intel One Mono font:

https://www.intel.com/content/www/us/en/company-overview/one-monospace-font.html

The C code was compiled using clang's wasm32 output.
