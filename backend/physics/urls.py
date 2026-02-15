from .views import SnapshotHandshakeView, RecoverSnapshotView, CelestialControlView, CelestialMetricsView

urlpatterns = [
    path('snapshot/handshake/', SnapshotHandshakeView.as_view(), name='snapshot-handshake'),
    path('snapshot/recover/', RecoverSnapshotView.as_view(), name='snapshot-recover'),
    path('celestial/control/', CelestialControlView.as_view(), name='celestial-control'),
    path('celestial/metrics/', CelestialMetricsView.as_view(), name='celestial-metrics'),
]
