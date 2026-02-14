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
    # t: Server Timestamp
    payload = {
        'id': product_id,
        'p': float(price),
        'pos': position or {'x': 0, 'y': 0},
        'vel': velocity or {'x': 0, 'y': 0},
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
