#!/bin/bash

mkdir -p tar-staging

for file in "prag.js" "vbo.js" "matrix.js" "IntelOneMono-Regular.glf.js" "nuklear.wasm" "sys.js" "gl.js" "program.js" "glf.js" "nuklear.js" "handler.js"
do
  cp src/${file} tar-staging/${file}
done

tar -czvf src/manifest.tar.gz -C tar-staging/ .

cp tarballjs/tarball.js src/tarball.js

echo "\"data:application/wasm;base64,`base64 --wrap=0 src/manifest.tar.gz`\"" > manifest.tar.gz.b64

sed -f amalgamate_tarballjs.sed src/index.html > tmp1.js
sed -f amalgamate_manifest.tar.gz.sed tmp1.js > tmp2.js
sed s/is_staging\:\ true/is_staging\:\ false/g tmp2.js > tmp3.js

mv tmp3.js index.html
rm tmp2.js
rm tmp1.js
rm manifest.tar.gz.b64
rm src/manifest.tar.gz
