#!/bin/bash

# Script de teste automatizado para o webhook Manus
# Este script testa todos os endpoints e tipos de eventos suportados

set -e

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URL base (pode ser alterada para produção)
BASE_URL="${WEBHOOK_URL:-http://localhost:3000}"
WEBHOOK_ENDPOINT="$BASE_URL/api/manus/webhook"

echo -e "${YELLOW}=== Teste do Webhook Manus ===${NC}"
echo "URL: $WEBHOOK_ENDPOINT"
echo ""

# Função para testar endpoint
test_endpoint() {
    local method=$1
    local description=$2
    local data=$3
    
    echo -e "${YELLOW}Testando: $description${NC}"
    
    if [ "$method" == "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$WEBHOOK_ENDPOINT")
    else
        response=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_ENDPOINT" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" == "200" ]; then
        echo -e "${GREEN}✓ Sucesso (HTTP $http_code)${NC}"
        echo "$body" | jq . 2>/dev/null || echo "$body"
    else
        echo -e "${RED}✗ Falha (HTTP $http_code)${NC}"
        echo "$body"
        exit 1
    fi
    
    echo ""
}

# Teste 1: Health Check (GET)
test_endpoint "GET" "Health Check (GET)" ""

# Teste 2: Evento de mensagem enviada
test_endpoint "POST" "Evento: message_sent" '{
  "event_type": "message_sent",
  "flow_id": "flow_1_test_'$(date +%s)'",
  "step_id": "step_1",
  "data": {
    "message": "Teste de integração do webhook",
    "user_id": "12345"
  },
  "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
  "status": "success"
}'

# Teste 3: Evento de atualização de estado
test_endpoint "POST" "Evento: state_updated" '{
  "event_type": "state_updated",
  "flow_id": "flow_1_test_'$(date +%s)'",
  "data": {
    "current_step": "processing",
    "progress": 50,
    "items_processed": 25,
    "items_total": 50
  },
  "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
  "status": "success"
}'

# Teste 4: Evento de conclusão de flow
test_endpoint "POST" "Evento: flow_completed" '{
  "event_type": "flow_completed",
  "flow_id": "flow_1_test_'$(date +%s)'",
  "data": {
    "total_items": 100,
    "processed_items": 100,
    "errors": 0,
    "duration_ms": 5000
  },
  "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
  "status": "success"
}'

# Teste 5: Evento de erro
test_endpoint "POST" "Evento: flow_error" '{
  "event_type": "flow_error",
  "flow_id": "flow_1_test_'$(date +%s)'",
  "data": {
    "error_code": "PROCESSING_ERROR",
    "item_id": "12345",
    "stack_trace": "Error: Teste de erro..."
  },
  "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
  "status": "error",
  "message": "Erro ao processar item"
}'

# Teste 6: Evento sem event_type (deve falhar com 400)
echo -e "${YELLOW}Testando: Validação de payload inválido${NC}"
response=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_ENDPOINT" \
    -H "Content-Type: application/json" \
    -d '{
      "flow_id": "flow_1_test_invalid",
      "data": {}
    }')

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" == "400" ]; then
    echo -e "${GREEN}✓ Validação funcionando corretamente (HTTP $http_code)${NC}"
    echo "$body" | jq . 2>/dev/null || echo "$body"
else
    echo -e "${RED}✗ Validação não funcionou como esperado (HTTP $http_code)${NC}"
    echo "$body"
    exit 1
fi

echo ""
echo -e "${GREEN}=== Todos os testes passaram! ===${NC}"
