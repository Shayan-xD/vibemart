import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Button, Card, TextInput, Select, Alert } from 'flowbite-react';
import { HiCreditCard, HiShieldCheck } from 'react-icons/hi';
import { processPayment } from '../features/orderSlice';

const PaymentForm = ({ orderId, amount, onSuccess, onCancel, initialBillingAddress }) => {
  const dispatch = useDispatch();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: '',
    billingAddress: initialBillingAddress || {
      street: '',
      city: '',
      postalCode: '',
      country: ''
    }
  });

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setPaymentData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setPaymentData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const formatCardNumber = (value) => {
    return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiryDate = (value) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d{2})/, '$1/$2').slice(0, 5);
  };

  const validatePaymentData = () => {
    if (paymentMethod === 'credit_card' || paymentMethod === 'debit_card') {
      if (!paymentData.cardNumber || paymentData.cardNumber.replace(/\s/g, '').length < 16) {
        return 'Please enter a valid card number';
      }
      if (!paymentData.expiryDate || paymentData.expiryDate.length < 5) {
        return 'Please enter a valid expiry date (MM/YY)';
      }
      if (!paymentData.cvv || paymentData.cvv.length < 3) {
        return 'Please enter a valid CVV';
      }
      if (!paymentData.cardHolder) {
        return 'Please enter the cardholder name';
      }
      if (!paymentData.billingAddress.street) {
        return 'Please enter a street address';
      }
      if (!paymentData.billingAddress.city) {
        return 'Please enter a city';
      }
      if (!paymentData.billingAddress.postalCode) {
        return 'Please enter a postal code';
      }
      if (!paymentData.billingAddress.country) {
        return 'Please enter a country';
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    setError('');

    const validationError = validatePaymentData();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsProcessing(true);

    try {
      const result = await dispatch(processPayment({
        orderId,
        method: paymentMethod,
        amount,
        ...paymentData
      }));

      if (processPayment.fulfilled.match(result)) {
        onSuccess(result.payload);
      } else {
        setError(result.payload?.error || 'Payment failed. Please try again.');
      }
    } catch (err) {
      setError('Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-md mx-auto"
    >
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <HiCreditCard className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Payment Details</h3>
            <p className="text-gray-600">Amount: ${Number(amount).toFixed(2)}</p>
          </div>
        </div>

        {error && (
          <Alert color="failure" className="mb-4">
            {error}
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <Select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              required
            >
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="paypal">PayPal</option>
            </Select>
          </div>

          {(paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <TextInput
                  type="text"
                  value={paymentData.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  required
                  color={error && paymentData.cardNumber.replace(/\s/g, '').length < 16 ? "failure" : undefined}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <TextInput
                    type="text"
                    value={paymentData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                    color={error && paymentData.expiryDate.length < 5 ? "failure" : undefined}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <TextInput
                    type="text"
                    value={paymentData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                    placeholder="123"
                    maxLength={4}
                    required
                    color={error && paymentData.cvv.length < 3 ? "failure" : undefined}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cardholder Name
                </label>
                <TextInput
                  type="text"
                  value={paymentData.cardHolder}
                  onChange={(e) => handleInputChange('cardHolder', e.target.value)}
                  placeholder="John Doe"
                  required
                  color={error && !paymentData.cardHolder ? "failure" : undefined}
                />
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Billing Address</h4>
                <TextInput
                  placeholder="Street Address"
                  value={paymentData.billingAddress.street}
                  onChange={(e) => handleInputChange('billingAddress.street', e.target.value)}
                  required
                  color={error && !paymentData.billingAddress.street ? "failure" : undefined}
                />
                <div className="grid grid-cols-2 gap-3">
                  <TextInput
                    placeholder="City"
                    value={paymentData.billingAddress.city}
                    onChange={(e) => handleInputChange('billingAddress.city', e.target.value)}
                    required
                    color={error && !paymentData.billingAddress.city ? "failure" : undefined}
                  />
                  <TextInput
                    placeholder="Postal Code"
                    value={paymentData.billingAddress.postalCode}
                    onChange={(e) => handleInputChange('billingAddress.postalCode', e.target.value)}
                    required
                    color={error && !paymentData.billingAddress.postalCode ? "failure" : undefined}
                  />
                </div>
                <TextInput
                  placeholder="Country"
                  value={paymentData.billingAddress.country}
                  onChange={(e) => handleInputChange('billingAddress.country', e.target.value)}
                  required
                  color={error && !paymentData.billingAddress.country ? "failure" : undefined}
                />
              </div>
            </>
          )}

          {paymentMethod === 'paypal' && (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">You will be redirected to PayPal to complete your payment.</p>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <HiShieldCheck className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-600">
            <HiShieldCheck className="w-4 h-4 text-green-500" />
            <span>Your payment information is secure and encrypted</span>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                `Pay $${Number(amount).toFixed(2)}`
              )}
            </Button>
            <Button
              onClick={onCancel}
              color="gray"
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default PaymentForm;