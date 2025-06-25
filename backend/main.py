from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from openai import AzureOpenAI
import os
from dotenv import load_dotenv
import base64
from typing import Optional

# Load env vars
load_dotenv()
AZURE_OAI_ENDPOINT = os.getenv("AZURE_OAI_ENDPOINT")
AZURE_OAI_KEY = os.getenv("AZURE_OAI_KEY")
AZURE_OAI_DEPLOYMENT = os.getenv("AZURE_OAI_DEPLOYMENT")  # This must be GPT-4o

# Init client
client = AzureOpenAI(
    api_key=AZURE_OAI_KEY,
    api_version="2024-02-15-preview",
    azure_endpoint=AZURE_OAI_ENDPOINT
)

app = FastAPI()

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/generate-with-image")
async def generate_test_cases_with_image(
    user_story: str = Form(...),
    screenshot: Optional[UploadFile] = File(None)
):
    if not user_story.lower().startswith("as a"):
        return {"error": "User story must start with 'As a...'"}

    # Base message
    messages = [
        {
            "role": "system",
            "content": "You are a helpful AI Test Case Generator. Generate test cases with title, steps, expected result, priority, and area path."
        },
        {
            "role": "user",
            "content": [{"type": "text", "text": f"The user story is:\n{user_story}"}]
        }
    ]

    # Add image content if screenshot is provided
    if screenshot:
        image_bytes = await screenshot.read()
        image_base64 = base64.b64encode(image_bytes).decode("utf-8")
        messages[1]["content"].append({
            "type": "image_url",
            "image_url": {"url": f"data:image/png;base64,{image_base64}"}
        })

    try:
        response = client.chat.completions.create(
            model=AZURE_OAI_DEPLOYMENT,
            messages=messages,
            max_tokens=1000,
            temperature=0.5
        )
        return {"response": response.choices[0].message.content}
    except Exception as e:
        return {"error": str(e)}
