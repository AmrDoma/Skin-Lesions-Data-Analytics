# Skin Lesion Classifer - CDSS

This repository contains the Django REST API for the Skin Lesions Clinical Decision Support System (CDSS).

<img width="1870" height="1015" alt="image" src="https://github.com/user-attachments/assets/1e45dd49-29b9-4bcd-bd40-7970abe95aad" />

<img width="1307" height="715" alt="image" src="https://github.com/user-attachments/assets/f2f069cb-43a4-44b9-b799-45453d40c5f7" />

The project was developed for our Clinical Decision Support Systems coursework. We broke the system down into three modular services:
• 𝗦𝗲𝗿𝘃𝗶𝗰𝗲 𝟭: Skin Lesion Classification
 A diagnostic module powered by deep learning that takes in lesion images and returns predictions.
• 𝗦𝗲𝗿𝘃𝗶𝗰𝗲 𝟮: AI Medical Chatbot
 An AI chatbot assistant based on Llama 3.3 70B Instruct Turbo prompt engineered to provide users with answers and suggestions based on medical knowledge and predictions.
• 𝗦𝗲𝗿𝘃𝗶𝗰𝗲 𝟯: User Management System
 Handles sign-up, login, and manages patient images securely.

Using a clean microservice approach, the whole application is modular and scalable by design.

The driving factor for this project was implementing CDSS in a way that can not only improve doctor diagnosis, but also help patients use such a basic tool to get a basic diagnosis.


## Prerequisites

- Python 3.8 or higher installed
- Git installed
- (Optional) Virtual environment tool such as `venv` or `conda`

## Setup

1. Clone the repository and navigate to the backend folder:

   ```bash
   git clone https://github.com/Omar-Khaled-19/Skin-Lesions-CDSS.git
   cd Skin-Lesions-CDSS
   "install_requirements.bat"
   ```

   - Before launching, make sure to edit install_requirements.bat to direct the script to Python3.10 directory
   - This will install all required Python packages listed in `requirements.txt`.

2. Obtain the model

   - You must download the model itself from this link:
     https://www.kaggle.com/code/kmader/deep-learning-skin-lesion-classification/output
   - Place the model in `BackEnd/LesionsDetector/model`

3. Obtain the `.env` file:

   - You must download or copy the `.env` file containing the environment variables (TogetherAI and Cloudinary keys). Sent on Whatsapp
   - Place the `.env` file in the root of the `BackEnd/` directory.

4. Apply database migrations:

   ```bash
   python manage.py migrate
   ```

5. Run the development server:

   ```bash
   python manage.py runserver
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
