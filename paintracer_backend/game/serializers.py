from rest_framework import serializers
from .models import Track, TrackTime
from users.models import Profile

class TrackSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = Track
        fields = ['id', 'author', 'author_name', 'visibility', 'name', 'description', 'image', 'trackdata', 'created_at']
    
    def get_image(self, obj):
        request = self.context.get('request')  # Get the current request from context
        if obj.image:
            return request.build_absolute_uri(obj.image.url)  # Build full URL
        return None
    
    def get_author_name(self, obj):
        if obj.author:
            return obj.author.name
        return None

    def validate_author(self, value):
        if not Profile.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Author profile does not exist.")
        return value

    def validate_visibility(self, value):
        if value not in Track.Visibility.values:
            raise serializers.ValidationError(f"Invalid visibility choice: {value}. Must be one of {Track.Visibility.values}.")
        return value


    def validate_trackdata(self, value):
        print(value)
        # Check if checkpoints is a list
        if not isinstance(value, dict):
            raise serializers.ValidationError("Track Data must be a dictionary.")
        
        # Check if there is at least one entry
        if len(value.get('checkpoints')) < 1:
            raise serializers.ValidationError("At least one checkpoint is required.")
        if (value.get('finish')) is None:
            raise serializers.ValidationError("Finish is required.")

        # Validate each entry in checkpoints
        for index, checkpoint in enumerate(value.get('checkpoints')):
            # Check if each checkpoint is a dictionary
            if not isinstance(checkpoint, dict):
                raise serializers.ValidationError(f"Checkpoint at index {index} must be a dictionary.")
            
            # Validate 'position' field
            position = checkpoint.get('position')
            if not isinstance(position, list) or len(position) != 2:
                raise serializers.ValidationError(f"Checkpoint at index {index} must have a 'position' field with two float values.")
            if not all(isinstance(coord, (int, float)) for coord in position):
                raise serializers.ValidationError(f"'position' coordinates at index {index} must be floats.")
            
            # Validate 'rotation' field
            rotation = checkpoint.get('rotation')
            if not isinstance(rotation, (int,float)):
                raise serializers.ValidationError(f"Checkpoint at index {index} must have a 'rotation' field that is a float.")
            
            size = checkpoint.get('size')
            if not isinstance(size, (int,float)):
                raise serializers.ValidationError(f"Checkpoint at index {index} must have a 'size' field that is a float.")
        
        return value
    
    def update(self, instance, validated_data):
        immutable_fields = ['author', 'image', 'trackdata']

        for field in immutable_fields:
            if field in validated_data:
                raise serializers.ValidationError({field: f"{field} cannot be modified."})
        
        # Update the instance with the validated data
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

class TrackTimeSerializer(serializers.ModelSerializer):
    profile_name = serializers.SerializerMethodField()

    class Meta:
        model = TrackTime
        fields = ['track', 'profile', 'profile_name', 'duration', 'created_at']

    def get_profile_name(self, obj):
        if obj.profile:
            return obj.profile.name
        return None

    def validate_track(self, value):
        if not Track.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Track id does not exist.")
        return value
    
    def validate_profile(self, value):
        if not Profile.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Submitted profile does not exist.")
        return value