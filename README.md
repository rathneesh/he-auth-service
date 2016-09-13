# he-auth-service

# Generate key cert
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 9999

curl -H "Content-Type: application/json" -X POST -d '{"user_info":"xyz","integration_info":"xyz","bot_info":"xyz","url_props": {"ttl": 5}}' -k https://localhost:80/token_urls

curl -k https://localhost:80/token_urls/eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIRV9BVVRIX1NFUlZJQ0VfSVNTVUVSIiwiYXVkIjpbIkhFX0FVVEhfU0VSVklDRV9BVURJRU5DRSJdLCJpYXQiOjE0NzM2NDY5MDkuNzk0LCJqdGkiOiI3Mjc0N2U0Yy1lMzhjLTQyMWUtODhiNi1kNjQ0Y2YzMjI0NzEiLCJib3RfaW5mbyI6Inh5eiIsInVzZXJfaW5mbyI6Inh5eiIsImludGVncmF0aW9uX2luZm8iOiJ4eXoiLCJleHAiOjE0NzM2NDY5MTQuNzk0fQ.Mim5MYUHScOTwBmJBZvdU3DyCtlyr5nYSwPlOZl3tfjHpZJlmCwV2wNuJIZOJKLoT8NFlIBu6AIforwpWvR6zg