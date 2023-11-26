from openai_api import client


def main():
    completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system",
            "content": "You are a poetic assistant, skilled in explaining about website usability."},
            {"role": "user",
            "content": "Complete provided table by replacing 'Not implemented' with explanation how can description from array have impact on website usability "}
        ]
    )

    print(completion.choices[0].message)


if __name__ == "__openai_main__":
    main()
