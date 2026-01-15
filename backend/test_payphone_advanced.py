#!/usr/bin/env python
"""Script alternativo para probar diferentes formas de autenticación Payphone"""
import os
import requests
import json
import time
import hashlib
import hmac
from dotenv import load_dotenv

load_dotenv()

PAYPHONE_API_KEY = os.getenv('PAYPHONE_API_KEY')
PAYPHONE_APP_CODE = os.getenv('PAYPHONE_APP_CODE')
PAYPHONE_API_SECRET = os.getenv('PAYPHONE_API_SECRET')
PAYPHONE_TOKEN = os.getenv('PAYPHONE_TOKEN')

print("=" * 70)
print("DIAGNÓSTICO AVANZADO - CREDENCIALES PAYPHONE")
print("=" * 70)

print("\n✓ Credenciales cargadas:")
print(f"  API_KEY: {PAYPHONE_API_KEY}")
print(f"  APP_CODE: {PAYPHONE_APP_CODE}")
print(f"  API_SECRET: {PAYPHONE_API_SECRET}")
print(f"  TOKEN: {PAYPHONE_TOKEN[:50]}...")

# Test 1: Usar HMAC signature (para API.payphone.app)
print("\n" + "=" * 70)
print("TEST 1: API.payphone.app con firma HMAC")
print("=" * 70)

def generate_signature(method, endpoint, body=''):
    timestamp = str(int(time.time()))
    if body:
        message = f"{method} {endpoint} {body} {timestamp}".encode('utf-8')
    else:
        message = f"{method} {endpoint} {timestamp}".encode('utf-8')
    
    signature = hmac.new(
        PAYPHONE_API_SECRET.encode('utf-8'),
        message,
        hashlib.sha256
    ).hexdigest()
    
    return signature, timestamp

try:
    endpoint = '/api/v1/transactions'
    signature, timestamp = generate_signature('POST', endpoint)
    
    headers = {
        'Authorization': f'{PAYPHONE_API_KEY}:{signature}:{timestamp}',
        'Content-Type': 'application/json',
        'X-App-Code': PAYPHONE_APP_CODE
    }
    
    payload = {
        'amount': 3.15,
        'currency': 'USD',
        'reference': 'TEST-' + str(int(time.time())),
        'description': 'Test',
        'customer': {'email': 'test@test.com', 'name': 'Test'},
        'return_url': 'http://localhost:3000/success',
        'cancel_url': 'http://localhost:3000/cancel'
    }
    
    response = requests.post(
        'https://api.payphone.app' + endpoint,
        headers=headers,
        json=payload,
        timeout=10
    )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text[:500]}")
    
except Exception as e:
    print(f"Error: {str(e)}")

# Test 2: Bearer token (para pay.payphonetodoesposible.com)
print("\n" + "=" * 70)
print("TEST 2: pay.payphonetodoesposible.com con Bearer token")
print("=" * 70)

try:
    headers = {
        'Authorization': f'Bearer {PAYPHONE_TOKEN}',
        'Content-Type': 'application/json'
    }
    
    # Intenta con valores válidos
    response = requests.post(
        'https://pay.payphonetodoesposible.com/api/button/V2/Confirm',
        headers=headers,
        json={
            'id': 123,
            'clientTxId': 'TEST-' + str(int(time.time()))
        },
        timeout=10
    )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
except Exception as e:
    print(f"Error: {str(e)}")

# Test 3: Probar Prepare endpoint
print("\n" + "=" * 70)
print("TEST 3: Endpoint Prepare (alternativo)")
print("=" * 70)

try:
    headers = {
        'Authorization': f'Bearer {PAYPHONE_TOKEN}',
        'Content-Type': 'application/json'
    }
    
    response = requests.post(
        'https://pay.payphonetodoesposible.com/api/button/V2/Prepare',
        headers=headers,
        json={
            'storeId': PAYPHONE_APP_CODE,
            'clientTransactionId': 'TEST-' + str(int(time.time())),
            'amount': 315,
            'currency': 'USD',
            'email': 'test@test.com'
        },
        timeout=10
    )
    
    print(f"Status: {response.status_code}")
    result = response.text
    print(f"Response: {result[:500] if len(result) > 500 else result}")
    
    if response.status_code == 200:
        print("✓ ¡ÉXITO! Este endpoint funciona")
        print(f"Full Response: {result}")
    
except Exception as e:
    print(f"Error: {str(e)}")

print("\n" + "=" * 70)
print("RECOMENDACIÓN")
print("=" * 70)
print("""
Si el TEST 3 (Prepare) funciona, significa que:
- El token es válido
- Está configurado para la Cajita de Pagos
- Debes usar el endpoint /api/button/V2/Prepare para preparar pagos

Verifica la respuesta anterior para confirmar.
""")
