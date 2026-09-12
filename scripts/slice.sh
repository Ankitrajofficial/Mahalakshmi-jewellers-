#!/bin/bash
# Slice a tall screenshot into readable segments. sips crops from the centre,
# so each offset is computed relative to the image's midpoint.
IMG="$1"; SEG_H="${2:-1700}"
H=$(sips -g pixelHeight "$IMG" | tail -1 | awk '{print $2}')
W=$(sips -g pixelWidth "$IMG" | tail -1 | awk '{print $2}')
DIR=$(dirname "$IMG"); BASE=$(basename "$IMG" .png)
N=$(( (H + SEG_H - 1) / SEG_H ))
for ((i=0;i<N;i++)); do
  OFF=$(( i*SEG_H + SEG_H/2 - H/2 ))
  sips -c "$SEG_H" "$W" --cropOffset "$OFF" 0 "$IMG" --out "$DIR/${BASE}-seg$i.png" >/dev/null 2>&1
done
echo "$N segments from ${W}x${H}"
