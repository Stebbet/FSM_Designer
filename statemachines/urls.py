from django.urls import path
from . import views

urlpatterns = [
    path('', views.canvas, name='canvas'),
    path('login', views.login_request, name='login'),

    # Have to add this because it directs to here on my laptop for some reason
    path('login/', views.login_request, name='login'),
    path('login_failed', views.login_failed, name='login_failed'),
    path('logout', views.logout_request, name='logout'),
    path('register', views.register, name='register'),
    path('register_failed', views.register_failed, name='register_failed'),
    path('account_error', views.account_error, name='account_error'),
    path('save_success', views.save_success, name='save_success'),
    path('get_diagram/<diagram>', views.get_diagram, name='get_diagram'),
    path('delete/<diagram>', views.delete, name='delete'),
    path('get_user_diagrams', views.get_user_diagrams, name='get_user_diagrams'),
    path('account_settings', views.account_settings, name='account_settings'),
    path('imports', views.imports, name='imports'),
    path('accept_import', views.accept_import, name='accept_import'),
    path('are_you_sure', views.are_you_sure, name='are_you_sure'),
    path('file_already_exists', views.file_already_exists, name='file_already_exists'),
    path('dashboard', views.dashboard, name='dashboard'),
    path('delete_account', views.delete_account, name='delete_account'),
    path('delete_success', views.delete_success, name='delete_success'),
    path('save/', views.save, name='save'),
    path('help', views.help, name='help')
]
