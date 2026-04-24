# Wasselni API Contracts

This document outlines the API contracts for all buttons and actions in the Wasselni Rider App.

---

## Authentication

### Login Screen - "Continue" Button

**Endpoint:** `POST /api/v1/auth/phone/send`

**Request Body:**
```json
{
  "phone": "+213555123456",
  "country_code": "DZ"
}
```

**Response Codes:**
- `200 OK`: OTP sent successfully
- `400 Bad Request`: Invalid phone number format
- `429 Too Many Requests`: Too many OTP requests, try again later

**Next:** Navigate to OTP Verification Screen

---

### Signup Screen - "Continue" Button

**Endpoint:** `POST /api/v1/auth/phone/send`

**Request Body:**
```json
{
  "phone": "+213555123456",
  "country_code": "DZ"
}
```

**Response Codes:**
- `200 OK`: OTP sent successfully
- `400 Bad Request`: Invalid phone number format
- `429 Too Many Requests`: Too many OTP requests

**Next:** Navigate to OTP Verification Screen

---

### OTP Verification Screen - "Verify" Button

**Endpoint:** `POST /api/v1/auth/phone/verify`

**Request Body:**
```json
{
  "phone": "+213555123456",
  "code": "123456",
  "device_id": "uuid",
  "device_type": "ios"
}
```

**Response Body:**
```json
{
  "access_token": "jwt_token",
  "refresh_token": "refresh_token",
  "user": {
    "id": "usr_001",
    "phone": "+213555123456",
    "name": "Guest User",
    "is_guest": false
  }
}
```

**Response Codes:**
- `200 OK`: Verification successful, tokens returned
- `400 Bad Request`: Invalid or expired OTP
- `401 Unauthorized`: Invalid credentials

**Next:** Navigate to Main (Home) Screen

---

## Ride Flow

### HomeScreen - Search Bar / Location Cards

**Endpoint:** `POST /api/v1/rides/estimate`

**Request Body:**
```json
{
  "pickup": {
    "latitude": 36.7538,
    "longitude": 3.0588,
    "address": "1240 Techwood Drive NW"
  },
  "dropoff": {
    "latitude": 40.6413,
    "longitude": -73.7781,
    "address": "JFK International Airport"
  }
}
```

**Response Body:**
```json
{
  "ride_id": "ride_001",
  "options": [
    {
      "id": "go",
      "name": "Wasselni Go",
      "seats": 4,
      "eta_minutes": 4,
      "price": 4500,
      "original_price": 5200
    },
    {
      "id": "plus",
      "name": "Wasselni Plus",
      "seats": 4,
      "eta_minutes": 2,
      "price": 7200
    }
  ]
}
```

**Response Codes:**
- `200 OK`: Ride options returned
- `400 Bad Request`: Invalid location data
- `404 Not Found`: Service unavailable in area

**Next:** Navigate to Searching Screen

---

### Searching Screen - "Cancel Ride" Button

**Endpoint:** `DELETE /api/v1/rides/{ride_id}`

**Response Codes:**
- `204 No Content`: Ride cancelled successfully
- `404 Not Found`: Ride not found
- `409 Conflict`: Ride already in progress

**Next:** Navigate to Main (Home) Screen

---

### RideOptionsScreen - "Confirm [Option]" Button

**Endpoint:** `POST /api/v1/rides/{ride_id}/confirm`

**Request Body:**
```json
{
  "option_id": "plus",
  "payment_method_id": "card_4921",
  "scheduled_for": null
}
```

**Response Body:**
```json
{
  "driver": {
    "id": "drv_001",
    "name": "Alex",
    "rating": 4.9,
    "vehicle": "Tesla Model 3 • Black",
    "plate": "XYZ 123",
    "photo_url": "https://..."
  },
  "eta_minutes": 4
}
```

**Response Codes:**
- `200 OK`: Driver assigned
- `400 Bad Request`: Invalid option or payment method
- `402 Payment Required`: Payment method declined
- `404 Not Found`: Ride not found

**Next:** Navigate to Driver Found Screen

---

### DriverFoundScreen - "Message" Button

**Endpoint:** `POST /api/v1/rides/{ride_id}/messages`

**Request Body:**
```json
{
  "message": "I'm at the pickup location"
}
```

