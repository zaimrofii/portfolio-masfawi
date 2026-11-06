from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import Pesanan
from .serializers import PesananSerializer

class PesananViewSet(viewsets.ModelViewSet):
    queryset = Pesanan.objects.all().order_by("-created_at")
    serializer_class = PesananSerializer