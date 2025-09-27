# backend/flowlang_api/views.py
import os
import json
import re
import requests
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


class FlowLangGenerator:
    def __init__(self):
        # Reverse mapping for icons
        self.reverse_icons_map = {
            '📄': 'file-text', '🔍': 'filter', '📚': 'layers', '🗄️': 'database',
            '🚩': 'flag', '⚠️': 'alert-triangle', '📦': 'archive', '💡': 'lightbulb',
            '👥': 'users', '🧲': 'magnet', '⚡': 'lightning', '📊': 'bar-chart-2',
            '🥧': 'pie-chart', '📁': 'file', '💻': 'cpu', '🕒': 'clock',
            '🛡️': 'shield', '⚏': 'grid', '▶️': 'play', '⏸️': 'pause',
            '⏹️': 'stop', '⚙️': 'settings', '✅': 'check', '❌': 'x',
            '➡️': 'arrow-right', '⬅️': 'arrow-left', '⬆️': 'upload',
            '⬇️': 'download', '🔄': 'refresh', '🔔': 'bell', '⚪': 'circle',
            '📝': 'file-text', '💎': 'settings'
        }
    
    def generate_flowlang_from_diagram(self, nodes, edges, diagram_title):
        try:
            # Start building FlowLang code
            flowlang_lines = []
            
            # Add diagram declaration
            flowlang_lines.append(f'Diagram [color: blue, layout: horizontal, title: "{diagram_title}"] {{')
            flowlang_lines.append('')
            
            # Group nodes by type for better organization
            nodes_by_type = {}
            for node in nodes:
                node_type = node.get('data', {}).get('type', 'activity')
                if node_type not in nodes_by_type:
                    nodes_by_type[node_type] = []
                nodes_by_type[node_type].append(node)
            
            # Create a mapping of node IDs to clean names for FlowLang
            node_id_to_name = {}
            
            # Generate nodes section by section
            for node_type, type_nodes in nodes_by_type.items():
                section_name = node_type.capitalize() + 's'
                flowlang_lines.append(f'  // {section_name} Section')
                flowlang_lines.append(f'  {section_name} {{')
                
                for node in type_nodes:
                    node_data = node.get('data', {})
                    node_id = node.get('id', '')
                    label = node_data.get('label', node_id)
                    icon = node_data.get('icon', '⚪')
                    node_type = node_data.get('type', 'activity')
                    
                    # Convert emoji back to icon name
                    icon_name = self.reverse_icons_map.get(icon, 'circle')
                    
                    # Clean node ID for FlowLang (remove special characters, use CamelCase)
                    clean_name = self._clean_node_id(node_id, label)
                    node_id_to_name[node_id] = clean_name
                    
                    flowlang_lines.append(
                        f'    {clean_name} [type: {node_type}, icon: {icon_name}, label: "{label}"]'
                    )
                
                flowlang_lines.append('  }')
                flowlang_lines.append('')
            
            # Generate connections
            if edges:
                flowlang_lines.append('  // Connections')
                for edge in edges:
                    source_id = edge.get('source', '')
                    target_id = edge.get('target', '')
                    label = edge.get('label', '')
                    animated = edge.get('animated', False)
                    
                    source_name = node_id_to_name.get(source_id, source_id)
                    target_name = node_id_to_name.get(target_id, target_id)
                    
                    if animated:
                        connection = f'  {source_name} **>** {target_name}'
                    elif label:
                        connection = f'  {source_name} --> {target_name} : {label}'
                    else:
                        connection = f'  {source_name} > {target_name}'
                    
                    flowlang_lines.append(connection)
            
            flowlang_lines.append('}')
            
            flowlang_code = '\n'.join(flowlang_lines)
            
            return {
                'flowlang_code': flowlang_code,
                'success': True
            }
            
        except Exception as e:
            return {
                'error': str(e),
                'success': False
            }
    
    def _clean_node_id(self, node_id, label=""):
        """Convert node ID to FlowLang-compatible format"""
        # Try to use label first if it's meaningful
        if label and label != node_id and not label.startswith('New '):
            text_to_clean = label
        else:
            text_to_clean = node_id
        
        # Remove 'node-' prefix and timestamp if present
        if text_to_clean.startswith('node-'):
            parts = text_to_clean.split('-')
            if len(parts) >= 2:
                text_to_clean = parts[1]  # Take the type part
        
        # Convert to CamelCase and remove special characters
        parts = re.split(r'[^a-zA-Z0-9]+', text_to_clean)
        if not parts or not parts[0]:
            return 'Node'
        
        # Capitalize first letter of each part except the first
        camel_case = parts[0].lower()
        for part in parts[1:]:
            if part:
                camel_case += part.capitalize()
        
        # Ensure it starts with a letter
        if not camel_case or not camel_case[0].isalpha():
            camel_case = 'node' + (camel_case.capitalize() if camel_case else 'Default')
        
        return camel_case or 'Node'


