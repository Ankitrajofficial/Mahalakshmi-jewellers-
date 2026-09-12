#!/bin/bash
# Functional check: publishing a rate from /admin re-prices the storefront.
set -e
BASE="${BASE_URL:-http://localhost:3111}"
JAR=$(mktemp)
SLUG=bandhej-everyday-gold-band   # 22K, no stones, dynamic pricing

price() { curl -s "$BASE/product/$SLUG" | grep -oE '₹[0-9,]+' | head -1; }

echo "Price before: $(price)"

CODE=$(curl -s -c "$JAR" -X POST "$BASE/api/auth/otp" -H 'Content-Type: application/json' \
  -d '{"phone":"9521061429"}' | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).devCode))")
curl -s -b "$JAR" -c "$JAR" -X POST "$BASE/api/auth/verify" -H 'Content-Type: application/json' \
  -d "{\"phone\":\"9521061429\",\"code\":\"$CODE\"}" > /dev/null

curl -s -b "$JAR" -X POST "$BASE/api/admin/rates" -H 'Content-Type: application/json' -d '{
  "rates":[
    {"metal":"GOLD","purity":"24K","ratePerGram":8600},
    {"metal":"GOLD","purity":"22K","ratePerGram":7900},
    {"metal":"GOLD","purity":"18K","ratePerGram":6450},
    {"metal":"GOLD","purity":"14K","ratePerGram":5020},
    {"metal":"SILVER","purity":"925 Sterling","ratePerGram":103.5},
    {"metal":"PLATINUM","purity":"950 Platinum","ratePerGram":3400}
  ]}'
echo
sleep 2
echo "Price after 22K 7172 -> 7900: $(price)"
rm -f "$JAR"
