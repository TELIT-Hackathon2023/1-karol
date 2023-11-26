from json import JSONDecodeError

from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from customValidators import validator
from fastapi import HTTPException
from openai_api import client
import json
import tldextract
from crawler import crawl, TextToCSVClass, scrape_html_tags
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
    url = form_data.get("url_field", "No value provided")
    option = form_data.get("user-selection-field", "middle-aged-male-generic")
    persona = {}

    with open("personas/personas.json", 'r') as json_file:
        data = json.load(json_file)
        for dictionary in data:
            if dictionary.get('persona_id') == option:
                persona = dictionary

    if not validator.is_url(url):
        raise HTTPException(400, "Error format for provided url")

    scraped_html = scrape_html_tags(url)

    if not validator.is_url(url):
        raise HTTPException(500, "Unable to scrape and parse html")

    descriptions = validator.validate(url)

    domain = parse_domain(url)
    css_improvements = {domain: []}

    try:
        crawl(url, domain=domain)
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

    completion = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system",
             "content": "You are skilled in explaining about website usability and you will recieve data resembling python list, where each element is tuple containing count, description and explanation values. I need you to read the description value and generate according explanation value which will be resulting explenation.Return provided data in JSON (with keys `improvements` and `semantics`) as array under the key `improvements`, where each element will be object with count, description and explenation"},
            {"role": "user", "content": f"data list: {str(descriptions)}"},
            {"role": "assistant",
             "content": "Now you will receive prettified html structure and you will analyse the structure from the semantics point. Found errors and suggestions will be added to previous JSON result under the key `semantics` in form of object with keys `error` and `suggestion`"},
            {"role": "user", "content": f"html structure:\n\n {str(scraped_html)}"},
        ]
    )

    if completion.choices[0].finish_reason != 'stop':
        raise HTTPException(500, "Too long input for GPT")

    try:
        resp = json.loads(completion.choices[0].message.content)
        print(resp)
    except JSONDecodeError:
        raise HTTPException(500, "Unable to parse GPT response")

    for dictionary in resp['improvements']:
        for key in ['count', 'description', 'explanation']:
            if key not in dictionary:
                raise HTTPException(500, "GPT response was returned in inappropriate format")

    for dictionary in resp['semantics']:
        for key in ['error', 'suggestion']:
            if key not in dictionary:
                raise HTTPException(500, "GPT response was returned in inappropriate format")

    code_improvements = [(x['count'], x['description'], x['explanation']) for x in resp['improvements']]
    semantic_suggestions = [(x['error'], x['suggestion']) for x in resp['semantics']]

    print(resp['semantics'])

    return {"code-improvements": code_improvements,
            "domain": domain,
            "css-tags-improvements": css_improvements,
            "semantic-suggestions": semantic_suggestions}


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
