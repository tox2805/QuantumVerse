import requests
import json
import os
from dotenv import load_dotenv
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
load_dotenv()

def get_iam_token(api_key):
    url = "https://iam.cloud.ibm.com/identity/token"
    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {
        "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
        "apikey": api_key
    }
    
    response = requests.post(url, headers=headers, data=data)
    
    if response.status_code == 200:
        access_token = response.json()['access_token']
        print(access_token)
        return access_token
    else:
        raise Exception(f"Failed to get IAM token: {response.status_code} - {response.text}")
    
def get_granite_explanation(question, correct_answer, my_answer):

    api_key = os.getenv("WATSONX_API_KEY")
    iam_token = get_iam_token(api_key)

    url = "https://eu-gb.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29"

    body = {
        "input": f"""<|start_of_role|>user<|end_of_role|>Q: {question}
        Correct: {correct_answer}
        Mine: {my_answer}
        If wrong, explain briefly. Else, say why correct.<|end_of_text|>""",
        "parameters": {
            "decoding_method": "greedy",
            "max_new_tokens": 500,
            "min_new_tokens": 0,
            "repetition_penalty": 1
        },
        "model_id": "ibm/granite-3-8b-instruct",
        "project_id": "ff0e1017-ce7e-4d62-92b5-b905edde6410",
        "moderations": {
            "hap": {
                "input": {
                    "enabled": True,
                    "threshold": 0.5,
                    "mask": {
                        "remove_entity_value": True
                    }
                },
                "output": {
                    "enabled": True,
                    "threshold": 0.5,
                    "mask": {
                        "remove_entity_value": True
                    }
                }
            },
            "pii": {
                "input": {
                    "enabled": True,
                    "threshold": 0.5,
                    "mask": {
                        "remove_entity_value": True
                    }
                },
                "output": {
                    "enabled": True,
                    "threshold": 0.5,
                    "mask": {
                        "remove_entity_value": True
                    }
                }
            }
        }
    }

    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": f"Bearer {iam_token}"
    }

    response = requests.post(
        url,
        headers=headers,
        json=body
    )

    if response.status_code != 200:
        raise Exception("Non-200 response: " + str(response.text))

    data = response.json()
    explanation = data.get('results', [{}])[0].get('generated_text', 'No explanation available.')
    return explanation