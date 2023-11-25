from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse

app = FastAPI()
templates = Jinja2Templates(directory="templates")


@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    context_data = {"request": request, "message": "Hello, FastAPI and Jinja2!"}
    return templates.TemplateResponse("index.html", {"request": request, **context_data})



