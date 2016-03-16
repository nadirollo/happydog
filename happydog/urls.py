"""happydog URL Configuration
"""
from django.conf.urls import url
from django.contrib import admin
from happy import views

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^inicio$', views.index),
    url(r'^clientes$', views.customers),
    url(r'^get_appointments$', views.get_appointments),
    url(r'^get_pets$', views.get_pets),
    url(r'^get_pet$', views.get_pet)
]
