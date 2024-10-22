from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from .models import *
from .serializers import *
from .pagination import *

# Create your views here.
class TrackCreationView(APIView):
    def post(self, request):
        serializer = TrackSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class TrackUpdateView(APIView):
    def put(self, request, track_id):
        try:
            track = Track.objects.get(id=track_id)
        except Track.DoesNotExist:
            return Response({"detail": "Track not found."}, status=status.HTTP_404_NOT_FOUND)
        print(request.data)
        serializer = TrackSerializer(track, data=request.data, partial=True)  # Allow partial updates
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TrackDeletionView(APIView):
    def delete(self, request, track_id):
        try:
            track = Track.objects.get(id=track_id)
        except Track.DoesNotExist:
            return Response({"detail": "Track not found."}, status=status.HTTP_404_NOT_FOUND)
        
        track.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class TrackReadView(APIView):
    def get(self, request, track_id):
        try:
            track = Track.objects.get(id=track_id)
        except Track.DoesNotExist:
            return Response({"detail": "Track not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = TrackSerializer(track, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

class TrackReadRecentView(ListAPIView):
    serializer_class = TrackSerializer
    pagination_class = TrackPagination

    def get_queryset(self):
        # Order tracks by 'created_at' descending (most recent first)
        return Track.objects.filter(visibility='public').order_by('-created_at')
    
class TrackReadUserView(ListAPIView):
    serializer_class = TrackSerializer
    pagination_class = TrackPagination

    def get_queryset(self):
        # Order tracks by 'created_at' descending (most recent first)
        user_id = self.kwargs.get('user_id')
        return Track.objects.filter(author=user_id).order_by('-created_at')

class TrackTimeCreationView(APIView):
    def post(self, request, track_id):
        data = request.data.copy()
        data['track'] = track_id
        serializer = TrackTimeSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TrackTimeReadView(APIView):
    def get(self, request, track_id):
        try:
            track = Track.objects.get(pk=track_id)  # Retrieve the Track instance
            track_times = TrackTime.objects.filter(track=track).order_by('duration')[:10]  # Query TrackTime instances ordered by duration limited to 10
            serializer = TrackTimeSerializer(track_times, many=True)  # Serialize the queryset
            return Response(serializer.data, status=status.HTTP_200_OK)  # Return serialized data
        except Track.DoesNotExist:
            return Response({"detail": "Track not found."}, status=status.HTTP_404_NOT_FOUND)  # Handle not found error

class TrackTimeUserReadView(APIView):
    def get(self, request, track_id, user_id):
        try:
            track = Track.objects.get(pk=track_id)  # Retrieve the Track instance
            profile = Profile.objects.get(pk=user_id)
            track_time = TrackTime.objects.filter(track=track, profile=profile).order_by('duration').first()  # Query TrackTime instances ordered by duration limited to 10
            serializer = TrackTimeSerializer(track_time)  # Serialize the queryset
            return Response(serializer.data, status=status.HTTP_200_OK)  # Return serialized data
        except Track.DoesNotExist:
            return Response({"detail": "Track not found."}, status=status.HTTP_404_NOT_FOUND)  # Handle not found error
        except Profile.DoesNotExist:
            return Response({"detail": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)  # Handle not found error