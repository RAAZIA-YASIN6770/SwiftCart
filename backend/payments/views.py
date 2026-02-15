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
        Simulates the final state-save and capture.
        In a real scenario, this might verify the webhook signature or capture the intent.
        For Story 4.2 "Zero-Step Execution", this acts as the "Final Confirmation".
        """
        try:
            # Simulate processing time
            time.sleep(0.5)
            
            # Simulate "Paradox" error randomly or via instruction (for now, mostly success)
            # But prompt says "If the backend returns an error, trigger a 'Paradox' visual"
            # We'll assume success unless a specific 'simulate_error' flag is sent, OR just random for testing?
            # Better: Let's succeed by default, but allow error forcing.
            
            data = request.data
            if data.get('force_paradox'):
                raise Exception("Paradox detected: Timeline desynchronization.")

            return Response({
                'status': 'captured',
                'message': 'Hyperdrive jump successful.'
            })
        except Exception as e:
             return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
