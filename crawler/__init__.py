from . import HTMLParser
from . import TextToCSV
from . import tokenizer_utils

scrape_html_tags = HTMLParser.scrape_html_tags
crawl = HTMLParser.crawl
TextToCSVClass = TextToCSV.TextToCSV
get_shortened = tokenizer_utils.get_shortened
