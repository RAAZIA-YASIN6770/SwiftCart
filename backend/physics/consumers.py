"""
WebSocket Consumer for Health Check
Implements ping-pong protocol to verify real-time pulse
"""

import json
import time
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
    """
    
    async def connect(self):
        """Join global_pulse group and accept connection"""
        self.group_name = "global_pulse"
        
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        
        await self.accept()
        
    async def disconnect(self, close_code):
        """Leave global_pulse group"""
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
        await self.send(bytes_data=binary_data)

