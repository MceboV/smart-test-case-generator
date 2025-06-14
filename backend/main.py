from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import AsyncAzureOpenAI
from fastapi.middleware.cors import CORSMiddleware
import os
import json

load_dotenv()

azure_oai_endpoint = os.getenv("AZURE_OAI_ENDPOINT")
azure_oai_key = os.getenv("AZURE_OAI_KEY")
azure_oai_deployment = os.getenv("AZURE_OAI_DEPLOYMENT")

client = AsyncAzureOpenAI(
    azure_endpoint=azure_oai_endpoint,
    api_key=azure_oai_key,
    api_version="2024-02-15-preview"
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Prompt(BaseModel):
    user_message: str

@app.post("/generate")
async def generate_test_cases(prompt: Prompt):
    system_text = open("system.txt", encoding="utf8").read().strip()
    user_text = prompt.user_message.strip()

    # Validate user input below
    if not user_text.lower().startswith("as a user"):
        raise HTTPException(
            status_code=400,
            detail="Invalid input format. Please start with 'As a user...'"
        )

    messages = [
        {"role": "system", "content": system_text},
        {"role": "user", "content": user_text},
    ]

    try:
        response = await client.chat.completions.create(
            model=azure_oai_deployment,
            messages=messages,
            temperature=0.7,
            max_tokens=800
        )
        response_text = response.choices[0].message.content.strip()

        try:
            parsed = json.loads(response_text)
            return parsed
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Invalid JSON response from model")

    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))

