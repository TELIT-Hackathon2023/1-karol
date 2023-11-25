from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from customValidators import validator
from fastapi import HTTPException

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

    return {"code-improvements": descriptions}