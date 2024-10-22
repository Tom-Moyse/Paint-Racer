from rest_framework.pagination import PageNumberPagination

class TrackPagination(PageNumberPagination):
    page_size = 10  # Number of tracks per page