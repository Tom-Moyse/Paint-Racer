from django.urls import path
from .views import *

urlpatterns = [
    path('track/read/<int:track_id>/', TrackReadView.as_view(), name="readtrack"),
    path('track/read/recent/', TrackReadRecentView.as_view(), name="readrecenttracks"),
    path('track/read/user/<int:user_id>/', TrackReadUserView.as_view(), name="readusertracks"),
    path('track/create/', TrackCreationView.as_view(), name="createtrack"),
    path('track/update/<int:track_id>/', TrackUpdateView.as_view(), name="updatetrack"),
    path('track/delete/<int:track_id>/', TrackDeletionView.as_view(), name="deletetrack"),
    path('trackrecord/create/<int:track_id>/', TrackTimeCreationView.as_view(), name="createrecord"),
    path('trackrecord/read/<int:track_id>/', TrackTimeReadView.as_view(), name="readrecords"),
    path('trackrecord/read/<int:track_id>/<int:user_id>/', TrackTimeUserReadView.as_view(), name="readuserrecord"),
]