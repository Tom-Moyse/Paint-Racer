from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import UserRegistrationSerializer, UserLoginSerializer
from django.db.models import Min
from .models import *
from game.models import *

class UserRegistrationView(APIView):
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            Profile.objects.create(user=user, name=user.username)
            return Response({'message': 'User registered successfully!'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserLoginView(APIView):
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            #login(request, user)  # Logs in the user and creates a session
            return Response({"message": "Login successful!", "userid": user.profile.id}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserLogoutView(APIView):
    def post(self, request):
        return Response(status=status.HTTP_501_NOT_IMPLEMENTED)
    
class UserDeletionView(APIView):
    def delete(self, request, profile_id):
        try:
            profile = Profile.objects.get(id=profile_id)  # Fetch the user by ID
            profile.user.delete()
            return Response({"message": "User deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except Profile.DoesNotExist:
            return Response({"error": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)
        
class ProfileStatsView(APIView):
    def get(self, request, profile_id):
        try:
            profile = Profile.objects.get(id=profile_id)
        except Profile.DoesNotExist:
            return Response({"error": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)
        
        stats = self.get_track_statistics(profile)
        info = {"username": profile.user.username, "email": profile.user.email, "created_at": profile.user.date_joined}
        return Response({"message": "Statistics retrieved successfully", "stats": stats, "info": info}, status=status.HTTP_200_OK)
    
    def get_track_statistics(self, profile: Profile):
        # Fetch all TrackTime entries for the user and annotate with track info
        track_times = TrackTime.objects.filter(profile=profile).select_related('track')

        # Get total authored tracks
        tracks_authored = Track.objects.filter(author=profile).count()

        # Calculate the number of world records
        shortest_durations = (
            TrackTime.objects
            .values('track')
            .annotate(min_duration=Min('duration'))
        )

        # Get counts from track_times queryset
        authored_playcount = TrackTime.objects.filter(track__author=profile).exclude(profile=profile).count()
        playcount = track_times.count()
        distinct_playcount = track_times.values('track').distinct().count()

        # Count world records
        wr_count = (
            track_times
            .filter(duration__in=shortest_durations.values('min_duration'))
            .values('track')
            .distinct()
            .count()
        )

        return {
            'tracks_authored': tracks_authored,
            'wr_count': wr_count,
            'authored_playcount': authored_playcount,
            'playcount': playcount,
            'distinct_playcount': distinct_playcount,
        }
