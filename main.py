from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from customValidators import validator
from fastapi import HTTPException
from openai_api import client
import json

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    context_data = {"request": request, "heading": "Karol - Usability Evaluator"}
    return templates.TemplateResponse("index.html", {"request": request, **context_data})

@app.post("/process_form")
async def process_form(request: Request):
    form_data = await request.form()
    url = form_data.get("url_field", "No value provided");

    if not validator.is_url(url):
        raise HTTPException(400)

    descriptions = validator.validate(url)
    print(descriptions)

    completion = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system",
            "content": "You are skilled in explaining about website usability and you will recieve data resembling python list, where each element is tuple containing count, description and explanation values. I need you to read the description value and generate according explanation value which will be resulting explenation.Return porvided data in JSON, where each element will be object with count, description and explenation"},
            {"role": "user",
            "content": f"data list: {str(descriptions)}"}
        ]
    )

    resp = json.loads(completion.choices[0].message.content)
    resp = [(x['count'], x['description'], x['explanation']) for x in resp]

    return {"code-improvements": resp}