class FlowLangParser:
    def __init__(self):
        self.icons_map = {
            'file-text': '📄', 'filter': '🔍', 'layers': '📚', 'database': '🗄️',
            'flag': '🚩', 'alert-triangle': '⚠️', 'archive': '📦', 'lightbulb': '💡',
            'users': '👥', 'magnet': '🧲', 'lightning': '⚡', 'bar-chart-2': '📊',
            'pie-chart': '🥧', 'file': '📁', 'cpu': '💻', 'clock': '🕒',
            'shield': '🛡️', 'code': '💻', 'grid': '⚏', 'play': '▶️',
            'pause': '⏸️', 'stop': '⏹️', 'settings': '⚙️', 'check': '✅',
            'x': '❌', 'arrow-right': '➡️', 'arrow-left': '⬅️', 'upload': '⬆️',
            'download': '⬇️', 'refresh': '🔄', 'search': '🔍', 'bell': '🔔',
            'circle': '⚪'
        }
    
    def parse_flowlang(self, flowlang_code):
        try:
            nodes = []
            edges = []
            
            # Extract diagram info
            diagram_match = re.search(r'(\w+)\s*\[([^\]]+)\]\s*{', flowlang_code)
            diagram_info = {}
            if diagram_match:
                attrs = diagram_match.group(2)
                color_match = re.search(r'color:\s*([^,}]+)', attrs)
                title_match = re.search(r'title:\s*"([^"]+)"', attrs)
                
                if color_match:
                    diagram_info['color'] = color_match.group(1).strip()
                if title_match:
                    diagram_info['title'] = title_match.group(1)
            
            # Parse nodes with improved positioning
            node_pattern = r'(\w+)\s*\[([^\]]+)\]'
            node_matches = re.findall(node_pattern, flowlang_code)
            
            x_position = 100
            y_position = 100
            section_y_offset = 0
            nodes_processed = 0
            
            # Create a mapping of node names to IDs for connections
            name_to_id = {}
            
            for i, (node_name, attrs) in enumerate(node_matches):
                if 'type:' not in attrs:  # Skip diagram declaration
                    continue
                
                # Parse attributes
                type_match = re.search(r'type:\s*([^,\]]+)', attrs)
                icon_match = re.search(r'icon:\s*([^,\]]+)', attrs)
                label_match = re.search(r'label:\s*"([^"]+)"', attrs)
                
                node_type = type_match.group(1).strip() if type_match else 'activity'
                icon = icon_match.group(1).strip() if icon_match else 'circle'
                label = label_match.group(1) if label_match else node_name
                
                # Position nodes in a flow layout
                if nodes_processed > 0 and nodes_processed % 3 == 0:
                    section_y_offset += 200
                    x_position = 100
                else:
                    x_position = 100 + (nodes_processed % 3) * 300
                
                # Create unique node ID that preserves the name for connections
                node_id = f"node-{node_name}-{nodes_processed}"
                name_to_id[node_name] = node_id
                
                nodes.append({
                    'id': node_id,
                    'type': 'custom',
                    'position': {'x': x_position, 'y': y_position + section_y_offset},
                    'data': {
                        'label': label,
                        'type': node_type,
                        'icon': self.icons_map.get(icon, '⚪'),
                        'backgroundColor': self._get_background_color(node_type),
                        'textColor': self._get_text_color(node_type),
                        'iconColor': self._get_icon_color(node_type),
                        # Legacy support for old color property
                        'color': self._get_icon_color(node_type)
                    }
                })
                
                nodes_processed += 1
            
            # Parse connections with improved handling
            connection_patterns = [
                r'(\w+)\s*\*\*>\*\*\s*(\w+)(?:\s*:\s*([^:\n\[]+))?',  # **>**
                r'(\w+)\s*-->\s*(\w+)\s*:\s*([^:\n]+)',  # --> with label
                r'(\w+)\s*>\s*(\w+)(?:\s*:\s*([^:\n\[]+))?'  # simple >
            ]
            
            for pattern in connection_patterns:
                matches = re.findall(pattern, flowlang_code)
                for match in matches:
                    source_name, target_name = match[0], match[1]
                    source_id = name_to_id.get(source_name, source_name)
                    target_id = name_to_id.get(target_name, target_name)
                    
                    label = ''
                    animated = False
                    if len(match) > 2 and match[2]:
                        label = match[2].strip()
                    
                    # Check if this is an animated connection
                    if '**>' in pattern:
                        animated = True
                    
                    # Avoid duplicate edges
                    edge_id = f"{source_id}-{target_id}"
                    if not any(edge['id'] == edge_id for edge in edges):
                        edges.append({
                            'id': edge_id,
                            'source': source_id,
                            'target': target_id,
                            'label': label,
                            'type': 'smoothstep',
                            'animated': animated,
                            'style': {'stroke': '#6B7280', 'strokeWidth': 2},
                            'markerEnd': {
                                'type': 'arrowclosed',
                                'width': 20,
                                'height': 20,
                                'color': '#6B7280',
                            }
                        })
            
            return {
                'nodes': nodes,
                'edges': edges,
                'diagram_info': diagram_info,
                'success': True
            }
        
        except Exception as e:
            return {
                'error': str(e),
                'success': False
            }
    
    def _get_background_color(self, node_type):
        colors = {
            'event': '#F0FDF4',
            'activity': '#FFF7ED',
            'note': '#FAF5FF',
            'decision': '#EFF6FF'
        }
        return colors.get(node_type, '#F9FAFB')
    
    def _get_text_color(self, node_type):
        colors = {
            'event': '#166534',
            'activity': '#EA580C',
            'note': '#7C3AED',
            'decision': '#2563EB'
        }
        return colors.get(node_type, '#374151')
    
    def _get_icon_color(self, node_type):
        colors = {
            'event': '#16A34A',
            'activity': '#F97316',
            'note': '#8B5CF6',
            'decision': '#3B82F6'
        }
        return colors.get(node_type, '#6B7280')


