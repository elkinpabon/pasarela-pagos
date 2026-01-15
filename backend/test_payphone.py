#!/usr/bin/env python
"""Script para probar las credenciales de Payphone"""
import os
import requests
import json
import time
from dotenv import load_dotenv

load_dotenv()

# Credenciales
PAYPHONE_TOKEN = os.getenv('PAYPHONE_TOKEN')
PAYPHONE_API_KEY = os.getenv('PAYPHONE_API_KEY')
PAYPHONE_APP_CODE = os.getenv('PAYPHONE_APP_CODE')
PAYPHONE_API_SECRET = os.getenv('PAYPHONE_API_SECRET')

print("=" * 60)
print("DIAGNÓSTICO DE CREDENCIALES PAYPHONE")
print("=" * 60)

# Verificar que las credenciales existen
print("\n1. Verificando credenciales en .env:")
print(f"   ✓ PAYPHONE_TOKEN existe: {bool(PAYPHONE_TOKEN)}")
print(f"   ✓ PAYPHONE_API_KEY existe: {bool(PAYPHONE_API_KEY)}")
print(f"   ✓ PAYPHONE_APP_CODE existe: {bool(PAYPHONE_APP_CODE)}")
print(f"   ✓ PAYPHONE_API_SECRET existe: {bool(PAYPHONE_API_SECRET)}")

if not PAYPHONE_TOKEN:
    print("\n❌ ERROR: PAYPHONE_TOKEN no está configurado")
    exit(1)

# Test 1: Verificar endpoint de preparación
print("\n2. Probando /api/prepare-payment:")
try:
    response = requests.post(
        'http://localhost:5000/api/prepare-payment',
        json={
            'amount': 315,
            'clientTransactionId': 'TEST-' + str(int(time.time()))
        }
    )
    print(f"   Status: {response.status_code}")
    result = response.json()
    if response.status_code == 200:
        print(f"   ✓ Response: {json.dumps(result, indent=2)}")
    else:
        print(f"   ❌ Error: {result}")
except Exception as e:
    print(f"   ❌ Error: {str(e)}")

# Test 2: Probar token directamente con Payphone
print("\n3. Probando token con API de Payphone:")
try:
    headers = {
        'Authorization': f'Bearer {PAYPHONE_TOKEN}',
        'Content-Type': 'application/json'
    }
    
    # Test endpoint simple
    response = requests.post(
        'https://pay.payphonetodoesposible.com/api/button/V2/Confirm',
        headers=headers,
        json={
            'id': 0,
            'clientTxId': 'TEST-' + str(int(time.time()))
        },
        timeout=10
    )
    
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.text}")
    
    if response.status_code == 401:
        print("   ❌ PROBLEMA: Token es inválido o ha expirado")
        print("   Necesitas renovar el token en https://dashboard.payphone.app")
    elif response.status_code == 200:
        print("   ✓ Token válido!")
    
except Exception as e:
    print(f"   Error de conexión: {str(e)}")

print("\n" + "=" * 60)
print("SOLUCIONES:")
print("=" * 60)
print("""
Si ves el error 401, significa que el token ha expirado o es inválido.

Pasos para obtener un nuevo token:
1. Ve a https://dashboard.payphone.app
2. Inicia sesión con tus credenciales
3. Busca la sección "Tokens" o "API Keys"
4. Genera un nuevo token o copia el token existente
5. Actualiza PAYPHONE_TOKEN en backend/.env
6. Reinicia el backend

El token debe empezar con "Kp" o similar y tener aproximadamente 200+ caracteres.
""")
