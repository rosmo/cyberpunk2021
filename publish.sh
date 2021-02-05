#!/bin/bash
minify app/assets/js/main.dev.js > app/assets/js/main.min.js
minify app/assets/css/main.dev.css > app/assets/css/main.min.css
sed -i -e 's/main.dev/main.min/g' app/index.html
wrangler publish
sed -i -e 's/main.min/main.dev/g' app/index.html
