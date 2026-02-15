import msgpack
import time
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def broadcast_price_pulse(product_id, price, position=None, velocity=None):
    """
    Serializes state data using MessagePack and broadcasts to the global_pulse group.
    """
    channel_layer = get_channel_layer()
    
    # MessagePack Schema (Optimized Short Keys)
    # id: Product UUID
    # p: Current Price
    # pos: Position {x, y}
    # vel: Velocity {x, y}
    # m: Mass
    # t: Server Timestamp
    payload = {
        'id': product_id,
        'p': float(price),
        'm': 1.0, # Initial base mass
        'pos': position or {'x': 0, 'y': 0},
        'vel': velocity or {'x': 0, 'y': 0},
        'ins': 0.0, # Instability (0.0 to 1.0) - Story 3.1
        't': time.time()
    }
    
    binary_data = msgpack.packb(payload, use_bin_type=True)
    
    async_to_sync(channel_layer.group_send)(
        "global_pulse",
        {
            "type": "pulse.message",
            "data": binary_data,
        }
    )

def broadcast_celestial_update(gravity=None, base_mass=None, force_pulse=False, product_id=None):
    """
    Broadcasts global physics constants or a Force Pulse event.
    """
    channel_layer = get_channel_layer()
    
    payload = {
        'type': 'CELESTIAL',
        'g': gravity,
        'm': base_mass,
        'pulse': force_pulse,
        'pid': product_id,
        't': time.time()
    }
    
    binary_data = msgpack.packb(payload, use_bin_type=True)
    
    async_to_sync(channel_layer.group_send)(
        "global_pulse",
        {
            "type": "pulse.message",
            "data": binary_data,
        }
    )