@api_view(['POST'])
def generate_flowlang(request):
    try:
        data = request.data
        user_prompt = data.get('prompt', '')
        api_key = data.get('api_key', '')
        model = data.get('model', 'llama-3.1-70b-versatile')
        
        if not user_prompt or not api_key:
            return Response({
                'error': 'Prompt and API key are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # FlowLang generation prompt
        flowlang_prompt = f"""You are a FlowLang code generator. Generate FlowLang code based on my description. 
Follow these rules strictly:
1. Use this structure:
   // Pools and lanes
   Diagram [color: <color>, layout: <layout>, title: "<title>"] {{
     
     // Section comment
     SectionName {{
        NodeName [type: <event|activity|note>, icon: <icon-name>, label: "<description>"]
        ...
     }}
   }}
2. For connections, use:
   NodeA > NodeB          // For direct sequence flow
   NodeA --> NodeB : Note // For conditional flows, add label after colon
   NodeA **>** NodeB      // For emphasized connections
3. Every node MUST have:
   - Unique name (CamelCase, no spaces)
   - type (event/activity/note)
   - icon (use: file-text, filter, layers, database, flag, alert-triangle, archive, lightbulb, users, cpu, shield, etc.)
   - label (human-readable description in quotes)
4. Use `//` comments to explain sections.
5. Keep naming consistent: use CamelCase for nodes and readable titles.
6. Create 4-8 nodes with logical flow connections.
7. Never invent new syntax. Only use nodes, attributes, and connections as specified.
Return only FlowLang code. No explanations.

User request: {user_prompt}"""
        
        # Use GROQ API via HTTP requests
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": flowlang_prompt}],
            "temperature": 0.3,
            "max_tokens": 1500,
            "top_p": 1.0,
            "stream": False
        }
        
        print(f"Making request to GROQ with model: {model}")
        
        # Make request to GROQ API
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        print(f"Response Status: {response.status_code}")
        
        if not response.ok:
            error_details = response.text
            print(f"GROQ API Error Response: {error_details}")
            return Response({
                'error': f'GROQ API error ({response.status_code}): {error_details}',
                'success': False
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        response_data = response.json()
        
        if 'choices' not in response_data or not response_data['choices']:
            return Response({
                'error': 'Invalid response structure from GROQ API',
                'success': False
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        llm_output = response_data["choices"][0]["message"]["content"]
        flowlang_code = re.sub(r"```(?:flowlang)?|```", "", llm_output).strip()
        
        return Response({
            'flowlang_code': flowlang_code,
            'success': True
        })
        
    except requests.exceptions.RequestException as e:
        print(f"GROQ API Request Error: {str(e)}")
        return Response({
            'error': f'GROQ API request failed: {str(e)}',
            'success': False
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    except Exception as e:
        print(f"Error in generate_flowlang: {str(e)}")
        return Response({
            'error': str(e),
            'success': False
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def parse_flowlang(request):
    try:
        data = request.data
        flowlang_code = data.get('flowlang_code', '')
        
        if not flowlang_code:
            return Response({
                'error': 'FlowLang code is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        parser = FlowLangParser()
        result = parser.parse_flowlang(flowlang_code)
        
        return Response(result)
        
    except Exception as e:
        print(f"Error in parse_flowlang: {str(e)}")
        return Response({
            'error': str(e),
            'success': False
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def sync_diagram(request):
    """
    Synchronize the current diagram state (nodes and edges) to FlowLang code
    This ensures manual changes are reflected in the code representation
    """
    try:
        data = request.data
        nodes = data.get('nodes', [])
        edges = data.get('edges', [])
        diagram_title = data.get('diagram_title', 'Diagram')
        
        if not nodes:
            return Response({
                'flowlang_code': '',
                'success': True
            })
        
        generator = FlowLangGenerator()
        result = generator.generate_flowlang_from_diagram(nodes, edges, diagram_title)
        
        return Response(result)
        
    except Exception as e:
        print(f"Error in sync_diagram: {str(e)}")
        return Response({
            'error': str(e),
            'success': False
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)