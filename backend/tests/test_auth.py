"""
Unit Tests for CivicPulse Authentication
"""

import unittest
from backend.app.core.security import (
    hash_password,
    verify_password,
    normalize_phone,
    validate_password_complexity
)
from backend.app.services.auth_service import UserManager

class TestAuthSecurity(unittest.TestCase):
    def test_password_hashing(self):
        pwd = "SecurePassword@123"
        hashed = hash_password(pwd)
        self.assertTrue(verify_password(pwd, hashed))
        self.assertFalse(verify_password("WrongPassword", hashed))

    def test_phone_normalization(self):
        self.assertEqual(normalize_phone("+91 98765 43210"), "9876543210")
        self.assertEqual(normalize_phone("09876543210"), "9876543210")
        self.assertEqual(normalize_phone("9876-543-210"), "9876543210")

    def test_password_complexity(self):
        self.assertIsNone(validate_password_complexity("ValidPass123!"))
        self.assertIsNotNone(validate_password_complexity("short"))
        self.assertIsNotNone(validate_password_complexity("alllowercase123!"))
        self.assertIsNotNone(validate_password_complexity("ALLUPPERCASE123!"))
        self.assertIsNotNone(validate_password_complexity("NoNumberHere!"))
        self.assertIsNotNone(validate_password_complexity("NoSpecialChar123"))

if __name__ == "__main__":
    unittest.main()

