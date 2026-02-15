from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import HttpResponse
from rest_framework import status
import redis
import msgpack

r = redis.Redis(host='localhost', port=6379, db=0)

class SnapshotHandshakeView(APIView):
    """
    Saves a binary snapshot of all orbs into Redis.
    """
    def post(self, request):
        session_id = request.headers.get('X-Session-ID', 'default_session')
        # Access raw body for potential binary data
        raw_data = request.body
        
        # We store the raw binary directly for speed
        r.set(f"sc:session:snapshot:{session_id}", raw_data, ex=3600)
        
        return Response({'status': 'anchored', 'session_id': session_id})

class RecoverSnapshotView(APIView):
    """
    Retrieves the last binary 'Anchor' from Redis.
    """
    def get(self, request):
        session_id = request.query_params.get('session_id', 'default_session')
        packed_data = r.get(f"sc:session:snapshot:{session_id}")
        
        if not packed_data:
            return HttpResponse(status=404)
        
from .pulse import broadcast_celestial_update

class CelestialControlView(APIView):
    """
    God Mode: Updates global physics constants in Redis and broadcasts them.
    Requires 'X-Celestial-Token' for simulation of JWT Auth.
    """
    def post(self, request):
        token = request.headers.get('X-Celestial-Token')
        if token != "CELESTIAL_ADMIN_2026":
            return Response({'error': 'Unauthorized: Temporal key invalid'}, status=status.HTTP_401_UNAUTHORIZED)
        
        gravity = request.data.get('gravity_coefficient')
        base_mass = request.data.get('base_mass')
        force_pulse = request.data.get('force_pulse', False)
        product_id = request.data.get('product_id') # For specific item pulse
        
        # Persistence in Redis
        if gravity is not None:
            r.set("sc:phys:gravity", gravity)
        if base_mass is not None:
            r.set("sc:phys:base_mass", base_mass)
            
        # Broadcast the update to all clients
        broadcast_celestial_update(
            gravity=gravity,
            base_mass=base_mass,
            force_pulse=force_pulse,
            product_id=product_id
        )
        
        return Response({'status': 'Celestial constants propagated'})

