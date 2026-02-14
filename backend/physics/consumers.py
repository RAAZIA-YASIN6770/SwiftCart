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
