from rest_framework import serializers
from .models import Pesanan

class PesananSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pesanan
        fields = "__all__"