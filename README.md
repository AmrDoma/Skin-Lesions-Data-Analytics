# Skin Lesion Classifer - Biomedical Data Analytics

This repository contains the FastAPI REST API for the Skin Lesions Clinical Decision Support System (CDSS).

<img width="1870" height="1015" alt="image" src="https://github.com/user-attachments/assets/1e45dd49-29b9-4bcd-bd40-7970abe95aad" />

<img width="1307" height="715" alt="image" src="https://github.com/user-attachments/assets/f2f069cb-43a4-44b9-b799-45453d40c5f7" />

The project was developed for our Clinical Decision Support Systems coursework. We broke the system down into three modular services:
• 𝗦𝗲𝗿𝘃𝗶𝗰𝗲 𝟭: Skin Lesion Classification
 A diagnostic module powered by deep learning that takes in lesion images and returns predictions.
• 𝗦𝗲𝗿𝘃𝗶𝗰𝗲 2: User Management System
 Handles sign-up, login, and manages patient images securely.

Using a clean microservice approach, the whole application is modular and scalable by design.

The driving factor for this project was implementing CDSS in a way that can not only improve doctor diagnosis, but also help patients use such a basic tool to get a basic diagnosis.

## Prerequisites

- Python 3.10 or higher installed
- Git installed
- (Optional) Virtual environment tool such as `venv` or `conda`

## Setup

1. Clone the repository and navigate to the backend folder:

   ```bash
   git clone https://github.com/AmrDoma/Skin-Lesions-Data-Analytics.git
   cd Skin-Lesions-Data-Analytics/BackEnd
   pip install -r requirements.txt
   ```

   - This will install all required Python packages listed in `requirements.txt`.

2. Obtain the model

   - You must download the model itself from this link:
     https://drive.google.com/drive/folders/1FKttBSs00msRwlXqtu_8o-Q-rWPrjz2_?usp=sharing
   - Place the model in `BackEnd/LesionsDetector/model`

3. Obtain the `.env` file:

   - You must download or copy the `.env` file containing the environment variables (Cloudinary keys). Sent on Whatsapp
   - Place the `.env` file in the root of the `BackEnd/` directory.

4. Run the development server:

   ```bash
   uvicorn main:app --reload --port 8000
   ```

5. Run the frontend server:

   ```bash
   cd ../FrontEnd
   npm run dev
   ```

The API will be available at `http://127.0.0.1:8000/api/`.

## Environment Variables

The `.env` file should define the following variables:

Backend ENV:

```env
TOGETHER_API_KEY = <api-key>
CLOUDINARY_CLOUD_NAME = <api-key>
CLOUDINARY_API_KEY = <api-key>
CLOUDINARY_API_SECRET = <api-key>
```

Frontend ENV:

VITE_NODE_ENV=DEV
VITE_SERVER_URL=http://localhost:8000

Ensure these are set correctly before starting the server.
