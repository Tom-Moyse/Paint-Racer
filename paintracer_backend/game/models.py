from django.db import models
from users.models import Profile

# Create your models here.
class Track(models.Model):
    class Visibility(models.TextChoices):
        PUBLIC = 'public', 'Public'
        UNLISTED = 'unlisted', 'Unlisted'
        PRIVATE = 'private', 'Private'
    author = models.ForeignKey(Profile, on_delete=models.CASCADE)
    visibility = models.CharField(max_length=8, choices=Visibility.choices, default=Visibility.PUBLIC)
    name = models.CharField(max_length=50)
    description = models.TextField()
    image = models.ImageField(upload_to='trackimages/')
    trackdata = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

class TrackTime(models.Model):
    track = models.ForeignKey(Track, on_delete=models.CASCADE)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    duration = models.PositiveIntegerField() #Up to 596 hours should be more than sufficient
    created_at = models.DateTimeField(auto_now_add=True)