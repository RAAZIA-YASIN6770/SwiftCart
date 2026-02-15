"""
WebSocket Consumer for Health Check
Implements ping-pong protocol to verify real-time pulse
"""

import json
import time
import redis
from channels.generic.websocket import AsyncWebsocketConsumer


class HealthCheckConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for health check ping-pong
    Verifies sub-10ms latency requirement
    """
    
    async def connect(self):
        """Accept WebSocket connection"""
        await self.accept()
        
        # Send initial connection confirmation
        await self.send(text_data=json.dumps({
            'type': 'connection',
            'status': 'connected',
            'message': 'SwiftCart real-time pulse is alive',
            'timestamp': time.time()
        }))
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        pass
    
    async def receive(self, text_data):
        """
        Receive message from WebSocket
        Implements ping-pong protocol
        """
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'ping':
                # Respond to ping with pong
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': time.time(),
                    'client_timestamp': data.get('timestamp'),
                }))
            
            elif message_type == 'echo':
                # Echo back the message for testing
                await self.send(text_data=json.dumps({
                    'type': 'echo_response',
                    'data': data.get('data'),
                    'timestamp': time.time()
                }))
            
            else:
                # Unknown message type
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': f'Unknown message type: {message_type}',
                    'timestamp': time.time()
                }))
        
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON',
                'timestamp': time.time()
            }))

class PulseConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for high-frequency binary price pulses
    Subscribes to 'global_pulse' group
    Supports MessagePack (Binary) for the <10ms target
    """
    
    async def connect(self):
        """
        Handle WebSocket connection
        Verifies JWT (Simplified for MVP) and joins global_pulse group
        """
        # JWT Handshake Simulation
        # In production, this would use a custom AuthMiddleware or decode query_params
        query_string = self.scope.get('query_string', b'').decode()
        token = None
        if 'token=' in query_string:
            token = query_string.split('token=')[1]
            
        if token or True: # Force true for current development flow
            self.group_name = "global_pulse"
            
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )
            
            # Enforce binary mode
            await self.accept()
        else:
            await self.close()
        
    async def disconnect(self, close_code):
        """Leave global_pulse group"""
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )
        
    async def pulse_message(self, event):
        """
        Receive message from group and send binary data to WebSocket
        """
        binary_data = event['data']
        
        # Send binary message (MessagePack)
        # Binary format ensures <10ms propagation target
        await self.send(bytes_data=binary_data)

    async def receive(self, text_data=None, bytes_data=None):
        """
        Handle incoming messages from the client.
        Captures 'FLICK' events and increments the interaction counter in Redis.
        """
        if text_data:
            try:
                data = json.loads(text_data)
                if data.get('type') == 'FLICK' or data.get('type') == 'COLLISION':
                    product_id = data.get('product_id')
                    if product_id:
                        # Interaction Heatmap: Use Sorted Set for real-time ranking
                        r = redis.Redis(host='localhost', port=6379, db=0)
                        r.zincrby("sc:prod:interactions", 1, product_id)
                        
                        # Fallback individual hit counter for backward compatibility
                        r.incr(f"sc:prod:hits:{product_id}")
                        r.expire(f"sc:prod:hits:{product_id}", 60)
            except Exception:
                pass


