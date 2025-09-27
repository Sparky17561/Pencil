# FlowLang Eraser - AI-Powered Diagram Generator

A complete Eraser clone that allows users to create flowcharts and diagrams using AI with a custom FlowLang language. Built with Django backend and React frontend.

## 🌟 Features

- **AI-Powered Diagram Generation**: Use GROQ Cloud API to generate FlowLang code from natural language descriptions
- **Real-time Code Editor**: Edit FlowLang code with live diagram updates
- **Multiple Export Formats**: Export diagrams as PNG, SVG, PDF, or copy to clipboard
- **Custom FlowLang**: Domain-specific language for creating flowcharts
- **Interactive Canvas**: Built with ReactFlow for smooth diagram interaction
- **Modern UI**: Clean, responsive interface with Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn
- GROQ Cloud API key ([Get it here](https://console.groq.com))

### Installation

1. **Clone and setup the project:**

```bash
# Create project directory
mkdir flowlang-eraser && cd flowlang-eraser

# Backend setup
mkdir backend && cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create Django project
django-admin startproject flowlang_backend .
cd flowlang_backend
python manage.py startapp flowlang_api
cd ../..

# Frontend setup
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install reactflow lucide-react axios html2canvas jspdf @react-pdf/renderer
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
cd ..
```

2. **Configure environment variables:**

Create `backend/.env`:
```env
SECRET_KEY=your-django-secret-key-here
DEBUG=True
GROQ_API_KEY=your-groq-api-key-here
```

3. **Run database migrations:**

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
cd ..
```

4. **Start both servers:**

```bash
# Make script executable
chmod +x run_servers.sh
./run_servers.sh
```

Or run separately:

```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
python manage.py runserver 8000

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🎯 Usage

1. **Get GROQ API Key**: Sign up at [console.groq.com](https://console.groq.com) and get your API key
2. **Enter API Key**: Paste your GROQ API key in the sidebar
3. **Select Model**: Choose from Llama 3 70B, Llama 3 8B, Mixtral 8x7B, or Gemma 7B
4. **Describe Your Diagram**: Write a natural language description of the process/workflow you want to visualize
5. **Generate**: Click "Generate Diagram" to create FlowLang code and visualize it
6. **Edit Code**: Switch to the "Code" tab to manually edit the FlowLang code
7. **Export**: Use the export menu to save as PNG, SVG, PDF, or copy to clipboard

## 🔤 FlowLang Syntax

FlowLang is a custom domain-specific language for creating flowcharts:

```flowlang
// Pools and lanes
MyProcess [color: lightblue, layout: landscape, title: "My Process"] {
  
  // Section comment
  InputSection {
    StartEvent [type: event, icon: file-text, label: "Process starts"]
    ValidateData [type: activity, icon: filter, label: "Validate input data"]
    StoreData [type: activity, icon: database, label: "Store in database"]
  }
  
  OutputSection {
    GenerateReport [type: activity, icon: bar-chart-2, label: "Generate report"]
    EndEvent [type: event, icon: flag, label: "Process complete"]
  }
}

// Connections
StartEvent > ValidateData
ValidateData > StoreData
StoreData > GenerateReport
GenerateReport > EndEvent
```

### Node Types:
- `event`: Start/end points (green)
- `activity`: Process steps (orange)  
- `note`: Comments/explanations (purple)

### Connection Types:
- `>`: Direct flow
- `-->`: Conditional flow with label
- `**>**`: Emphasized connection

## 📁 Project Structure

```
flowlang-eraser/
├── backend/
│   ├── flowlang_backend/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── flowlang_api/
│   │   ├── models.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CustomNode.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ExportMenu.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── App.jsx
│   │   └── App.css
│   ├── package.json
│   └── tailwind.config.js
├── run_servers.sh
└── README.md
```

## 🔧 API Endpoints

- `POST /api/generate-flowlang/`: Generate FlowLang code from natural language
- `POST /api/parse-flowlang/`: Parse FlowLang code to React Flow format

## 🎨 Customization

### Adding New Node Types
1. Update `FlowLangParser._get_node_color()` in `views.py`
2. Add styles in `CustomNode.jsx`

### Adding New Icons
1. Update `icons_map` in `FlowLangParser` class
2. Use Lucide React icons or emojis

### Extending FlowLang Syntax
1. Modify parsing logic in `FlowLangParser.parse_flowlang()`
2. Update the prompt template in `generate_flowlang()` view

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Example Prompts

Try these example prompts to get started:

- "Create an e-commerce order processing workflow with payment validation and inventory management"
- "Design a machine learning pipeline for data preprocessing, model training, and deployment"
- "Show a software development lifecycle with code review, testing, and deployment stages"
- "Create a customer support ticket resolution flow with escalation paths"
- "Design a user authentication system with login, validation, and session management"

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure both servers are running and CORS is properly configured
2. **API Key Issues**: Verify your GROQ API key is correct and has sufficient credits
3. **Import Errors**: Ensure all dependencies are installed correctly
4. **Export Not Working**: Check browser permissions for clipboard access

### Debug Mode

Enable debug mode by setting `DEBUG=True` in your `.env` file to see detailed error messages.

## 📊 Tech Stack

### Backend
- **Django**: Web framework
- **Django REST Framework**: API development
- **LangChain**: AI integration framework
- **GROQ**: Fast AI inference
- **SQLite**: Database (can be changed to PostgreSQL/MySQL)

### Frontend
- **React**: UI framework
- **Vite**: Build tool
- **ReactFlow**: Diagram visualization
- **Tailwind CSS**: Styling
- **Lucide React**: Icons
- **html2canvas**: Screenshot generation
- **jsPDF**: PDF export

## 🚀 Deployment

### Backend Deployment (Railway/Heroku)

1. Add `gunicorn` to requirements.txt
2. Create `Procfile`: `web: gunicorn flowlang_backend.wsgi`
3. Set environment variables in your hosting platform
4. Update `ALLOWED_HOSTS` in settings.py

### Frontend Deployment (Vercel/Netlify)

1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Update API endpoints to your backend URL

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [ReactFlow](https://reactflow.dev/) for the amazing diagram library
- [GROQ](https://groq.com/) for fast AI inference
- [LangChain](https://langchain.com/) for AI integration tools
- [Tailwind CSS](https://tailwindcss.com/) for beautiful styling

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) section
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

---

Made with ❤️ using React, Django, and AI