from django.urls import path
from .views import *

urlpatterns = [
    path('login/', UserLoginView.as_view(), name="login"),
    path('logout/', UserLogoutView.as_view(), name="logout"),
    path('register/', UserRegistrationView.as_view(), name="register"),
    path('delete/<int:profile_id>', UserDeletionView.as_view(), name="userdelete"),
    path('stats/<int:profile_id>', ProfileStatsView.as_view(), name="profilestats")
]