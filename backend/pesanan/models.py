from django.db import models

class Pesanan(models.Model):
    STATUS_CHOICES = [
        ("BARU", "Baru"),
        ("DIJAHIT", "Dijahit"),
        ("SELESAI", "Selesai"),
        ("DIAMBIL", "Diambil"),
    ]
    nama_pemesan = models.CharField(max_length=100)
    jenis_jahitan = models.CharField(max_length=100)
    tanggal_masuk = models.DateField()
    tanggal_janji = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="BARU")
    catatan = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nama_pemesan} - {self.jenis_jahitan}"