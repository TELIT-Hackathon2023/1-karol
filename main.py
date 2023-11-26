from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from customValidators import validator
from fastapi import HTTPException
from openai_api import client
import json
import tldextract
from crawler import crawl, TextToCSVClass
import requests

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

    domain = parse_domain(url)
    css_improvements = {domain: []}

    try:
        crawl(url)
        TextToCSVClass(domain).to_csv()
        # Make a GET request to the Express server
        response = requests.get(f'http://localhost:3000/checktags?domain={domain}')
        # Check if the request was successful (status code 200)
        if response.status_code == 200:
            css_improvements = response.json()
        else:
            raise HTTPException(500)

    except requests.RequestException as e:
        print(e)
        raise HTTPException(500)

    # completion = client.chat.completions.create(
    #     model="gpt-4",
    #     messages=[
    #         {"role": "system",
    #          "content": "You are skilled in explaining about website usability and you will recieve data resembling python list, where each element is tuple containing count, description and explanation values. I need you to read the description value and generate according explanation value which will be resulting explenation.Return porvided data in JSON, where each element will be object with count, description and explenation"},
    #         {"role": "user",
    #          "content": f"data list: {str(descriptions)}"}
    #     ]
    # )
    #
    # resp = json.loads(completion.choices[0].message.content)
    # resp = [(x['count'], x['description'], x['explanation']) for x in resp]
    resp = []

    return {"code-improvements": resp,
            "domain": domain,
            "css-tags-improvements": css_improvements}


# UTILITIES
def parse_domain(url):
    extracted = tldextract.extract(url)
    domain = extracted.domain
    suffix = extracted.suffix

    to_return = f"{domain}.{suffix}".rstrip('/')
    if to_return.startswith('https://'):
        to_return = to_return[len('https://'):]
    elif to_return.startswith('http://'):
        to_return = to_return[len('http://'):]

    if to_return.startswith('www.'):
        to_return = to_return[len('www.'):]

    return to_return
