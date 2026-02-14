import msgpack
import time
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def broadcast_price_pulse(product_id, price):
    """
    Serializes price data using MessagePack and broadcasts to the global_pulse group.
    """
    channel_layer = get_channel_layer()
    
    # MessagePack Schema: 
    # id: Product UUID
    # p: Current Price
    # t: Server Timestamp
    payload = {
        'id': product_id,
        'p': float(price),
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
