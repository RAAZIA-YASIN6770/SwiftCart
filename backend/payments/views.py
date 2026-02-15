from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import stripe
from django.conf import settings
import time
import random

# Initialize Stripe
stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', None)

class CreatePaymentIntentView(APIView):
    def post(self, request):
        try:
            if not stripe.api_key:
                 return Response({'error': 'Stripe not configured'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

            # In a real app, calculate amount from cart items to avoid trust issues
            # For now, we'll accept an amount or default to a value
            # Since this is "Hyperdrive Fulfillment", let's assume a single item flow for now
            
            # Create a PaymentIntent with the order amount and currency
            intent = stripe.PaymentIntent.create(
                amount=1000, # $10.00 placeholder
                currency='usd',
                automatic_payment_methods={
                    'enabled': True,
                },
                metadata={'integration_check': 'accept_a_payment'},
            )
            
            return Response({
                'clientSecret': intent['client_secret']
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ConfirmPaymentView(APIView):
    def post(self, request):
        """
        Executes the atomic checkout transaction using Redis WATCH.
        Ensures price stability and stock availability during the 'Warp' window.
        """
        import redis
        
        try:
            data = request.data
            client_secret = data.get('clientSecret')
            client_price = data.get('price')
            client_ts = data.get('timestamp') # When the user clicked
            product_id = "pro_001_nebula" # Hardcoded for this prototype
            
            # Simulate processing time (Part of the 800ms window)
            # time.sleep(0.3) 
            
            r = redis.Redis(host='localhost', port=6379, db=0)
            price_key = f"sc:prod:price:{product_id}"
            stock_key = f"sc:prod:stock:{product_id}"
            
            # Redis Atomic Transaction (WATCH)
            pipe = r.pipeline()
            
            try:
                pipe.watch(price_key, stock_key)
                
                # Fetch current state
                current_price_raw = pipe.get(price_key)
                stock_raw = pipe.get(stock_key)
                
                current_price = float(current_price_raw) if current_price_raw else 100.0
                current_stock = int(stock_raw) if stock_raw else 0
                
                # 1. Paradox Check: Out of Stock
                if current_stock <= 0:
                    pipe.unwatch()
                    raise Exception("PARADOX: Singularity collapse. Product is out of stock.")
                
                # 2. Paradox Check: Price Deviation (Decayed further or changed)
                # Allow a tiny float epsilon, but strict check as requested
                if abs(current_price - float(client_price)) > 0.01:
                     pipe.unwatch()
                     raise Exception(f"PARADOX: Temporal slip detected. Price moved from {client_price} to {current_price}.")
                
                # 3. Paradox Check: Forced Error (for testing)
                if data.get('force_paradox'):
                    pipe.unwatch()
                    raise Exception("PARADOX: Simulated timeline fracture.")
                
                # Execute Transaction
                pipe.multi()
                pipe.decr(stock_key)
                # Verify mass/hits updates could happen here too, but decay engine handles them.
                # We just consume stock.
                pipe.execute()
                
                return Response({
                    'status': 'captured',
                    'message': 'Hyperdrive jump successful. Stock decremented.',
                    'final_price': current_price,
                    'remaining_stock': current_stock - 1
                })
                
            except redis.WatchError:
                # Transaction failed due to concurrent modification
                raise Exception("PARADOX: Interference detected. Another observer collapsed the waveform.")
                
        except Exception as e:
             # Return error to trigger Red Screen in Frontend
             return Response({'error': str(e)}, status=status.HTTP_409_CONFLICT)
