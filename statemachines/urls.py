from django.urls import path
from . import views

urlpatterns = [
    path('', views.canvas, name='canvas'),
    path('login', views.login_request, name='login'),
    path('logout', views.logout_request, name='logout'),
    path('register', views.register, name='register'),
    path('account_error', views.account_error, name='account_error'),
    path('account_settings', views.account_settings, name='account_settings')
]
