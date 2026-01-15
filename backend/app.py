import os
import requests
import json
from flask import Flask, jsonify, request, redirect
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, origins=[os.getenv('CORS_ORIGINS', 'http://localhost:3000')])

# Payphone config
PAYPHONE_TOKEN = os.getenv('PAYPHONE_TOKEN')
PAYPHONE_STORE_ID = os.getenv('PAYPHONE_STORE_ID')
PAYPHONE_BASE_URL = 'https://pay.payphonetodoesposible.com'

def get_bearer_headers():
    """Headers con Bearer token para Payphone API"""
    return {
        'Authorization': f'Bearer {PAYPHONE_TOKEN}',
        'Content-Type': 'application/json'
    }

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

@app.route('/api/prepare-payment', methods=['POST'])
def prepare_payment():
    """
    Preparar transacción con Payphone usando Botón de Pago por Redirección
    Fase 1: POST a /api/button/Prepare
    Devuelve URLs de pago (payWithCard, payWithPayPhone)
    """
    data = request.get_json()
    
    client_tx_id = data.get('clientTransactionId')
    amount_cents = data.get('amount')  # En centavos
    email = data.get('email')
    phone = data.get('phone')
    
    if not all([client_tx_id, amount_cents, email, phone]):
        return jsonify({
            'success': False,
            'error': 'Parámetros requeridos: clientTransactionId, amount, email, phone'
        }), 400
    
    # Preparar payload para Payphone /api/button/Prepare
    payload = {
        'amount': amount_cents,  # Ya en centavos
        'amountWithoutTax': amount_cents,
        'storeId': PAYPHONE_STORE_ID,
        'clientTransactionId': client_tx_id,
        'currency': 'USD',
        'responseUrl': 'http://localhost:5000/api/confirm-payment',  # Backend recibe respuesta
        'reference': f'Compra {client_tx_id}',
        'email': email,
        'phoneNumber': phone
    }
    
    headers = get_bearer_headers()
    
    print(f"Preparando transacción: {client_tx_id}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        # Llamar a Payphone /api/button/Prepare
        response = requests.post(
            f'{PAYPHONE_BASE_URL}/api/button/Prepare',
            headers=headers,
            json=payload,
            timeout=10
        )
        
        print(f"Payphone Response: {response.status_code}")
        print(f"Response Body: {response.text}")
        
        if response.status_code != 200:
            return jsonify({
                'success': False,
                'error': f'Error Payphone: {response.text}'
            }), response.status_code
        
        result = response.json()
        
        # Payphone devuelve paymentId y URLs de pago
        return jsonify({
            'success': True,
            'paymentId': result.get('paymentId'),
            'payWithCard': result.get('payWithCard'),
            'payWithPayPhone': result.get('payWithPayPhone')
        }), 200
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/confirm-payment', methods=['GET'])
def confirm_payment():
    """
    Fase 2: Confirmar transacción con Payphone
    Payphone redirige aquí con parámetros: id, clientTransactionId
    """
    transaction_id = request.args.get('id')
    client_tx_id = request.args.get('clientTransactionId')
    
    print(f"Confirmar pago: id={transaction_id}, clientTxId={client_tx_id}")
    
    if not transaction_id or not client_tx_id:
        return redirect(f'http://localhost:3000/cancel?error=missing_parameters')
    
    # Preparar payload para /api/button/V2/Confirm
    payload = {
        'id': int(transaction_id),
        'clientTxId': client_tx_id
    }
    
    headers = get_bearer_headers()
    
    try:
        # Llamar a Payphone /api/button/V2/Confirm
        response = requests.post(
            f'{PAYPHONE_BASE_URL}/api/button/V2/Confirm',
            headers=headers,
            json=payload,
            timeout=10
        )
        
        print(f"Confirm Response: {response.status_code}")
        print(f"Confirm Body: {response.text}")
        
        result = response.json()
        
        # Verificar si transacción fue aprobada (statusCode 3 = Aprobada, 2 = Cancelada)
        status_code = result.get('statusCode')
        
        if status_code == 3:  # Aprobada
            # Redirigir a success con datos de transacción
            success_url = f'http://localhost:3000/success?'
            success_url += f'id={transaction_id}&'
            success_url += f'clientTransactionId={client_tx_id}&'
            success_url += f'authCode={result.get("authorizationCode", "")}&'
            success_url += f'amount={result.get("amount", "")}&'
            success_url += f'status={result.get("transactionStatus", "")}'
            
            return redirect(success_url)
        else:  # Cancelada o error
            return redirect(f'http://localhost:3000/cancel?id={transaction_id}&status={result.get("transactionStatus", "FAILED")}')
            
    except Exception as e:
        print(f"Error confirming: {str(e)}")
        return redirect(f'http://localhost:3000/cancel?error={str(e)}')

if __name__ == '__main__':
    app.run(debug=True, port=5000)
