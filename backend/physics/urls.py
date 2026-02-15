from django.urls import path
from .views import SnapshotHandshakeView, RecoverSnapshotView

urlpatterns = [
    path('snapshot/handshake/', SnapshotHandshakeView.as_view(), name='snapshot-handshake'),
    path('snapshot/recover/', RecoverSnapshotView.as_view(), name='snapshot-recover'),
]
