import time
import redis
import json
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Executes the Price Decay Engine (Temporal + Interaction-Driven)'

    def add_arguments(self, parser):
        parser.add_argument('--msrp', type=float, default=100.0, help='Initial MSRP price')
        parser.add_argument('--interval', type=float, default=0.2, help='Decay interval in seconds (default 200ms)')

    def handle(self, *args, **options):
        msrp = options['msrp']
        interval = options['interval']
        floor_price = msrp * 0.70
        base_mass = 1.0
        mass_multiplier = 0.2 # 0.2 unit of mass per hit
        
        self.stdout.write(self.style.SUCCESS(f"Starting Price Decay Engine..."))
        self.stdout.write(f"MSRP: {msrp} | Floor: {floor_price} | Interval: {interval}s")
        
        r = redis.Redis(host='localhost', port=6379, db=0)
        
        # Product state keys in Redis
        # price_current: sc:prod:price:{id}
        # hits: sc:prod:hits:{id}
        # pubsub channel: price_pulses
        
        # Simulation product ID (In a real app, we'd loop over all active products)
        product_id = "test-orb-1"
        
        # Initialize price if not exists
        if not r.exists(f"sc:prod:price:{product_id}"):
            r.set(f"sc:prod:price:{product_id}", msrp)
            
        try:
            while True:
                # 1. Fetch current state
                current_price_raw = r.get(f"sc:prod:price:{product_id}")
                current_price = float(current_price_raw) if current_price_raw else msrp
                
                # 2. Fetch and reset hits
                hits_raw = r.getset(f"sc:prod:hits:{product_id}", 0)
                hits = int(hits_raw) if hits_raw else 0
                
                # 3. Calculate Decay
                # Temporal Decay: Constant drop over time
                temporal_decay = 0.01 
                
                # Interaction Decay: Drop proportional to hits
                interaction_decay = hits * 0.05
                
                new_price = current_price - (temporal_decay + interaction_decay)
                
                # 4. Enforce 70% Floor
                if new_price < floor_price:
                    new_price = floor_price
                
                # 4b. Calculate Communal Mass
                # Mass grows with hits, decays slowly back to base_mass (10% decay per interval)
                current_mass_raw = r.get(f"sc:prod:mass:{product_id}")
                current_mass = float(current_mass_raw) if current_mass_raw else base_mass
                new_mass = current_mass + (hits * mass_multiplier)
                new_mass = max(base_mass, new_mass - (new_mass - base_mass) * 0.05)
                    
                # 5. Update Redis State
                r.set(f"sc:prod:price:{product_id}", new_price)
                r.set(f"sc:prod:mass:{product_id}", new_mass)
                
                # 6. Publish Pulse
                import msgpack
                payload = {
                    'id': product_id,
                    'p': round(new_price, 2),
                    'm': round(new_mass, 2), # Communal Mass
                    'hits': hits,
                    't': time.time()
                }
                binary_data = msgpack.packb(payload)
                r.publish('price_pulses', binary_data)
                
                if hits > 0 or abs(new_price - current_price) > 0.001:
                    self.stdout.write(f"Price Update: {product_id} -> ${new_price:.2f} | Mass: {new_mass:.2f} (Hits: {hits})")
                
                time.sleep(interval)
                
        except KeyboardInterrupt:
            self.stdout.write(self.style.WARNING("Decay Engine stopped."))
