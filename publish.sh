#!/bin/bash
minify app/assets/js/main.js > app/assets/js/main.min.js
minify app/assets/css/main.css > app/assets/css/main.min.css
wrangler publish
