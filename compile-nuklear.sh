#!/bin/bash

BUILD_DIR=build-nuklear

mkdir -p ${BUILD_DIR}

NAME=nuklear-tmp
clang -o ${BUILD_DIR}/${NAME}.c.ll -I/home/A/emsdk/upstream/emscripten/cache/sysroot/include -Inuklear/ --target=wasm32 -emit-llvm -c -S src/${NAME}.c
llc -o ${BUILD_DIR}/${NAME}.c.ll.o -march=wasm32 -filetype=obj ${BUILD_DIR}/${NAME}.c.ll

NAME=nuklear
clang -o ${BUILD_DIR}/${NAME}.c.ll -I/home/A/emsdk/upstream/emscripten/cache/sysroot/include -Inuklear/ --target=wasm32 -emit-llvm -c -S src/${NAME}.c
llc -o ${BUILD_DIR}/${NAME}.c.ll.o -march=wasm32 -filetype=obj ${BUILD_DIR}/${NAME}.c.ll


/home/A/emsdk/upstream/bin/wasm-ld.exe --no-entry --import-undefined --export-all -o ${BUILD_DIR}/${NAME}-temp.wasm ${BUILD_DIR}/nuklear.c.ll.o ${BUILD_DIR}/nuklear-tmp.c.ll.o

/home/A/wabt/bin/wasm2wat.exe ${BUILD_DIR}/${NAME}-temp.wasm > ${BUILD_DIR}/${NAME}.wat
/home/A/wabt/bin/wat2wasm.exe -o ${BUILD_DIR}/${NAME}.wasm ${BUILD_DIR}/${NAME}.wat
cp ${BUILD_DIR}/${NAME}.wasm src/${NAME}.wasm