**Response Codes:**
- `201 Created`: Message sent
- `400 Bad Request`: Invalid message
- `404 Not Found**: Ride not found

---

### DriverFoundScreen - "Call Driver" Button

**Endpoint:** `GET /api/v1/rides/{ride_id}/driver/phone`

**Response Body:**
```json
{
  "masked_phone": "+213 *** ** 56"
}
```

**Response Codes:**
- `200 OK`: Phone number returned
- `404 Not Found`: Ride not found

**Next:** Open native phone dialer

---

### RideTrackingScreen - "Contact" Button

**Endpoint:** `GET /api/v1/rides/{ride_id}/driver/phone`

**Response Codes:**
- `200 OK`: Phone number returned
- `404 Not Found`: Ride not found

**Next:** Open native phone dialer

---

### RideTrackingScreen - "Shield" (Safety) Button

**Endpoint:** `GET /api/v1/rides/{ride_id}/safety`

**Response Body:**
```json
{
  "emergency_contact": "police",
  "share_link": "https://wasselni.dz/share/ride_001"
}
```

**Response Codes:**
- `200 OK`: Safety options returned

---

### RateTripScreen - "Submit Rating" Button

**Endpoint:** `POST /api/v1/rides/{ride_id}/rate`

**Request Body:**
```json
{
  "rating": 5,
  "tip_amount": 1000,
  "compliments": ["clean_car", "expert_nav"],
  "note": "Great ride!"
}
```

**Response Codes:**
- `200 OK`: Rating submitted
- `400 Bad Request`: Invalid rating data
- `404 Not Found`: Ride not found

**Next:** Navigate to Main (Home) Screen

---

## Wallet

### WalletScreen - "Add Funds" Button

**Endpoint:** `POST /api/v1/wallet/topup`

**Request Body:**
```json
{
  "amount": 5000,
  "payment_method_id": "card_4921"
}
```

**Response Body:**
```json
{
  "transaction_id": "txn_001",
  "new_balance": 9250,
  "status": "pending"
}
```

**Response Codes:**
- `201 Created`: Topup initiated
- `400 Bad Request`: Invalid amount
- `402 Payment Required`: Payment declined

---

### WalletScreen - "Withdraw" Button

**Endpoint:** `POST /api/v1/wallet/withdraw`

**Request Body:**
```json
{
  "amount": 2000,
  "destination": "card_4921"
}
```

**Response Codes:**
- `201 Created`: Withdrawal initiated
- `400 Bad Request`: Insufficient balance
- `409 Conflict`: Withdrawal in progress

---

### WalletScreen - "Add New Method" Button

**Endpoint:** `POST /api/v1/payment-methods`

**Request Body:**
```json
{
  "type": "card",
  "token": "stripe_token",
  "make_default": false
}
```

**Response Body:**
```json
{
  "id": "pm_new",
  "type": "card",
  "last4": "4242",
  "is_default": false
}
```

**Response Codes:**
- `201 Created`: Payment method added
- `400 Bad Request`: Invalid token
- `409 Conflict`: Card already exists

---

### WalletScreen - Payment Method Card (Tap)

**Endpoint:** `PUT /api/v1/payment-methods/{id}/default`

**Response Codes:**
- `200 OK`: Default updated
- `404 Not Found`: Payment method not found

---

## Profile

### ProfileGuestScreen - "Sign In / Sign Up" Button

**Endpoint:** N/A (Navigation only)

**Next:** Navigate to Login Screen

---

### ProfileGuestScreen - Locked Cards (Tap)

**Endpoint:** N/A (Navigation only - prompts login)

**Next:** Show login prompt / Navigate to Login Screen

---

## Activity

### ActivityScreen - "Receipt" Button

**Endpoint:** `GET /api/v1/rides/{ride_id}/receipt`

**Response Body:**
```json
{
  "ride_id": "ride_001",
  "pickup": "1240 Techwood Drive NW",
  "dropoff": "JFK International Airport",
  "distance_km": 24.5,
  "duration_minutes": 35,
  "price": 7200,
  "payment_method": "Black Card •••• 4921",
  "driver": {
    "name": "Alex",
    "vehicle": "Tesla Model 3 • Black"
  }
}
```

**Response Codes:**
- `200 OK`: Receipt returned
- `404 Not Found`: Ride not found

**Next:** Show receipt modal / PDF

---

### ActivityScreen - "Details" Button (for canceled rides)

**Endpoint:** `GET /api/v1/rides/{ride_id}`

**Response Codes:**
- `200 OK`: Ride details returned
- `404 Not Found`: Ride not found

**Next:** Show ride details modal

---

## General

### All Screens - Language Change

**Endpoint:** `POST /api/v1/user/language`

**Request Body:**
```json
{
  "language": "ar"
}
```

**Response Codes:**
- `200 OK`: Language updated

---

### All Screens - Error Handling

All API errors should display user-friendly messages:
- `400`: "Invalid request. Please try again."
- `401`: "Session expired. Please log in again."
- `404`: "Resource not found."
- `429`: "Too many requests. Please wait and try again."
- `500`: "Server error. Please try again later."

---

## Status Code Summary

| Code | Meaning |
|------|---------|
| 200 | Success - GET, PUT, DELETE |
| 201 | Created - POST |
| 204 | No Content - DELETE success |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid/missing token |
| 402 | Payment Required |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate/invalid state |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Server Error |
