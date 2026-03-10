package com.sssms.portal.util;

import java.time.LocalDate;

/**
 * Utility class to generate default passwords for user accounts.
 * Format: LastName@DDMMYY (e.g., John Doe born 10 Jan 2002 → Doe@100102)
 * - Last name is capitalized (first letter uppercase, rest lowercase)
 * - Date is in DDMMYY format
 */
public class PasswordGeneratorUtil {

    public static String generate(String lastName, LocalDate dob) {
        if (lastName == null || lastName.isBlank() || dob == null) {
            throw new IllegalArgumentException("Last name and date of birth are required for password generation.");
        }

        // Capitalize: first letter uppercase, rest lowercase
        String formattedName = lastName.substring(0, 1).toUpperCase()
                + lastName.substring(1).toLowerCase();

        // Format DOB as DDMMYY
        String dd = String.format("%02d", dob.getDayOfMonth());
        String mm = String.format("%02d", dob.getMonthValue());
        String yy = String.format("%02d", dob.getYear() % 100);

        return formattedName + "@" + dd + mm + yy;
    }
}

