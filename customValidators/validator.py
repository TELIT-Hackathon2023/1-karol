import w3c_validator
import validators


def validate(url):
    messages = w3c_validator.validate(url)["messages"]

    description_counts = {}

    for m in messages:
        description = m["message"]
        if description in description_counts:
            description_counts[description] += 1
        else:
            description_counts[description] = 1

    descriptions_with_counts = [(count, desc, "Not implemented") for desc, count in description_counts.items()]

    return descriptions_with_counts


def is_url(url):
    return validators.url(url)

