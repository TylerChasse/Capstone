# Network Analyzer

An educational network packet analyzer with a Python backend and Electron/React frontend.

## Prerequisites

- Python 3.8+
- Node.js 18+
- Wireshark/TShark (required for packet capture)

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/TylerChasse/Capstone.git
cd Capstone
```

### 2. Backend Setup

Install Python dependencies:

```bash
pip install fastapi uvicorn pyshark
```

### 3. Frontend Setup

Install Node.js dependencies:

```bash
cd frontend
npm install
```

## Running the Application

### 1. Start the Backend

From the project root:

```bash
python backend/api.py
```

The API server will start on `http://localhost:8000`.

### 2. Start the Frontend

In a separate terminal, from the `frontend` folder:

```bash
cd frontend
npm start
```

This launches the Electron app with the React UI.

## Notes

- Run the backend before starting the frontend
- Packet capture may require administrator/root privileges
- On Windows, ensure Wireshark is installed and TShark is in your PATH
