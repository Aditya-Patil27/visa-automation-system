import requests

try:
    res = requests.post("http://localhost:8000/register", json={
        "email": "testuser_1234@test.com",
        "password": "password",
        "role": "admin"
    })
    print("Status:", res.status_code)
    print("Response:", res.text)
except Exception as e:
    print("Error:", e)
