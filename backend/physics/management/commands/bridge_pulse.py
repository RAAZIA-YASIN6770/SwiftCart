import asyncio
import redis
import json
import msgpack
from django.core.management.base import BaseCommand
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

class Command(BaseCommand):
    help = 'Bridges Redis Pub/Sub price pulses to Django Channels'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting Redis-to-Channels Pulse Bridge..."))
        
        # Connect to Redis
        r = redis.Redis(host='localhost', port=6379, db=0)
        pubsub = r.pubsub()
        pubsub.subscribe('price_pulses')
        
        channel_layer = get_channel_layer()
        
        try:
            for message in pubsub.listen():
                if message['type'] == 'message':
                    # Message from Redis Pub/Sub
                    # Expecting MessagePack binary data or JSON
                    try:
                        # We just forward the binary data to the Channels group
                        # No need to decode/re-encode unless we need to inspect it
                        binary_data = message['data']
                        
                        async_to_sync(channel_layer.group_send)(
                            "global_pulse",
                            {
                                "type": "pulse.message",
                                "data": binary_data,
                            }
                        )
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f"Bridge Error: {e}"))
        except KeyboardInterrupt:
            self.stdout.write(self.style.WARNING("Bridge stopped."))
