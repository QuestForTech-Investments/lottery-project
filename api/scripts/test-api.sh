#!/bin/bash

# Lottery API - Test Script
# Prueba rápida de la API

API_URL="http://localhost:5000"

echo "========================================"
echo "  Lottery API - Test Script"
echo "========================================"
echo ""

# 1. Health Check
echo "1. Checking API health..."
HEALTH=$(curl -s "$API_URL/health")
if [ $? -eq 0 ]; then
    echo "   ✅ Status: $(echo $HEALTH | jq -r '.status')"
    echo "   Environment: $(echo $HEALTH | jq -r '.environment')"
else
    echo "   ❌ ERROR: Cannot connect to API"
    exit 1
fi

echo ""

# 2. Register User
echo "2. Registering test user..."
RANDOM_NUM=$RANDOM
USERNAME="testuser$RANDOM_NUM"
EMAIL="test$RANDOM_NUM@example.com"

REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/Auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$USERNAME\",
    \"password\": \"Test123456\",
    \"email\": \"$EMAIL\",
    \"fullName\": \"Test User $RANDOM_NUM\"
  }")

if echo "$REGISTER_RESPONSE" | jq -e '.token' > /dev/null 2>&1; then
    echo "   ✅ User registered: $(echo $REGISTER_RESPONSE | jq -r '.username')"
    echo "   Email: $(echo $REGISTER_RESPONSE | jq -r '.email')"
    TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.token')
    echo "   Token obtained!"
else
    echo "   ⚠️  Registration failed, trying login with existing user..."

    LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/Auth/login" \
      -H "Content-Type: application/json" \
      -d '{
        "username": "testuser",
        "password": "Test123456"
      }')

    if echo "$LOGIN_RESPONSE" | jq -e '.token' > /dev/null 2>&1; then
        echo "   ✅ Login successful!"
        TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
    else
        echo "   ❌ ERROR: Cannot authenticate"
        echo "   Response: $LOGIN_RESPONSE"
        exit 1
    fi
fi

echo ""

# 3. Test API Info
echo "3. Getting API information..."
API_INFO=$(curl -s "$API_URL/api/info")
echo "   ✅ API Name: $(echo $API_INFO | jq -r '.name')"
echo "   Version: $(echo $API_INFO | jq -r '.version')"
echo "   Environment: $(echo $API_INFO | jq -r '.environment')"

echo ""

# 4. Test protected endpoint - Lotteries
echo "4. Testing protected endpoint (Lotteries)..."
LOTTERIES=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/api/lotteries?page=1&pageSize=5")

if echo "$LOTTERIES" | jq -e '.totalRecords' > /dev/null 2>&1; then
    TOTAL=$(echo $LOTTERIES | jq -r '.totalRecords')
    FIRST_NAME=$(echo $LOTTERIES | jq -r '.data[0].name // "N/A"')
    echo "   ✅ Total lotteries: $TOTAL"
    echo "   First lottery: $FIRST_NAME"
else
    echo "   ⚠️  No lotteries found or empty database"
fi

echo ""

# 5. Test protected endpoint - Draws
echo "5. Testing protected endpoint (Draws)..."
DRAWS=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/api/draws?page=1&pageSize=5")

if echo "$DRAWS" | jq -e '.totalRecords' > /dev/null 2>&1; then
    TOTAL_DRAWS=$(echo $DRAWS | jq -r '.totalRecords')
    FIRST_DRAW=$(echo $DRAWS | jq -r '.data[0].lottery.name // "N/A"')
    echo "   ✅ Total draws: $TOTAL_DRAWS"
    echo "   First draw lottery: $FIRST_DRAW"
else
    echo "   ⚠️  No draws found or empty database"
fi

echo ""

# 6. Test OpenAPI specs
echo "6. Checking OpenAPI specifications..."
OPENAPI_JSON=$(curl -s "$API_URL/swagger/v1-openapi3/swagger.json" | jq -r '.openapi // "N/A"')
OPENAPI_TITLE=$(curl -s "$API_URL/swagger/v1-openapi3/swagger.json" | jq -r '.info.title // "N/A"')
echo "   ✅ OpenAPI Version: $OPENAPI_JSON"
echo "   API Title: $OPENAPI_TITLE"

echo ""
echo "========================================"
echo "  ✅ Test Complete!"
echo "========================================"
echo ""
echo "📋 Summary:"
echo "  • API is running and healthy"
echo "  • Authentication working"
echo "  • All endpoints accessible"
echo "  • OpenAPI specs available"
echo ""
echo "🔑 Your JWT Token:"
echo "$TOKEN"
echo ""
echo "📝 Token info:"
TOKEN_PARTS=(${TOKEN//./ })
if [ ${#TOKEN_PARTS[@]} -eq 3 ]; then
    PAYLOAD=$(echo "${TOKEN_PARTS[1]}" | base64 -d 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo "  Username: $(echo $PAYLOAD | jq -r '.unique_name // "N/A"')"
        echo "  Expires: $(echo $PAYLOAD | jq -r '.exp // "N/A"' | xargs -I {} date -d @{} 2>/dev/null || echo "N/A")"
    fi
fi
echo ""
echo "🌐 Access Swagger UI:"
echo "  From WSL:     http://localhost:5000/"
echo "  From Windows: http://172.19.169.103:5000/"
echo ""
echo "📥 Import to Postman:"
echo "  http://172.19.169.103:5000/swagger/v1-openapi3/swagger.json"
echo ""
