#!/bin/bash

SCRIPT_NAME="${0##*/}"

DIR="$1"
if [ ! -d "$DIR" ]; then
  echo "Usage: $SCRIPT_NAME [path/to/directory]" >&2
  exit 1
fi

cd $DIR
DEPENDENCIES=$(react-native dependencies --entry-file index.ios.js --platform ios)
#only files ending with .js
#exclude __mocks__ | __tests__ | node_modules
JS_DEPENDENCIES=$(echo "$DEPENDENCIES" | grep ".js" | grep -E -v "__mocks__|__tests__|node_modules")

LC_IOS=$(echo "$JS_DEPENDENCIES" | grep ".ios.js" | xargs cat | wc -l)

SHARED_DEPENDENCIES=$(echo "$JS_DEPENDENCIES" | grep -E -v ".ios.js|.android.js")
PLATFORM_SPECIFIC_LOC=$(echo "$SHARED_DEPENDENCIES" | xargs node sharedCode.js)
LC_SHARED=$(echo "$SHARED_DEPENDENCIES" | xargs cat | wc -l)
LC_SHARED=$((LC_SHARED - PLATFORM_SPECIFIC_LOC))
LC_TOTAL=$((LC_IOS + LC_SHARED))

CALCULATE_P='BEGIN{printf "%.2f", t1/t2 * 100}'

P_IOS=$(    awk -v t1="$LC_IOS" -v t2="$LC_TOTAL" "$CALCULATE_P")
P_SHARED=$( awk -v t1="$LC_SHARED" -v t2="$LC_TOTAL" "$CALCULATE_P")

echo "           Lines of Code"
echo "     iOS   $LC_IOS ($P_IOS%)"
echo "  Shared   $LC_SHARED ($P_SHARED%)"