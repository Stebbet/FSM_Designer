from django.contrib import admin
from .models import UserInfo, ImageModel, DiagramsModel


# Register your models here.
admin.site.register(UserInfo)
admin.site.register(ImageModel)
admin.site.register(DiagramsModel)
