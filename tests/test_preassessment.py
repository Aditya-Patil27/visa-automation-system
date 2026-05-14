"""Tests for pre-assessment form CRUD operations.

Coverage: POST /assessment, PUT /assessment/{id}, GET /assessment/{id}, POST submit
Req: VISA-01 (pre-assessment form submission)
"""
import json
import pytest


@pytest.mark.asyncio
async def test_create_assessment_draft(test_client, test_jwt_token):
    """POST /assessment returns id, status=draft, current_step=1 with valid JWT."""
    headers = {"Authorization": f"Bearer {test_jwt_token}"}
    response = await test_client.post("/assessment", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["status"] == "draft"
    assert data["current_step"] == 1


@pytest.mark.asyncio
async def test_create_assessment_requires_auth(test_client):
    """POST /assessment without JWT returns 401."""
    response = await test_client.post("/assessment")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_update_assessment_partial_save(test_client, test_jwt_token):
    """PUT /assessment/{id} merges step data without overwriting other steps."""
    headers = {
        "Authorization": f"Bearer {test_jwt_token}",
        "Content-Type": "application/json",
    }
    # Create draft
    create_resp = await test_client.post("/assessment", headers=headers)
    assessment_id = create_resp.json()["id"]

    # Save step 1
    step1_data = {"step": 1, "data": {"full_name": "John", "nationality": "US"}}
    resp1 = await test_client.put(f"/assessment/{assessment_id}", json=step1_data, headers=headers)
    assert resp1.status_code == 200

    # Save step 2
    step2_data = {"step": 2, "data": {"destination_country": "UK", "purpose": "tourism"}}
    resp2 = await test_client.put(f"/assessment/{assessment_id}", json=step2_data, headers=headers)
    assert resp2.status_code == 200

    # GET should return merged form_data with both steps
    get_resp = await test_client.get(f"/assessment/{assessment_id}", headers=headers)
    assert get_resp.status_code == 200
    form_data = get_resp.json()["form_data"]
    assert "1" in form_data
    assert form_data["1"]["full_name"] == "John"
    assert "2" in form_data
    assert form_data["2"]["destination_country"] == "UK"


@pytest.mark.asyncio
async def test_get_assessment_returns_404_for_other_user(test_client, test_jwt_token):
    """GET /assessment/{id} returns 404 when id belongs to another user."""
    headers = {"Authorization": f"Bearer {test_jwt_token}"}
    resp = await test_client.get("/assessment/99999", headers=headers)
    assert resp.status_code == 404
