from django.urls import path
from . import views

urlpatterns = [
    path('', views.canvas, name='canvas'),
    path('login', views.login_request, name='login'),

    # Have to add this because it directs to here on my laptop for some reason
    path('login/', views.login_request, name='login'),
    path('logout', views.logout_request, name='logout'),
    path('register', views.register, name='register'),
    path('account_error', views.account_error, name='account_error'),
    path('save_success', views.save_success, name='save_success'),
    path('get_diagram/<diagram>', views.get_diagram, name='get_diagram'),
    path('get_user_diagrams', views.get_user_diagrams, name='get_user_diagrams'),
    path('account_settings', views.account_settings, name='account_settings'),
    path('file_already_exists', views.file_already_exists, name='file_already_exists'),
    path('dashboard', views.dashboard, name='dashboard'),
    path('save/', views.save, name='save')
]
