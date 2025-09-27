# backend/flowlang_api/models.py
from django.db import models

class FlowDiagram(models.Model):
    title = models.CharField(max_length=255)
    flowlang_code = models.TextField()
    user_prompt = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title

class DiagramNode(models.Model):
    diagram = models.ForeignKey(FlowDiagram, on_delete=models.CASCADE, related_name='nodes')
    node_id = models.CharField(max_length=100)
    node_type = models.CharField(max_length=50)  # event, activity, note
    label = models.TextField()
    icon = models.CharField(max_length=100)
    position_x = models.FloatField(default=0)
    position_y = models.FloatField(default=0)
    color = models.CharField(max_length=50, blank=True)
    
    def __str__(self):
        return f"{self.diagram.title} - {self.node_id}"

class DiagramConnection(models.Model):
    diagram = models.ForeignKey(FlowDiagram, on_delete=models.CASCADE, related_name='connections')
    source_node = models.CharField(max_length=100)
    target_node = models.CharField(max_length=100)
    connection_type = models.CharField(max_length=50, default='direct')  # direct, conditional
    label = models.CharField(max_length=255, blank=True)
    color = models.CharField(max_length=50, blank=True)
    
    def __str__(self):
        return f"{self.diagram.title} - {self.source_node} -> {self.target_node}"