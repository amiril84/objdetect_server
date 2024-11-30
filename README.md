# Object Detection Server

A Node.js TypeScript backend server that handles object detection processing using TensorFlow.js.

Client repo url : https://github.com/amiril84/objdetect_client

Live website : https://objdetectclient-production.up.railway.app/

## Features

- REST API endpoints for image processing
- Object detection using TensorFlow.js
- TypeScript for type safety
- Environment variable configuration
- CORS support for client integration

## Tech Stack

- Node.js
- Express
- TypeScript
- TensorFlow.js
- Multer for file uploads

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/amiril84/objdetect_server.git
```

2. Install dependencies:
```bash
cd objdetect_server
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit the `.env` file with your configuration.

4. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Building for Production

```bash
npm run build
```

## API Endpoints

### POST /api/detect
Upload an image for object detection

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: Form data with 'image' field containing the image file

**Response:**
```json
{
  "detections": [
    {
      "class": "string",
      "score": number,
      "bbox": [number, number, number, number]
    }
  ]
}
```

## Environment Variables

Required environment variables in `.env`:
```
PORT=3000
ALLOWED_ORIGINS=http://localhost:5173
MODEL_PATH=./models/coco-ssd
```

## Deployment

This server is configured for deployment on Railway. Make sure to set the appropriate environment variables in your Railway dashboard.
