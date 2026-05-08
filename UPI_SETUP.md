# UPI Payment Configuration

## Setup Instructions

### 1. Get Your UPI ID
- Contact your bank or payment provider
- Common formats: `name@bankcode` (e.g., `business@okhdfcbank`)
- You can also use: `name@upi` for general UPI

### 2. Update UPI ID in Component

Open `src/components/UPIPayment.jsx` and update line 12:

```javascript
const UPI_ID = 'roshan.enterprises@upi'; // Change this to your actual UPI ID
```

Replace with your actual UPI ID:

```javascript
const UPI_ID = 'your-business-name@bankcode'; // e.g., 'roshan@okhdfcbank'
```

### 3. How It Works

**Option A: Scan QR Code**
- Customer scans the QR code with their UPI app
- Payment request is sent automatically
- Transaction completed in the app

**Option B: Manual Entry**
- Customer copies your UPI ID
- Opens their UPI app
- Manually enters amount and sends
- Enters transaction ID for verification

### 4. Verification

Two verification modes available:

1. **Auto-verify (Recommended)**
   - Transaction ID auto-generated
   - Order marked as "Pending Payment Verification"
   - Admin reviews and confirms payment

2. **Manual Entry**
   - Customer enters transaction reference from their UPI app
   - Found in transaction history with format: `XXXXXXXXXXXXXX`
   - Admin can verify against bank statement

### 5. Order Status Flow

**UPI Payment Flow:**
1. Customer selects UPI at checkout
2. Fills shipping information
3. Sees QR code and UPI ID
4. Makes payment in their UPI app
5. Enters transaction ID (optional)
6. Order created with status: "Pending Payment Verification"
7. Admin verifies payment and updates order status

**Order Status Values:**
- `Pending Payment Verification` - Initial status after UPI payment
- `Confirmed` - Admin verified the payment
- `Processing` - Order is being prepared
- `Shipped` - Order sent to customer
- `Delivered` - Order received

### 6. Database Schema

Orders with UPI payments include additional fields:

```javascript
{
  paymentMethod: 'upi',
  paymentStatus: 'Pending (UPI Payment)',
  paymentData: {
    upiId: 'roshan@okhdfcbank',
    transactionId: 'ABC123XYZ456',  // Customer's transaction ID
    timestamp: '2026-05-08T10:30:00.000Z'
  }
}
```

### 7. Admin Verification

In admin dashboard, orders with pending UPI payments will show:
- UPI ID used for payment
- Transaction ID entered by customer
- Timestamp of payment submission

Admin should:
1. Check bank statement for the transaction
2. Verify amount matches order total
3. Update order status to "Confirmed" once verified

### 8. Testing

**Test UPI ID:** You can use any format for testing in development:
```javascript
const UPI_ID = 'test@upi'; // For development
```

**In Production:** Use your actual business UPI ID:
```javascript
const UPI_ID = 'roshan.enterprises@okhdfcbank'; // Live UPI ID
```

### 9. Security Notes

✅ No payment card details are stored  
✅ No sensitive data in Firestore  
✅ Only transaction reference stored  
✅ Manual verification prevents fraud  
✅ Customer-side QR code generation (safe)  

### 10. Advantages of This Approach

- ✅ **Zero fees** - UPI doesn't charge for peer-to-peer transfers
- ✅ **Simple** - No complex API integration
- ✅ **Fast** - Instant transfers
- ✅ **User-friendly** - Familiar to Indian customers
- ✅ **Flexible** - Two payment methods (QR + Manual)
- ✅ **Secure** - No card details exposed

## Troubleshooting

**QR code not displaying?**
- Check browser console for errors
- Ensure `qrcode.react` is installed: `npm list qrcode.react`

**UPI link not working?**
- Verify UPI ID format is correct
- Test with different UPI app
- Check if UPI app is installed on device

**Payment not recorded?**
- Verify customer entered transaction ID correctly
- Check if order was created in Firestore
- Review browser console for errors

## Support

For UPI-related issues, contact your bank's support or visit:
- https://www.npci.org.in/ (NPCI - UPI operator)
