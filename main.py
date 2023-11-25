from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi import HTTPException

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    context_data = {"request": request, "message": "Hello, FastAPI and Jinja2!"}
    return templates.TemplateResponse("index.html", {"request": request, **context_data})


@app.post("/process_form")
async def process_form(request: Request):
    form_data = await request.form()
    input_field_value = form_data.get("input_field", "No value provided")

    return {"result": form_data}


