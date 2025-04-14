# **App Name**: SettleSmart

## Core Features:

- Participant Input: Input form for participants: Allows users to add participants with their ID, bank account status (boolean), and individual purchase amount.
- Payment Calculation and Display: Calculates and displays the distribution of payments. Handles the logic to separate participants, calculate proportions, gross payments, cash received, and net payments according to your algorithm.
- Error Notification: Error handling: Displays an error message if there are no bank participants.
- Output Presentation: Clear output display: Presents the calculated payments for each participant (gross, cash received, net for bank participants; cash contributed for non-bank participants) in a readable format.

## Style Guidelines:

- Primary color: A calming blue (#3498db) for a trustworthy feel.
- Secondary color: A light gray (#f2f2f2) for backgrounds and subtle contrasts.
- Accent: A vibrant green (#2ecc71) to highlight key information like the final payment amounts.
- Use clear and concise labels for all input fields and output values.
- A simple, single-page layout for ease of use.
- Use icons to represent different input fields or payment types.

## Original User Request:
make me a web application in Angular for this algorithm

Here's the algorithm to distribute payments among group members, where some pay via bank and others pay cash:

Input: List of participants, each with:

id: Identifier.

has_bank_account: Boolean indicating if they can pay via bank.

purchase_amount: Their individual purchase amount.

Steps:

Calculate total_purchase as the sum of all purchase_amount.

Separate participants into bank_participants and non_bank_participants.

Calculate bank_purchases as the sum of purchases by bank_participants.

Calculate cash_purchases as the sum of purchases by non_bank_participants.

If bank_purchases is zero, raise an error (cannot distribute cash).

For each bank_participant:

Calculate their proportion as purchase_amount / bank_purchases.

Calculate gross_bank_payment as proportion * total_purchase.

Calculate cash_received as proportion * cash_purchases.

Calculate net_bank_payment as gross_bank_payment - cash_received.

For non_bank_participants, note their cash_contributed as their purchase_amount.

Output: For each participant, display:

Bank participants: gross_bank_payment, cash_received, and net_bank_payment.

Non-bank participants: cash_contributed.

This ensures that the total amount is covered, cash from non-bank participants is distributed proportionally to bank participants based on their purchase ratios, and the net payments reflect the actual amounts transferred after cash redistribution.
  