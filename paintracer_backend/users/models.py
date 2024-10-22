from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=40)
    
    def __str__(self):
        return f"ID: {self.id}, User: {self.user}, Name: {self.name}"