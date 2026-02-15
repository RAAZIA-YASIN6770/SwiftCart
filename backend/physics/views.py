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
        
        return HttpResponse(packed_data, content_type='application/x-msgpack')
