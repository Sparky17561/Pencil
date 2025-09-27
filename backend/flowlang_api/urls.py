
# backend/flowlang_api/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('generate-flowlang/', views.generate_flowlang, name='generate_flowlang'),
    path('parse-flowlang/', views.parse_flowlang, name='parse_flowlang'),
    path('sync-diagram/', views.sync_diagram, name='sync_diagram'),
]
