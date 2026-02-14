import time
import random
import uuid
from django.core.management.base import BaseCommand
from physics.pulse import broadcast_price_pulse

class Command(BaseCommand):
    help = 'Simulates a 60Hz price pulse for a mock product'

    def add_arguments(self, parser):
        parser.add_argument('--product_id', type=str, help='Product UUID to pulse')
        parser.add_argument('--hz', type=str, default=60, help='Frequency in Hz')

    def handle(self, *args, **options):
        product_id = options['product_id'] or str(uuid.uuid4())
        hz = int(options['hz'])
        interval = 1.0 / hz
        
        base_price = 100.0
        self.stdout.write(self.style.SUCCESS(f"Starting {hz}Hz pulse for product {product_id}"))
        
        try:
            while True:
                # Simulate a small price fluctuation
                price = base_price + random.uniform(-0.5, 0.5)
                broadcast_price_pulse(product_id, price)
                time.sleep(interval)
        except KeyboardInterrupt:
            self.stdout.write(self.style.WARNING("Pulse stopped."))
