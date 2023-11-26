import pandas as pd
import os


class TextToCSV:
    def __init__(self, domain):
        # Create a list to store the text files
        self.domain = domain
        self.texts = []

    def remove_newlines(self, serie):
        serie = serie.str.replace('\n', ' ')
        serie = serie.str.replace('\\n', ' ')
        serie = serie.str.replace('  ', ' ')
        serie = serie.str.replace('  ', ' ')
        return serie

    def to_csv(self):
        # Get all the text files in the text directory
        for file in os.listdir("text/" + self.domain + "/"):
            # Open the file and read the text
            with open("text/" + self.domain + "/" + file, "r", encoding="UTF-8") as f:
                text = f.read()

                # Omit the first 11 lines and the last 4 lines, then replace -, _, and #update with spaces.
                self.texts.append((file[11:-4].replace('-', ' ').replace('_', ' ').replace('#update', ''), text))

        # Create a dataframe from the list of texts
        df = pd.DataFrame(self.texts, columns=['fname', 'text'])

        # Set the text column to be the raw text with the newlines removed
        df['text'] = df.fname + ". " + self.remove_newlines(df.text)
        df.to_csv('processed/scraped.csv')
