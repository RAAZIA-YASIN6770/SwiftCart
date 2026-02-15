from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import stripe
from django.conf import settings

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
